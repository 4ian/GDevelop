/// <reference types="types" />

namespace gdjs {
  type ClothReadbackSlot = {
    buffer: GPUBuffer;
    busy: boolean;
    sequence: number;
    epoch: number;
  };

  const getBufferUsage = () =>
    typeof GPUBufferUsage !== 'undefined'
      ? GPUBufferUsage
      : {
          MAP_READ: 1,
          COPY_SRC: 4,
          COPY_DST: 8,
          UNIFORM: 64,
          STORAGE: 128,
        };

  const getMapReadMode = (): number =>
    typeof GPUMapMode !== 'undefined' ? GPUMapMode.READ : 1;

  const stateToVec4 = (source: Float32Array): Float32Array => {
    const result = new Float32Array((source.length / 3) * 4);
    for (let index = 0; index < source.length / 3; index++) {
      result[index * 4] = source[index * 3];
      result[index * 4 + 1] = source[index * 3 + 1];
      result[index * 4 + 2] = source[index * 3 + 2];
      result[index * 4 + 3] = 1;
    }
    return result;
  };

  export class WebGpuClothSimulationBackend implements ClothSimulationBackend {
    readonly kind: ClothBackendKind = 'WebGPU';
    readonly generation: number;
    private _manager: WebGpuClothDeviceManager;
    private _topology: ClothSimulationTopology;
    private _onFailure: (reason: ClothFallbackReason) => void;
    private _positionBuffer: GPUBuffer | null = null;
    private _previousPositionBuffer: GPUBuffer | null = null;
    private _springBuffer: GPUBuffer | null = null;
    private _correctionBuffer: GPUBuffer | null = null;
    private _particleDataBuffer: GPUBuffer | null = null;
    private _adjacencyBuffer: GPUBuffer | null = null;
    private _pinBuffer: GPUBuffer | null = null;
    private _pinCommandBuffer: GPUBuffer | null = null;
    private _uniformBuffer: GPUBuffer | null = null;
    private _bindGroup: GPUBindGroup | null = null;
    private _readbackSlots: ClothReadbackSlot[] = [];
    private _positionVec4: Float32Array;
    private _previousPositionVec4: Float32Array;
    private _particleData: Uint32Array;
    private _pinTargetsVec4: Float32Array;
    private _pinCommandData: Uint32Array;
    private _fixed: Uint8Array;
    private _latestRecoverablePositions: Float32Array;
    private _latestRecoverablePreviousPositions: Float32Array;
    private _latestSnapshot: ClothSimulationSnapshot | null = null;
    private _readbackEpoch = 0;
    private _parameters: ClothStepParameters = {
      stiffness: 0.2,
      damping: 0.99,
      accelerationX: 0,
      accelerationY: 0,
      accelerationZ: -600,
      sphereColliderEnabled: false,
      sphereCenterX: 0,
      sphereCenterY: 0,
      sphereCenterZ: 0,
      sphereRadius: 0,
    };
    private _uniformData = new ArrayBuffer(64);
    private _disposed = false;
    private _failureReported = false;

    static create(
      manager: WebGpuClothDeviceManager,
      topology: ClothSimulationTopology,
      state: ClothSimulationState,
      generation: number,
      onFailure: (reason: ClothFallbackReason) => void
    ): WebGpuClothSimulationBackend {
      const backend = new WebGpuClothSimulationBackend(
        manager,
        topology,
        state,
        generation,
        onFailure
      );
      try {
        backend._createResources();
        return backend;
      } catch (error) {
        backend.dispose();
        if (error instanceof gdjs.ClothWebGpuError) throw error;
        throw new gdjs.ClothWebGpuError('webgpu-allocation-failed');
      }
    }

