/// <reference types="@webgpu/types" />

namespace gdjs {
  export const clothSimulationWgsl = /* wgsl */ `
struct Spring {
  first: u32,
  second: u32,
  restLength: f32,
  padding: f32,
}

struct Parameters {
  counts: vec4<u32>,
  values: vec4<f32>,
  acceleration: vec4<f32>,
  sphere: vec4<f32>,
}

@group(0) @binding(0) var<storage, read_write> positions: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read_write> previousPositions: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> springs: array<Spring>;
@group(0) @binding(3) var<storage, read_write> corrections: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read> particleData: array<vec4<u32>>;
@group(0) @binding(5) var<storage, read> adjacency: array<u32>;
@group(0) @binding(6) var<storage, read> pinTargets: array<vec4<f32>>;
@group(0) @binding(7) var<uniform> parameters: Parameters;

@compute @workgroup_size(64)
fn springMain(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let springIndex = globalId.x;
  if (springIndex >= parameters.counts.y) { return; }
  let spring = springs[springIndex];
  let delta = positions[spring.second].xyz - positions[spring.first].xyz;
  let distance = max(length(delta), 0.000001);
  let scale = 0.5 * parameters.values.x * (distance - spring.restLength) / distance;
  corrections[springIndex] = vec4<f32>(delta * scale, 0.0);
}

@compute @workgroup_size(64)
fn particleMain(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let particleIndex = globalId.x;
  if (particleIndex >= parameters.counts.x) { return; }
  let data = particleData[particleIndex];
  if (data.x != 0u) {
    positions[particleIndex] = pinTargets[particleIndex];
    previousPositions[particleIndex] = pinTargets[particleIndex];
    return;
  }

  var springDelta = vec3<f32>(0.0);
  for (var adjacencyIndex = data.z; adjacencyIndex < data.z + data.y; adjacencyIndex++) {
    let encoded = adjacency[adjacencyIndex];
    let correction = corrections[encoded >> 1u].xyz;
    springDelta += select(correction, -correction, (encoded & 1u) != 0u);
  }

  let current = positions[particleIndex].xyz;
  let previous = previousPositions[particleIndex].xyz;
  var predicted = current + (current - previous) * parameters.values.y +
    springDelta + parameters.acceleration.xyz * parameters.values.z;

  let radius = parameters.sphere.w;
  if (parameters.counts.z != 0u && radius > 0.0) {
    var sphereDelta = predicted - parameters.sphere.xyz;
    var sphereDistance = length(sphereDelta);
    if (sphereDistance < radius) {
      if (sphereDistance < 0.000001) {
        sphereDelta = current - previous;
        sphereDistance = length(sphereDelta);
        if (sphereDistance < 0.000001) {
          sphereDelta = vec3<f32>(0.0, 0.0, 1.0);
          sphereDistance = 1.0;
        }
      }
      predicted = parameters.sphere.xyz + sphereDelta * (radius / sphereDistance);
    }
  }
  previousPositions[particleIndex] = vec4<f32>(current, 1.0);
  positions[particleIndex] = vec4<f32>(predicted, 1.0);
}
`;

  export class ClothWebGpuError extends Error {
    readonly reason: ClothFallbackReason;

    constructor(reason: ClothFallbackReason) {
      super(reason);
      this.reason = reason;
    }
  }

  type WebGpuFailureListener = (reason: ClothFallbackReason) => void;

  export class WebGpuClothDeviceManager {
    private static _managers = new WeakMap<
      gdjs.RuntimeGame,
      WebGpuClothDeviceManager
    >();

    static acquire(
      runtimeGame: gdjs.RuntimeGame,
      failureListener: WebGpuFailureListener
    ): WebGpuClothDeviceManager {
      let manager = WebGpuClothDeviceManager._managers.get(runtimeGame);
      if (!manager) {
        const gpu =
          typeof navigator !== 'undefined' && navigator.gpu
            ? navigator.gpu
            : null;
        manager = new WebGpuClothDeviceManager(gpu, () => {
          WebGpuClothDeviceManager._managers.delete(runtimeGame);
        });
        WebGpuClothDeviceManager._managers.set(runtimeGame, manager);
      }
      manager._referenceCount++;
      manager._failureListeners.add(failureListener);
      return manager;
    }

    private _gpu: GPU | null;
    private _onFinalRelease: () => void;
    private _referenceCount = 0;
    private _failureListeners = new Set<WebGpuFailureListener>();
    private _initializationPromise: Promise<void> | null = null;
    private _device: GPUDevice | null = null;
    private _springPipeline: GPUComputePipeline | null = null;
    private _particlePipeline: GPUComputePipeline | null = null;
    private _commandEncoder: GPUCommandEncoder | null = null;
    private _afterSubmitCallbacks: Array<() => void> = [];
    private _terminalFailure: ClothFallbackReason | null = null;
    private _disposed = false;

    constructor(gpu: GPU | null, onFinalRelease: () => void = () => {}) {
      this._gpu = gpu;
      this._onFinalRelease = onFinalRelease;
    }

