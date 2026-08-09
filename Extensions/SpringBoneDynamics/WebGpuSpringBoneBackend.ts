/// <reference types="types" />

namespace gdjs {
  type SpringBoneReadbackSlot = {
    buffer: GPUBuffer;
    busy: boolean;
    sequence: number;
    epoch: number;
  };

  const storageUsage = (): number =>
    typeof GPUBufferUsage !== 'undefined' ? GPUBufferUsage.STORAGE : 128;
  const copySourceUsage = (): number =>
    typeof GPUBufferUsage !== 'undefined' ? GPUBufferUsage.COPY_SRC : 4;
  const copyDestinationUsage = (): number =>
    typeof GPUBufferUsage !== 'undefined' ? GPUBufferUsage.COPY_DST : 8;
  const uniformUsage = (): number =>
    typeof GPUBufferUsage !== 'undefined' ? GPUBufferUsage.UNIFORM : 64;
  const mapReadUsage = (): number =>
    typeof GPUBufferUsage !== 'undefined' ? GPUBufferUsage.MAP_READ : 1;
  const mapReadMode = (): number =>
    typeof GPUMapMode !== 'undefined' ? GPUMapMode.READ : 1;

  const stateToVec4 = (values: Float32Array): Float32Array => {
    const result = new Float32Array((values.length / 3) * 4);
    for (let index = 0; index < values.length / 3; index++) {
      result[index * 4] = values[index * 3];
      result[index * 4 + 1] = values[index * 3 + 1];
      result[index * 4 + 2] = values[index * 3 + 2];
      result[index * 4 + 3] = 1;
    }
    return result;
  };

  export class WebGpuSpringBoneBackend implements SpringBoneBackend {
    readonly kind: SpringBoneBackendKind = 'WebGPU';
    private _manager: gdjs.WebGpuComputeDeviceManager;
    private _configuration: SpringBoneConfiguration;
    private _onFailure: (reason: SpringBoneFallbackReason) => void;
    private _pipeline: GPUComputePipeline;
    private _bindGroup: GPUBindGroup;
    private _positionBuffer: GPUBuffer;
    private _previousPositionBuffer: GPUBuffer;
    private _targetBuffer: GPUBuffer;
    private _chainBuffer: GPUBuffer;
    private _colliderBuffer: GPUBuffer;
    private _uniformBuffer: GPUBuffer;
    private _readbackSlots: SpringBoneReadbackSlot[] = [];
    private _targetVec4: Float32Array;
    private _colliderBytes: ArrayBuffer;
    private _uniformBytes = new ArrayBuffer(48);
    private _latestPositions: Float32Array;
    private _latestPreviousPositions: Float32Array;
    private _latestSnapshot: SpringBoneSimulationSnapshot | null = null;
    private _readbackEpoch = 0;
    private _disposed = false;
    private _failureReported = false;
    private _gravityScale = 1;
    private _windX = 0;
    private _windY = 0;
    private _windZ = 0;

    static create(
      manager: gdjs.WebGpuComputeDeviceManager,
      configuration: SpringBoneConfiguration,
      state: SpringBoneSimulationState,
      onFailure: (reason: SpringBoneFallbackReason) => void
    ): WebGpuSpringBoneBackend {
      return new gdjs.WebGpuSpringBoneBackend(
        manager,
        configuration,
        state,
        onFailure
      );
    }

