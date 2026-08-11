/// <reference types="types" />

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
@group(0) @binding(6) var<storage, read_write> pinTargets: array<vec4<f32>>;
@group(0) @binding(7) var<uniform> parameters: Parameters;
@group(0) @binding(8) var<storage, read_write> pinCommands: array<u32>;

@compute @workgroup_size(64)
fn pinMain(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let particleIndex = globalId.x;
  if (particleIndex >= parameters.counts.x) { return; }
  let command = pinCommands[particleIndex];
  if (command == 1u) {
    pinTargets[particleIndex] = positions[particleIndex];
    previousPositions[particleIndex] = positions[particleIndex];
  } else if (command == 2u) {
    previousPositions[particleIndex] = positions[particleIndex];
  } else if (command == 3u) {
    positions[particleIndex] = pinTargets[particleIndex];
    previousPositions[particleIndex] = pinTargets[particleIndex];
  }
  pinCommands[particleIndex] = 0u;
}

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
        manager = new WebGpuClothDeviceManager(
          null,
          () => {
            WebGpuClothDeviceManager._managers.delete(runtimeGame);
          },
          runtimeGame
        );
        WebGpuClothDeviceManager._managers.set(runtimeGame, manager);
      }
      manager._referenceCount++;
      manager._failureListeners.add(failureListener);
      return manager;
    }

    private _computeManager: gdjs.WebGpuComputeDeviceManager;
    private _usesSharedManager: boolean;
    private _onFinalRelease: () => void;
    private _referenceCount = 0;
    private _failureListeners = new Set<WebGpuFailureListener>();
    private _initializationPromise: Promise<void> | null = null;
    private _springPipeline: GPUComputePipeline | null = null;
    private _particlePipeline: GPUComputePipeline | null = null;
    private _pinPipeline: GPUComputePipeline | null = null;
    private _bindGroupLayout: GPUBindGroupLayout | null = null;
    private _terminalFailure: ClothFallbackReason | null = null;
    private _disposed = false;
    private _onComputeFailure = (
      reason: gdjs.WebGpuComputeFailureReason
    ): void => {
      this._notifyFailure(reason as ClothFallbackReason);
    };

    constructor(
      gpu: GPU | null,
      onFinalRelease: () => void = () => {},
      runtimeGame: gdjs.RuntimeGame | null = null
    ) {
      this._usesSharedManager = !!runtimeGame;
      this._computeManager = runtimeGame
        ? gdjs.WebGpuComputeDeviceManager.acquire(
            runtimeGame,
            this._onComputeFailure
          )
        : new gdjs.WebGpuComputeDeviceManager(gpu);
      if (!runtimeGame) {
        this._computeManager.addFailureListener(this._onComputeFailure);
      }
      this._onFinalRelease = onFinalRelease;
    }

    initialize(): Promise<void> {
      if (this._initializationPromise) return this._initializationPromise;
      this._initializationPromise = this._initialize().catch((error) => {
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
      try {
        await this._computeManager.initialize();
      } catch (error) {
        throw new ClothWebGpuError(
          error instanceof gdjs.WebGpuComputeError
            ? (error.reason as ClothFallbackReason)
            : 'webgpu-device-failed'
        );
      }
      if (this._disposed) {
        throw new ClothWebGpuError('webgpu-device-failed');
      }
      const device = this._computeManager.device;

      try {
        if (device.pushErrorScope) device.pushErrorScope('validation');
        const module = device.createShaderModule({
          label: 'GDevelop cloth simulation shader',
          code: clothSimulationWgsl,
        });
        const computeVisibility =
          typeof GPUShaderStage !== 'undefined' ? GPUShaderStage.COMPUTE : 4;
        this._bindGroupLayout = device.createBindGroupLayout({
          label: 'GDevelop cloth bind group layout',
          entries: [
            {
              binding: 0,
              visibility: computeVisibility,
              buffer: { type: 'storage' },
            },
            {
              binding: 1,
              visibility: computeVisibility,
              buffer: { type: 'storage' },
            },
            {
              binding: 2,
              visibility: computeVisibility,
              buffer: { type: 'read-only-storage' },
            },
            {
              binding: 3,
              visibility: computeVisibility,
              buffer: { type: 'storage' },
            },
            {
              binding: 4,
              visibility: computeVisibility,
              buffer: { type: 'read-only-storage' },
            },
            {
              binding: 5,
              visibility: computeVisibility,
              buffer: { type: 'read-only-storage' },
            },
            {
              binding: 6,
              visibility: computeVisibility,
              buffer: { type: 'storage' },
            },
            {
              binding: 7,
              visibility: computeVisibility,
              buffer: { type: 'uniform' },
            },
            {
              binding: 8,
              visibility: computeVisibility,
              buffer: { type: 'storage' },
            },
          ],
        });
        const pipelineLayout = device.createPipelineLayout({
          label: 'GDevelop cloth pipeline layout',
          bindGroupLayouts: [this._bindGroupLayout],
        });
        this._springPipeline = device.createComputePipeline({
          label: 'GDevelop cloth spring pipeline',
          layout: pipelineLayout,
          compute: { module, entryPoint: 'springMain' },
        });
        this._particlePipeline = device.createComputePipeline({
          label: 'GDevelop cloth particle pipeline',
          layout: pipelineLayout,
          compute: { module, entryPoint: 'particleMain' },
        });
        this._pinPipeline = device.createComputePipeline({
          label: 'GDevelop cloth pin pipeline',
          layout: pipelineLayout,
          compute: { module, entryPoint: 'pinMain' },
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
      if (this._terminalFailure) {
        throw new ClothWebGpuError(
          this._terminalFailure || 'webgpu-device-failed'
        );
      }
      try {
        return this._computeManager.device;
      } catch (error) {
        throw new ClothWebGpuError(
          error instanceof gdjs.WebGpuComputeError
            ? (error.reason as ClothFallbackReason)
            : 'webgpu-device-failed'
        );
      }
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

    get pinPipeline(): GPUComputePipeline {
      if (!this._pinPipeline) {
        throw new ClothWebGpuError('webgpu-pipeline-failed');
      }
      return this._pinPipeline;
    }

    get bindGroupLayout(): GPUBindGroupLayout {
      if (!this._bindGroupLayout) {
        throw new ClothWebGpuError('webgpu-pipeline-failed');
      }
      return this._bindGroupLayout;
    }

    beginFrame(): void {
      if (this._disposed || this._terminalFailure) return;
      this._computeManager.beginFrame();
    }

    getCommandEncoder(): GPUCommandEncoder {
      return this._computeManager.getCommandEncoder(
        'GDevelop cloth frame commands'
      );
    }

    afterSubmit(callback: () => void): void {
      this._computeManager.afterSubmit(callback);
    }

    endFrame(): void {
      this._computeManager.endFrame();
    }

    private _notifyFailure(reason: ClothFallbackReason): void {
      if (this._terminalFailure) return;
      this._terminalFailure = reason;
      this._failureListeners.forEach((listener) => listener(reason));
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
      this._failureListeners.clear();
      if (this._usesSharedManager) {
        this._computeManager.release(this._onComputeFailure);
      } else {
        this._computeManager.removeFailureListener(this._onComputeFailure);
        this._computeManager.dispose();
      }
      this._springPipeline = null;
      this._particlePipeline = null;
      this._pinPipeline = null;
      this._bindGroupLayout = null;
    }
  }
}