    private constructor(
      manager: WebGpuClothDeviceManager,
      topology: ClothSimulationTopology,
      state: ClothSimulationState,
      generation: number,
      onFailure: (reason: ClothFallbackReason) => void
    ) {
      this._manager = manager;
      this._topology = topology;
      this.generation = generation;
      this._onFailure = onFailure;
      this._positionVec4 = stateToVec4(state.positions);
      this._previousPositionVec4 = stateToVec4(state.previousPositions);
      this._fixed = state.fixed.slice();
      this._pinTargetsVec4 = stateToVec4(state.pinTargets);
      this._particleData = new Uint32Array(topology.particleCount * 4);
      this._pinCommandData = new Uint32Array(topology.particleCount);
      this._latestRecoverablePositions = state.positions.slice();
      this._latestRecoverablePreviousPositions =
        state.previousPositions.slice();
    }

    private _createResources(): void {
      const device = this._manager.device;
      const usage = getBufferUsage();
      const stateBufferSize = this._topology.particleCount * 16;
      const maximumBufferSize = Number(device.limits.maxBufferSize);
      const maximumStorageSize = Number(
        device.limits.maxStorageBufferBindingSize
      );
      const largestStorageBuffer = Math.max(
        stateBufferSize,
        this._topology.springCount * 16,
        this._topology.springCount * 16,
        this._topology.particleCount * 16,
        this._topology.springCount * 2 * 4
      );
      if (
        largestStorageBuffer > maximumBufferSize ||
        largestStorageBuffer > maximumStorageSize ||
        stateBufferSize * 2 > maximumBufferSize
      ) {
        throw new gdjs.ClothWebGpuError('webgpu-limit-insufficient');
      }

      const createBuffer = (
        label: string,
        size: number,
        bufferUsage: number
      ): GPUBuffer => device.createBuffer({ label, size, usage: bufferUsage });
      this._positionBuffer = createBuffer(
        'GDevelop cloth positions',
        stateBufferSize,
        usage.STORAGE | usage.COPY_SRC | usage.COPY_DST
      );
      this._previousPositionBuffer = createBuffer(
        'GDevelop cloth previous positions',
        stateBufferSize,
        usage.STORAGE | usage.COPY_SRC | usage.COPY_DST
      );
      this._springBuffer = createBuffer(
        'GDevelop cloth springs',
        this._topology.springCount * 16,
        usage.STORAGE | usage.COPY_DST
      );
      this._correctionBuffer = createBuffer(
        'GDevelop cloth corrections',
        this._topology.springCount * 16,
        usage.STORAGE
      );
      this._particleDataBuffer = createBuffer(
        'GDevelop cloth particle data',
        this._topology.particleCount * 16,
        usage.STORAGE | usage.COPY_DST
      );
      this._adjacencyBuffer = createBuffer(
        'GDevelop cloth adjacency',
        this._topology.springCount * 2 * 4,
        usage.STORAGE | usage.COPY_DST
      );
      this._pinBuffer = createBuffer(
        'GDevelop cloth pin targets',
        stateBufferSize,
        usage.STORAGE | usage.COPY_DST
      );
      this._pinCommandBuffer = createBuffer(
        'GDevelop cloth pin commands',
        this._topology.particleCount * 4,
        usage.STORAGE | usage.COPY_DST
      );
      this._uniformBuffer = createBuffer(
        'GDevelop cloth parameters',
        64,
        usage.UNIFORM | usage.COPY_DST
      );

      const springData = new ArrayBuffer(this._topology.springCount * 16);
      const springView = new DataView(springData);
      for (let index = 0; index < this._topology.springCount; index++) {
        const byteOffset = index * 16;
        springView.setUint32(
          byteOffset,
          this._topology.springEndpoints[index * 2],
          true
        );
        springView.setUint32(
          byteOffset + 4,
          this._topology.springEndpoints[index * 2 + 1],
          true
        );
        springView.setFloat32(
          byteOffset + 8,
          this._topology.springRestLengths[index],
          true
        );
      }
      const adjacency = new Uint32Array(this._topology.springCount * 2);
      for (
        let particleIndex = 0;
        particleIndex < this._topology.particleCount;
        particleIndex++
      ) {
        this._particleData[particleIndex * 4] = this._fixed[particleIndex];
        this._particleData[particleIndex * 4 + 1] =
          this._topology.adjacencyOffsets[particleIndex + 1] -
          this._topology.adjacencyOffsets[particleIndex];
        this._particleData[particleIndex * 4 + 2] =
          this._topology.adjacencyOffsets[particleIndex];
      }
      for (let index = 0; index < adjacency.length; index++) {
        adjacency[index] =
          this._topology.adjacencySpringIndices[index] * 2 +
          (this._topology.adjacencySigns[index] < 0 ? 1 : 0);
      }

      const queue = device.queue;
      queue.writeBuffer(this._positionBuffer, 0, this._positionVec4);
      queue.writeBuffer(
        this._previousPositionBuffer,
        0,
        this._previousPositionVec4
      );
      queue.writeBuffer(this._springBuffer, 0, springData);
      queue.writeBuffer(this._particleDataBuffer, 0, this._particleData);
      queue.writeBuffer(this._adjacencyBuffer, 0, adjacency);
      queue.writeBuffer(this._pinBuffer, 0, this._pinTargetsVec4);

      const entries: GPUBindGroupEntry[] = [
        { binding: 0, resource: { buffer: this._positionBuffer } },
        { binding: 1, resource: { buffer: this._previousPositionBuffer } },
        { binding: 2, resource: { buffer: this._springBuffer } },
        { binding: 3, resource: { buffer: this._correctionBuffer } },
        { binding: 4, resource: { buffer: this._particleDataBuffer } },
        { binding: 5, resource: { buffer: this._adjacencyBuffer } },
        { binding: 6, resource: { buffer: this._pinBuffer } },
        { binding: 7, resource: { buffer: this._uniformBuffer } },
        { binding: 8, resource: { buffer: this._pinCommandBuffer } },
      ];
      this._bindGroup = device.createBindGroup({
        label: 'GDevelop cloth bindings',
        layout: this._manager.bindGroupLayout,
        entries,
      });
      for (let index = 0; index < 3; index++) {
        this._readbackSlots.push({
          buffer: createBuffer(
            'GDevelop cloth readback',
            stateBufferSize * 2,
            usage.COPY_DST | usage.MAP_READ
          ),
          busy: false,
          sequence: -1,
          epoch: 0,
        });
      }
    }