    private constructor(
      manager: gdjs.WebGpuComputeDeviceManager,
      configuration: SpringBoneConfiguration,
      state: SpringBoneSimulationState,
      onFailure: (reason: SpringBoneFallbackReason) => void
    ) {
      this._manager = manager;
      this._configuration = configuration;
      this._onFailure = onFailure;
      this._latestPositions = state.positions.slice();
      this._latestPreviousPositions = state.previousPositions.slice();
      this._targetVec4 = stateToVec4(state.positions);
      this._colliderBytes = new ArrayBuffer(
        Math.max(1, configuration.colliders.length) * 48
      );

      const device = manager.device;
      const pointBytes = configuration.pointCount * 16;
      const usage = storageUsage() | copySourceUsage() | copyDestinationUsage();
      this._positionBuffer = device.createBuffer({
        label: 'GDevelop spring bone positions',
        size: pointBytes,
        usage,
      });
      this._previousPositionBuffer = device.createBuffer({
        label: 'GDevelop spring bone previous positions',
        size: pointBytes,
        usage,
      });
      this._targetBuffer = device.createBuffer({
        label: 'GDevelop spring bone targets',
        size: pointBytes,
        usage: storageUsage() | copyDestinationUsage(),
      });
      this._chainBuffer = device.createBuffer({
        label: 'GDevelop spring bone chains',
        size: configuration.chains.length * 48,
        usage: storageUsage() | copyDestinationUsage(),
      });
      this._colliderBuffer = device.createBuffer({
        label: 'GDevelop spring bone colliders',
        size: this._colliderBytes.byteLength,
        usage: storageUsage() | copyDestinationUsage(),
      });
      this._uniformBuffer = device.createBuffer({
        label: 'GDevelop spring bone parameters',
        size: this._uniformBytes.byteLength,
        usage: uniformUsage() | copyDestinationUsage(),
      });
      for (let index = 0; index < 3; index++) {
        this._readbackSlots.push({
          buffer: device.createBuffer({
            label: `GDevelop spring bone readback ${index}`,
            size: pointBytes * 2,
            usage: mapReadUsage() | copyDestinationUsage(),
          }),
          busy: false,
          sequence: 0,
          epoch: 0,
        });
      }

      const module = device.createShaderModule({
        label: 'GDevelop spring bone simulation shader',
        code: gdjs.springBoneDynamicsWgsl,
      });
      this._pipeline = device.createComputePipeline({
        label: 'GDevelop spring bone simulation pipeline',
        layout: 'auto',
        compute: { module, entryPoint: 'simulateMain' },
      });
      this._bindGroup = device.createBindGroup({
        label: 'GDevelop spring bone bind group',
        layout: this._pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: this._positionBuffer } },
          { binding: 1, resource: { buffer: this._previousPositionBuffer } },
          { binding: 2, resource: { buffer: this._targetBuffer } },
          { binding: 3, resource: { buffer: this._chainBuffer } },
          { binding: 4, resource: { buffer: this._colliderBuffer } },
          { binding: 5, resource: { buffer: this._uniformBuffer } },
        ],
      });
      this._uploadStaticData();
      this.reset(state);
    }

    private _uploadStaticData(): void {
      const chainBytes = new ArrayBuffer(this._configuration.chains.length * 48);
      const view = new DataView(chainBytes);
      let pointStart = 0;
      for (let index = 0; index < this._configuration.chains.length; index++) {
        const chain = this._configuration.chains[index];
        const offset = index * 48;
        view.setUint32(offset, pointStart, true);
        view.setUint32(offset + 4, chain.bones.length, true);
        view.setUint32(offset + 8, chain.collisionStartPoint, true);
        view.setUint32(offset + 12, chain.collisionPointCount, true);
        view.setFloat32(offset + 16, chain.damping, true);
        view.setFloat32(offset + 20, chain.stiffness, true);
        view.setFloat32(offset + 24, chain.maxAngleRadians, true);
        view.setFloat32(offset + 28, chain.collisionMargin, true);
        view.setFloat32(offset + 32, chain.gravityX, true);
        view.setFloat32(offset + 36, chain.gravityY, true);
        view.setFloat32(offset + 40, chain.gravityZ, true);
        pointStart += chain.bones.length;
      }
      this._manager.device.queue.writeBuffer(this._chainBuffer, 0, chainBytes);
    }

    setFrameData(frameData: SpringBoneFrameData): void {
      if (this._disposed) return;
      this._targetVec4 = stateToVec4(frameData.targets);
      this._gravityScale = frameData.gravityScale;
      this._windX = frameData.windX;
      this._windY = frameData.windY;
      this._windZ = frameData.windZ;
      const view = new DataView(this._colliderBytes);
      for (let index = 0; index < this._configuration.colliders.length; index++) {
        const sourceOffset = index * 8;
        const offset = index * 48;
        view.setFloat32(offset, frameData.colliderWorldData[sourceOffset], true);
        view.setFloat32(offset + 4, frameData.colliderWorldData[sourceOffset + 1], true);
        view.setFloat32(offset + 8, frameData.colliderWorldData[sourceOffset + 2], true);
        view.setFloat32(offset + 12, frameData.colliderWorldData[sourceOffset + 3], true);
        view.setFloat32(offset + 16, frameData.colliderWorldData[sourceOffset + 4], true);
        view.setFloat32(offset + 20, frameData.colliderWorldData[sourceOffset + 5], true);
        view.setFloat32(offset + 24, frameData.colliderWorldData[sourceOffset + 6], true);
        view.setFloat32(offset + 28, frameData.colliderWorldData[sourceOffset + 7], true);
        view.setUint32(
          offset + 32,
          this._configuration.colliders[index].chainMask,
          true
        );
      }
      try {
        const queue = this._manager.device.queue;
        queue.writeBuffer(this._targetBuffer, 0, this._targetVec4);
        if (this._configuration.colliders.length > 0) {
          queue.writeBuffer(this._colliderBuffer, 0, this._colliderBytes);
        }
      } catch (_error) {
        this._fail('webgpu-submit-failed');
      }
    }

    step(fixedDeltaSeconds: number): void {
      if (this._disposed) return;
      const view = new DataView(this._uniformBytes);
      view.setFloat32(0, fixedDeltaSeconds * fixedDeltaSeconds, true);
      view.setFloat32(4, this._gravityScale, true);
      view.setFloat32(16, this._windX, true);
      view.setFloat32(20, this._windY, true);
      view.setFloat32(24, this._windZ, true);
      view.setUint32(32, this._configuration.chains.length, true);
      view.setUint32(36, this._configuration.colliders.length, true);
      try {
        this._manager.device.queue.writeBuffer(
          this._uniformBuffer,
          0,
          this._uniformBytes
        );
        const pass = this._manager
          .getCommandEncoder('GDevelop spring bone frame commands')
          .beginComputePass({ label: 'GDevelop spring bone simulation pass' });
        pass.setPipeline(this._pipeline);
        pass.setBindGroup(0, this._bindGroup);
        pass.dispatchWorkgroups(this._configuration.chains.length);
        pass.end();
      } catch (_error) {
        this._fail('webgpu-submit-failed');
      }
    }

    requestSnapshot(sequence: number): void {
      if (this._disposed) return;
      const slot = this._readbackSlots.find((candidate) => !candidate.busy);
      if (!slot) return;
      slot.busy = true;
      slot.sequence = sequence;
      slot.epoch = this._readbackEpoch;
      try {
        const stateBytes = this._configuration.pointCount * 16;
        const encoder = this._manager.getCommandEncoder(
          'GDevelop spring bone frame commands'
        );
        encoder.copyBufferToBuffer(
          this._positionBuffer,
          0,
          slot.buffer,
          0,
          stateBytes
        );
        encoder.copyBufferToBuffer(
          this._previousPositionBuffer,
          0,
          slot.buffer,
          stateBytes,
          stateBytes
        );
        this._manager.afterSubmit(() => this._mapSlot(slot));
      } catch (_error) {
        slot.busy = false;
        this._fail('webgpu-submit-failed');
      }
    }

    private _mapSlot(slot: SpringBoneReadbackSlot): void {
      slot.buffer
        .mapAsync(mapReadMode())
        .then(() => {
          if (this._disposed || slot.epoch !== this._readbackEpoch) return;
          const values = new Float32Array(slot.buffer.getMappedRange());
          const pointCount = this._configuration.pointCount;
          const positions = new Float32Array(pointCount * 3);
          const previousPositions = new Float32Array(pointCount * 3);
          for (let index = 0; index < pointCount; index++) {
            for (let component = 0; component < 3; component++) {
              const current = values[index * 4 + component];
              const previous = values[pointCount * 4 + index * 4 + component];
              if (!Number.isFinite(current) || !Number.isFinite(previous)) {
                throw new Error('webgpu-invalid-snapshot');
              }
              positions[index * 3 + component] = current;
              previousPositions[index * 3 + component] = previous;
            }
          }
          if (!this._latestSnapshot || slot.sequence > this._latestSnapshot.sequence) {
            this._latestPositions = positions;
            this._latestPreviousPositions = previousPositions;
            this._latestSnapshot = { sequence: slot.sequence, positions, previousPositions };
          }
        })
        .catch((error) => {
          this._fail(
            error instanceof Error && error.message === 'webgpu-invalid-snapshot'
              ? 'webgpu-invalid-snapshot'
              : 'webgpu-map-failed'
          );
        })
        .then(() => {
          try {
            slot.buffer.unmap();
          } catch (_error) {}
          slot.busy = false;
        });
    }

    getLatestSnapshot(): SpringBoneSimulationSnapshot | null {
      return this._latestSnapshot;
    }

    exportLatestRecoverableState(): SpringBoneSimulationState {
      return {
        positions: this._latestPositions.slice(),
        previousPositions: this._latestPreviousPositions.slice(),
      };
    }

    reset(state: SpringBoneSimulationState): void {
      this._readbackEpoch++;
      this._latestPositions = state.positions.slice();
      this._latestPreviousPositions = state.previousPositions.slice();
      this._latestSnapshot = null;
      try {
        this._manager.device.queue.writeBuffer(
          this._positionBuffer,
          0,
          stateToVec4(state.positions)
        );
        this._manager.device.queue.writeBuffer(
          this._previousPositionBuffer,
          0,
          stateToVec4(state.previousPositions)
        );
      } catch (_error) {
        this._fail('webgpu-submit-failed');
      }
    }

    private _fail(reason: SpringBoneFallbackReason): void {
      if (this._disposed || this._failureReported) return;
      this._failureReported = true;
      this._onFailure(reason);
    }

    dispose(): void {
      if (this._disposed) return;
      this._disposed = true;
      const buffers = [
        this._positionBuffer,
        this._previousPositionBuffer,
        this._targetBuffer,
        this._chainBuffer,
        this._colliderBuffer,
        this._uniformBuffer,
      ];
      for (let index = 0; index < buffers.length; index++) buffers[index].destroy();
      for (let index = 0; index < this._readbackSlots.length; index++) {
        try {
          this._readbackSlots[index].buffer.unmap();
        } catch (_error) {}
        this._readbackSlots[index].buffer.destroy();
      }
      this._readbackSlots.length = 0;
      this._latestSnapshot = null;
    }
  }
}