    initialize(): Promise<void> {
      if (this._initializationPromise) return this._initializationPromise;
      this._initializationPromise = this._initialize().catch(error => {
        const reason =
          error instanceof ClothWebGpuError
            ? error.reason
            : 'webgpu-device-failed';
        this._notifyFailure(reason);
        throw new ClothWebGpuError(reason);
      });
      return this._initializationPromise;
    }

    private async _initialize(): Promise<void> {
      if (!this._gpu) throw new ClothWebGpuError('webgpu-unavailable');
      let adapter: GPUAdapter | null;
      try {
        adapter = await this._gpu.requestAdapter();
      } catch (_error) {
        throw new ClothWebGpuError('webgpu-adapter-unavailable');
      }
      if (!adapter) {
        throw new ClothWebGpuError('webgpu-adapter-unavailable');
      }
      if (
        adapter.limits.maxComputeWorkgroupSizeX < 64 ||
        adapter.limits.maxComputeInvocationsPerWorkgroup < 64 ||
        adapter.limits.maxStorageBuffersPerShaderStage < 7
      ) {
        throw new ClothWebGpuError('webgpu-limit-insufficient');
      }

      let device: GPUDevice;
      try {
        device = await adapter.requestDevice({
          requiredLimits: {
            maxStorageBuffersPerShaderStage: 7,
          },
        });
      } catch (_error) {
        throw new ClothWebGpuError('webgpu-device-failed');
      }
      if (this._disposed) {
        device.destroy();
        throw new ClothWebGpuError('webgpu-device-failed');
      }
      this._device = device;
      device.lost
        .then(() => this._notifyFailure('webgpu-device-lost'))
        .catch(() => this._notifyFailure('webgpu-device-lost'));

      try {
        if (device.pushErrorScope) device.pushErrorScope('validation');
        const module = device.createShaderModule({
          label: 'GDevelop cloth simulation shader',
          code: clothSimulationWgsl,
        });
        this._springPipeline = device.createComputePipeline({
          label: 'GDevelop cloth spring pipeline',
          layout: 'auto',
          compute: { module, entryPoint: 'springMain' },
        });
        this._particlePipeline = device.createComputePipeline({
          label: 'GDevelop cloth particle pipeline',
          layout: 'auto',
          compute: { module, entryPoint: 'particleMain' },
        });
        if (device.popErrorScope) {
          const error = await device.popErrorScope();
          if (error) throw new ClothWebGpuError('webgpu-pipeline-failed');
        }
      } catch (error) {
        if (device.popErrorScope) {
          device.popErrorScope().catch(() => {});
        }
        if (error instanceof ClothWebGpuError) throw error;
        throw new ClothWebGpuError('webgpu-pipeline-failed');
      }
    }

    get device(): GPUDevice {
      if (!this._device || this._terminalFailure) {
        throw new ClothWebGpuError(
          this._terminalFailure || 'webgpu-device-failed'
        );
      }
      return this._device;
    }

    get springPipeline(): GPUComputePipeline {
      if (!this._springPipeline) {
        throw new ClothWebGpuError('webgpu-pipeline-failed');
      }
      return this._springPipeline;
    }

    get particlePipeline(): GPUComputePipeline {
      if (!this._particlePipeline) {
        throw new ClothWebGpuError('webgpu-pipeline-failed');
      }
      return this._particlePipeline;
    }

    beginFrame(): void {
      if (this._disposed || this._terminalFailure) return;
      this._commandEncoder = null;
      this._afterSubmitCallbacks.length = 0;
    }

    getCommandEncoder(): GPUCommandEncoder {
      if (!this._commandEncoder) {
        this._commandEncoder = this.device.createCommandEncoder({
          label: 'GDevelop cloth frame commands',
        });
      }
      return this._commandEncoder;
    }

    afterSubmit(callback: () => void): void {
      this._afterSubmitCallbacks.push(callback);
    }

    endFrame(): void {
      const commandEncoder = this._commandEncoder;
      this._commandEncoder = null;
      if (!commandEncoder) return;
      try {
        this.device.queue.submit([commandEncoder.finish()]);
      } catch (_error) {
        this._afterSubmitCallbacks.length = 0;
        this._notifyFailure('webgpu-submit-failed');
        return;
      }
      const callbacks = this._afterSubmitCallbacks.slice();
      this._afterSubmitCallbacks.length = 0;
      for (let index = 0; index < callbacks.length; index++) callbacks[index]();
    }

    private _notifyFailure(reason: ClothFallbackReason): void {
      if (this._terminalFailure) return;
      this._terminalFailure = reason;
      this._commandEncoder = null;
      this._afterSubmitCallbacks.length = 0;
      this._failureListeners.forEach(listener => listener(reason));
    }

    release(failureListener: WebGpuFailureListener): void {
      this._failureListeners.delete(failureListener);
      if (this._referenceCount > 0) this._referenceCount--;
      if (this._referenceCount !== 0) return;
      this.dispose();
      this._onFinalRelease();
    }

    dispose(): void {
      if (this._disposed) return;
      this._disposed = true;
      this._commandEncoder = null;
      this._afterSubmitCallbacks.length = 0;
      this._failureListeners.clear();
      if (this._device) this._device.destroy();
      this._device = null;
      this._springPipeline = null;
      this._particlePipeline = null;
    }
  }
}