    applyParameters(parameters: ClothStepParameters): void {
      this._parameters = parameters;
    }

    applyPinCommands(commands: readonly ClothPinCommand[]): void {
      if (this._disposed || commands.length === 0) return;
      for (
        let commandIndex = 0;
        commandIndex < commands.length;
        commandIndex++
      ) {
        const command = commands[commandIndex];
        if (command.index < 0 || command.index >= this._topology.particleCount)
          continue;
        const index = command.index;
        const xyzOffset = index * 3;
        const vec4Offset = index * 4;
        if (command.pinned) {
          const hasExplicitTarget =
            Number.isFinite(command.targetX) &&
            Number.isFinite(command.targetY) &&
            Number.isFinite(command.targetZ);
          const targetX = Number.isFinite(command.targetX)
            ? command.targetX!
            : this._latestRecoverablePositions[xyzOffset];
          const targetY = Number.isFinite(command.targetY)
            ? command.targetY!
            : this._latestRecoverablePositions[xyzOffset + 1];
          const targetZ = Number.isFinite(command.targetZ)
            ? command.targetZ!
            : this._latestRecoverablePositions[xyzOffset + 2];
          this._fixed[index] = 1;
          this._pinTargetsVec4[vec4Offset] = targetX;
          this._pinTargetsVec4[vec4Offset + 1] = targetY;
          this._pinTargetsVec4[vec4Offset + 2] = targetZ;
          this._pinTargetsVec4[vec4Offset + 3] = 1;
          this._pinCommandData[index] = hasExplicitTarget ? 3 : 1;
        } else {
          this._fixed[index] = 0;
          this._pinCommandData[index] = 2;
        }
        this._particleData[index * 4] = this._fixed[index];
      }
      try {
        const queue = this._manager.device.queue;
        const unsignedView = new Uint32Array(this._uniformData);
        unsignedView[0] = this._topology.particleCount;
        unsignedView[1] = this._topology.springCount;
        queue.writeBuffer(this._pinBuffer!, 0, this._pinTargetsVec4);
        queue.writeBuffer(this._particleDataBuffer!, 0, this._particleData);
        queue.writeBuffer(this._pinCommandBuffer!, 0, this._pinCommandData);
        queue.writeBuffer(this._uniformBuffer!, 0, this._uniformData);
        const pinPass = this._manager.getCommandEncoder().beginComputePass({
          label: 'GDevelop cloth pin maintenance',
        });
        pinPass.setPipeline(this._manager.pinPipeline);
        pinPass.setBindGroup(0, this._bindGroup!);
        pinPass.dispatchWorkgroups(
          Math.ceil(this._topology.particleCount / 64)
        );
        pinPass.end();
        this._pinCommandData.fill(0);
      } catch (_error) {
        this._fail('webgpu-submit-failed');
      }
    }

