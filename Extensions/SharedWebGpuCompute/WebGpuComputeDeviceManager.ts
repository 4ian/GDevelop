/// <reference types="types" />

namespace gdjs {
  export type WebGpuComputeFailureReason =
    | 'webgpu-unavailable'
    | 'webgpu-adapter-unavailable'
    | 'webgpu-device-failed'
    | 'webgpu-limit-insufficient'
    | 'webgpu-device-lost'
    | 'webgpu-submit-failed';

  export class WebGpuComputeError extends Error {
    readonly reason: WebGpuComputeFailureReason;

    constructor(reason: WebGpuComputeFailureReason) {
      super(reason);
      this.reason = reason;
    }
  }

  type WebGpuComputeFailureListener = (
    reason: WebGpuComputeFailureReason
  ) => void;

  /**
   * Owns the single WebGPU compute device used by a RuntimeGame.
   *
   * Feature-specific extensions keep their pipelines and buffers, while this
   * manager centralizes adapter/device acquisition, frame command submission,
   * device-loss reporting and reference-counted disposal.
   */
  export class WebGpuComputeDeviceManager {
    private static _managers = new WeakMap<
      gdjs.RuntimeGame,
      WebGpuComputeDeviceManager
    >();

    static acquire(
      runtimeGame: gdjs.RuntimeGame,
      failureListener: WebGpuComputeFailureListener
    ): WebGpuComputeDeviceManager {
      let manager = WebGpuComputeDeviceManager._managers.get(runtimeGame);
      if (!manager) {
        const gpu =
          typeof navigator !== 'undefined' && navigator.gpu
            ? navigator.gpu
            : null;
        manager = new WebGpuComputeDeviceManager(gpu, () => {
          WebGpuComputeDeviceManager._managers.delete(runtimeGame);
        });
        WebGpuComputeDeviceManager._managers.set(runtimeGame, manager);
      }
      manager._referenceCount++;
      manager._failureListeners.add(failureListener);
      return manager;
    }

    private _gpu: GPU | null;
    private _onFinalRelease: () => void;
    private _referenceCount = 0;
    private _failureListeners = new Set<WebGpuComputeFailureListener>();
    private _initializationPromise: Promise<void> | null = null;
    private _device: GPUDevice | null = null;
    private _commandEncoder: GPUCommandEncoder | null = null;
    private _afterSubmitCallbacks: Array<() => void> = [];
    private _terminalFailure: WebGpuComputeFailureReason | null = null;
    private _disposed = false;

    constructor(gpu: GPU | null, onFinalRelease: () => void = () => {}) {
      this._gpu = gpu;
      this._onFinalRelease = onFinalRelease;
    }

    addFailureListener(listener: WebGpuComputeFailureListener): void {
      this._failureListeners.add(listener);
    }

    removeFailureListener(listener: WebGpuComputeFailureListener): void {
      this._failureListeners.delete(listener);
    }

    initialize(): Promise<void> {
      if (this._initializationPromise) return this._initializationPromise;
      this._initializationPromise = this._initialize().catch((error) => {
        const reason =
          error instanceof gdjs.WebGpuComputeError
            ? error.reason
            : 'webgpu-device-failed';
        this._notifyFailure(reason);
        throw new gdjs.WebGpuComputeError(reason);
      });
      return this._initializationPromise;
    }

    private async _initialize(): Promise<void> {
      if (!this._gpu) {
        throw new gdjs.WebGpuComputeError('webgpu-unavailable');
      }
      let adapter: GPUAdapter | null;
      try {
        adapter = await this._gpu.requestAdapter();
      } catch (_error) {
        throw new gdjs.WebGpuComputeError('webgpu-adapter-unavailable');
      }
      if (!adapter) {
        throw new gdjs.WebGpuComputeError('webgpu-adapter-unavailable');
      }
      if (
        adapter.limits.maxComputeWorkgroupSizeX < 64 ||
        adapter.limits.maxComputeInvocationsPerWorkgroup < 64 ||
        adapter.limits.maxStorageBuffersPerShaderStage < 8
      ) {
        throw new gdjs.WebGpuComputeError('webgpu-limit-insufficient');
      }

      let device: GPUDevice;
      try {
        device = await adapter.requestDevice({
          requiredLimits: { maxStorageBuffersPerShaderStage: 8 },
        });
      } catch (_error) {
        throw new gdjs.WebGpuComputeError('webgpu-device-failed');
      }
      if (this._disposed) {
        device.destroy();
        throw new gdjs.WebGpuComputeError('webgpu-device-failed');
      }
      this._device = device;
      device.lost
        .then(() => this._notifyFailure('webgpu-device-lost'))
        .catch(() => this._notifyFailure('webgpu-device-lost'));
    }

    get device(): GPUDevice {
      if (!this._device || this._terminalFailure) {
        throw new gdjs.WebGpuComputeError(
          this._terminalFailure || 'webgpu-device-failed'
        );
      }
      return this._device;
    }

    beginFrame(): void {
      if (this._disposed || this._terminalFailure) return;
      this._commandEncoder = null;
      this._afterSubmitCallbacks.length = 0;
    }

    getCommandEncoder(label = 'GDevelop WebGPU compute frame'): GPUCommandEncoder {
      if (!this._commandEncoder) {
        this._commandEncoder = this.device.createCommandEncoder({ label });
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

    private _notifyFailure(reason: WebGpuComputeFailureReason): void {
      if (this._terminalFailure) return;
      this._terminalFailure = reason;
      this._commandEncoder = null;
      this._afterSubmitCallbacks.length = 0;
      this._failureListeners.forEach((listener) => listener(reason));
    }

    release(failureListener: WebGpuComputeFailureListener): void {
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
    }
  }
}