    step(fixedDeltaSeconds: number): void {
      if (this._disposed) return;
      try {
        const unsignedView = new Uint32Array(this._uniformData);
        const floatView = new Float32Array(this._uniformData);
        unsignedView[0] = this._topology.particleCount;
        unsignedView[1] = this._topology.springCount;
        unsignedView[2] =
          this._parameters.sphereColliderEnabled &&
          this._parameters.sphereRadius > 0
            ? 1
            : 0;
        unsignedView[3] = 0;
        floatView[4] = this._parameters.stiffness;
        floatView[5] = this._parameters.damping;
        floatView[6] = fixedDeltaSeconds * fixedDeltaSeconds;
        floatView[7] = 0;
        floatView[8] = this._parameters.accelerationX;
        floatView[9] = this._parameters.accelerationY;
        floatView[10] = this._parameters.accelerationZ;
        floatView[11] = 0;
        floatView[12] = this._parameters.sphereCenterX;
        floatView[13] = this._parameters.sphereCenterY;
        floatView[14] = this._parameters.sphereCenterZ;
        floatView[15] = this._parameters.sphereRadius;
        this._manager.device.queue.writeBuffer(
          this._uniformBuffer!,
          0,
          this._uniformData
        );
        const encoder = this._manager.getCommandEncoder();
        const springPass = encoder.beginComputePass({
          label: 'GDevelop cloth springs',
        });
        springPass.setPipeline(this._manager.springPipeline);
        springPass.setBindGroup(0, this._bindGroup!);
        springPass.dispatchWorkgroups(
          Math.ceil(this._topology.springCount / 64)
        );
        springPass.end();
        const particlePass = encoder.beginComputePass({
          label: 'GDevelop cloth particles',
        });
        particlePass.setPipeline(this._manager.particlePipeline);
        particlePass.setBindGroup(0, this._bindGroup!);
        particlePass.dispatchWorkgroups(
          Math.ceil(this._topology.particleCount / 64)
        );
        particlePass.end();
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
        const stateBufferSize = this._topology.particleCount * 16;
        const encoder = this._manager.getCommandEncoder();
        encoder.copyBufferToBuffer(
          this._positionBuffer!,
          0,
          slot.buffer,
          0,
          stateBufferSize
        );
        encoder.copyBufferToBuffer(
          this._previousPositionBuffer!,
          0,
          slot.buffer,
          stateBufferSize,
          stateBufferSize
        );
        this._manager.afterSubmit(() => this._mapSlot(slot));
      } catch (_error) {
        slot.busy = false;
        this._fail('webgpu-submit-failed');
      }
    }

    private _mapSlot(slot: ClothReadbackSlot): void {
      slot.buffer
        .mapAsync(getMapReadMode())
        .then(() => {
          if (this._disposed || slot.epoch !== this._readbackEpoch) return;
          const mapped = slot.buffer.getMappedRange();
          const values = new Float32Array(mapped);
          const particleCount = this._topology.particleCount;
          const positions = new Float32Array(particleCount * 3);
          const previousPositions = new Float32Array(particleCount * 3);
          for (let index = 0; index < particleCount; index++) {
            for (let component = 0; component < 3; component++) {
              const currentValue = values[index * 4 + component];
              const previousValue =
                values[particleCount * 4 + index * 4 + component];
              if (
                !Number.isFinite(currentValue) ||
                !Number.isFinite(previousValue)
              ) {
                throw new gdjs.ClothWebGpuError('webgpu-invalid-snapshot');
              }
              positions[index * 3 + component] = currentValue;
              previousPositions[index * 3 + component] = previousValue;
            }
          }
          if (
            !this._latestSnapshot ||
            slot.sequence > this._latestSnapshot.sequence
          ) {
            for (let index = 0; index < particleCount; index++) {
              if (!this._fixed[index]) continue;
              this._pinTargetsVec4[index * 4] = positions[index * 3];
              this._pinTargetsVec4[index * 4 + 1] = positions[index * 3 + 1];
              this._pinTargetsVec4[index * 4 + 2] = positions[index * 3 + 2];
            }
            this._latestRecoverablePositions = positions;
            this._latestRecoverablePreviousPositions = previousPositions;
            this._positionVec4 = stateToVec4(positions);
            this._previousPositionVec4 = stateToVec4(previousPositions);
            this._latestSnapshot = {
              sequence: slot.sequence,
              positions,
              previousPositions,
            };
          }
        })
        .catch((error) => {
          this._fail(
            error instanceof gdjs.ClothWebGpuError
              ? error.reason
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

    getLatestSnapshot(): ClothSimulationSnapshot | null {
      return this._latestSnapshot;
    }

    exportLatestRecoverableState(): ClothSimulationState {
      const pinTargets = new Float32Array(this._topology.particleCount * 3);
      for (let index = 0; index < this._topology.particleCount; index++) {
        pinTargets[index * 3] = this._pinTargetsVec4[index * 4];
        pinTargets[index * 3 + 1] = this._pinTargetsVec4[index * 4 + 1];
        pinTargets[index * 3 + 2] = this._pinTargetsVec4[index * 4 + 2];
      }
      return {
        positions: this._latestRecoverablePositions.slice(),
        previousPositions: this._latestRecoverablePreviousPositions.slice(),
        fixed: this._fixed.slice(),
        pinTargets,
      };
    }

    reset(state: ClothSimulationState): void {
      if (this._disposed) return;
      this._readbackEpoch++;
      this._latestRecoverablePositions = state.positions.slice();
      this._latestRecoverablePreviousPositions =
        state.previousPositions.slice();
      this._fixed.set(state.fixed);
      this._positionVec4 = stateToVec4(state.positions);
      this._previousPositionVec4 = stateToVec4(state.previousPositions);
      this._pinTargetsVec4 = stateToVec4(state.pinTargets);
      for (let index = 0; index < this._topology.particleCount; index++) {
        this._particleData[index * 4] = this._fixed[index];
      }
      this._latestSnapshot = null;
      try {
        const queue = this._manager.device.queue;
        queue.writeBuffer(this._positionBuffer!, 0, this._positionVec4);
        queue.writeBuffer(
          this._previousPositionBuffer!,
          0,
          this._previousPositionVec4
        );
        queue.writeBuffer(this._particleDataBuffer!, 0, this._particleData);
        queue.writeBuffer(this._pinBuffer!, 0, this._pinTargetsVec4);
      } catch (_error) {
        this._fail('webgpu-submit-failed');
      }
    }

    private _fail(reason: ClothFallbackReason): void {
      if (this._failureReported || this._disposed) return;
      this._failureReported = true;
      this._onFailure(reason);
    }

    dispose(): void {
      if (this._disposed) return;
      this._disposed = true;
      const buffers = [
        this._positionBuffer,
        this._previousPositionBuffer,
        this._springBuffer,
        this._correctionBuffer,
        this._particleDataBuffer,
        this._adjacencyBuffer,
        this._pinBuffer,
        this._pinCommandBuffer,
        this._uniformBuffer,
      ];
      for (let index = 0; index < buffers.length; index++) {
        if (buffers[index]) buffers[index]!.destroy();
      }
      for (let index = 0; index < this._readbackSlots.length; index++) {
        const slot = this._readbackSlots[index];
        try {
          slot.buffer.unmap();
        } catch (_error) {}
        slot.buffer.destroy();
      }
      this._readbackSlots.length = 0;
      this._latestSnapshot = null;
    }
  }
}
