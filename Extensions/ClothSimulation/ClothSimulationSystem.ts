namespace gdjs {
  export interface RuntimeScene {
    clothSimulationSystem: gdjs.ClothSimulationSystem | null;
  }

  type ClothSimulationRecord = {
    object: gdjs.Cloth3DRuntimeObject;
    backend: ClothSimulationBackend;
    admitted: boolean;
    accumulator: number;
    snapshotSequence: number;
  };

  const maximumClothsPerScene = 16;
  const maximumParticlesPerScene = 16384;
  const maximumSpringsPerScene = 65536;
  const maximumFrameDelta = 1 / 15;

  export class ClothSimulationSystem {
    static get(runtimeScene: gdjs.RuntimeScene): ClothSimulationSystem {
      if (!runtimeScene.clothSimulationSystem) {
        runtimeScene.clothSimulationSystem = new ClothSimulationSystem(
          runtimeScene
        );
      }
      return runtimeScene.clothSimulationSystem;
    }

    private _runtimeScene: gdjs.RuntimeScene;
    private _records: ClothSimulationRecord[] = [];
    private _manager: WebGpuClothDeviceManager | null = null;
    private _managerInitializationStarted = false;
    private _managerReady = false;
    private _managerFailureReason: ClothFallbackReason | null = null;
    private _warnedReasons = new Set<ClothFallbackReason>();
    private _logger = new gdjs.Logger('Cloth simulation');
    private _disposed = false;
    private _onManagerFailure = (reason: ClothFallbackReason): void => {
      if (!this._disposed) this._managerFailureReason = reason;
    };

    constructor(runtimeScene: gdjs.RuntimeScene) {
      this._runtimeScene = runtimeScene;
    }

    registerObject(object: gdjs.Cloth3DRuntimeObject): void {
      if (this._disposed || this._findRecord(object)) return;
      const topology = object.getSimulationTopology();
      const backend = new gdjs.CpuClothSimulationBackend(
        topology,
        object.makeRestSimulationState(),
        object.getSimulationGeneration()
      );
      this._records.push({
        object,
        backend,
        admitted: false,
        accumulator: 0,
        snapshotSequence: 0,
      });
      this._updateAdmission();
      this._ensureWebGpuInitializationIfNeeded();
    }

    unregisterObject(object: gdjs.Cloth3DRuntimeObject): void {
      const index = this._records.findIndex(
        (record) => record.object === object
      );
      if (index === -1) return;
      this._records[index].backend.dispose();
      this._records.splice(index, 1);
      this._updateAdmission();
    }

    rebuildObject(object: gdjs.Cloth3DRuntimeObject): void {
      const record = this._findRecord(object);
      if (!record) return;
      const replacement = new gdjs.CpuClothSimulationBackend(
        object.getSimulationTopology(),
        object.makeRestSimulationState(),
        object.getSimulationGeneration()
      );
      record.backend.dispose();
      record.backend = replacement;
      record.accumulator = 0;
      record.snapshotSequence++;
      object._setActiveBackend('CPU');
      object._setFallbackReason(null);
      object.getRenderer().updateSnapshot({
        sequence: record.snapshotSequence,
        positions: object.getSimulationTopology().restPositions,
        previousPositions: object.getSimulationTopology().restPositions,
      });
      this._updateAdmission();
      this._ensureWebGpuInitializationIfNeeded();
    }

    resetObject(object: gdjs.Cloth3DRuntimeObject): void {
      const record = this._findRecord(object);
      if (!record) return;
      const state = object.makeRestSimulationState();
      record.backend.reset(state);
      record.accumulator = 0;
      record.snapshotSequence++;
      object._setDroppedSimulationTime(0);
      object.getRenderer().updateSnapshot({
        sequence: record.snapshotSequence,
        positions: state.positions,
        previousPositions: state.previousPositions,
      });
    }

    clearAccumulator(object: gdjs.Cloth3DRuntimeObject): void {
      const record = this._findRecord(object);
      if (record) record.accumulator = 0;
    }

    onObjectConfigurationChanged(object: gdjs.Cloth3DRuntimeObject): void {
      const record = this._findRecord(object);
      if (!record) return;
      record.accumulator = 0;
      if (
        object.getBackendPreference() === 'CPU' &&
        record.backend.kind === 'WebGPU'
      ) {
        this._migrateToCpu(record, null);
      }
      this._ensureWebGpuInitializationIfNeeded();
    }

    getParticlePosition(
      object: gdjs.Cloth3DRuntimeObject,
      index: number
    ): [number, number, number] | null {
      const record = this._findRecord(object);
      if (!record) return null;
      if (record.backend instanceof gdjs.CpuClothSimulationBackend) {
        return record.backend.getParticlePosition(index);
      }
      const state = record.backend.exportLatestRecoverableState();
      if (index < 0 || index * 3 + 2 >= state.positions.length) return null;
      return [
        state.positions[index * 3],
        state.positions[index * 3 + 1],
        state.positions[index * 3 + 2],
      ];
    }

    step(elapsedSeconds: number): void {
      if (this._disposed) return;
      this._processBackendTransitions();
      this._updateAdmission();

      const manager = this._managerReady ? this._manager : null;
      if (manager) manager.beginFrame();
      const normalizedElapsedTime = Math.max(
        0,
        Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0
      );
      const contributedTime = Math.min(
        maximumFrameDelta,
        normalizedElapsedTime
      );
      const frameCapDiscardedTime = normalizedElapsedTime - contributedTime;

      for (let index = 0; index < this._records.length; index++) {
        const record = this._records[index];
        const object = record.object;
        if (!record.admitted || !object.isSimulationEnabled()) {
          record.accumulator = 0;
          this._publishLatestSnapshot(record);
          continue;
        }

        record.backend.applyParameters(object.getStepParameters());
        const pinCommands = object._getPendingPinCommands();
        if (pinCommands.length !== 0) {
          record.backend.applyPinCommands(pinCommands);
          object._clearPendingPinCommands();
        }
        if (frameCapDiscardedTime > 0) {
          object._addDroppedSimulationTime(frameCapDiscardedTime);
        }
        record.accumulator += contributedTime;
        const fixedDelta = 1 / object.getSimulationFrequency();
        let substeps = 0;
        while (
          record.accumulator + 1e-12 >= fixedDelta &&
          substeps < object.getMaxSubsteps()
        ) {
          record.backend.step(fixedDelta);
          record.accumulator -= fixedDelta;
          substeps++;
        }
        if (record.accumulator + 1e-12 >= fixedDelta) {
          const discardedStepCount = Math.floor(
            (record.accumulator + 1e-12) / fixedDelta
          );
          const discardedTime = discardedStepCount * fixedDelta;
          record.accumulator -= discardedTime;
          object._addDroppedSimulationTime(discardedTime);
        }
        if (substeps > 0) {
          record.backend.requestSnapshot(++record.snapshotSequence);
        }
        this._publishLatestSnapshot(record);
      }
      if (manager) manager.endFrame();
    }

    private _publishLatestSnapshot(record: ClothSimulationRecord): void {
      const snapshot = record.backend.getLatestSnapshot();
      if (snapshot) record.object.getRenderer().updateSnapshot(snapshot);
    }

    private _processBackendTransitions(): void {
      if (this._managerFailureReason) {
        const reason = this._managerFailureReason;
        this._managerFailureReason = null;
        this._warn(reason);
        for (let index = 0; index < this._records.length; index++) {
          const record = this._records[index];
          if (record.backend.kind === 'WebGPU') {
            this._migrateToCpu(record, reason);
          } else if (this._isWebGpuEligible(record.object)) {
            record.object._setFallbackReason(reason);
          }
        }
      }
      if (!this._managerReady || !this._manager) return;
      for (let index = 0; index < this._records.length; index++) {
        const record = this._records[index];
        if (
          record.admitted &&
          record.backend.kind === 'CPU' &&
          this._isWebGpuEligible(record.object) &&
          !record.object.hasWebGPUFallbackOccurred()
        ) {
          try {
            const backend = gdjs.WebGpuClothSimulationBackend.create(
              this._manager,
              record.object.getSimulationTopology(),
              record.backend.exportLatestRecoverableState(),
              record.object.getSimulationGeneration(),
              (reason) => {
                if (!this._disposed) this._managerFailureReason = reason;
              }
            );
            record.backend.dispose();
            record.backend = backend;
            record.accumulator = 0;
            record.object._setActiveBackend('WebGPU');
          } catch (error) {
            const reason =
              error instanceof gdjs.ClothWebGpuError
                ? error.reason
                : 'webgpu-allocation-failed';
            record.object._setFallbackReason(reason);
            this._warn(reason);
          }
        }
      }
    }

    private _migrateToCpu(
      record: ClothSimulationRecord,
      reason: ClothFallbackReason | null
    ): void {
      if (record.backend.kind === 'CPU') {
        if (reason) record.object._setFallbackReason(reason);
        return;
      }
      const state = record.backend.exportLatestRecoverableState();
      const backend = new gdjs.CpuClothSimulationBackend(
        record.object.getSimulationTopology(),
        state,
        record.object.getSimulationGeneration()
      );
      record.backend.dispose();
      record.backend = backend;
      record.accumulator = 0;
      record.object._setActiveBackend('CPU');
      if (reason) record.object._setFallbackReason(reason);
    }

    private _isWebGpuEligible(object: gdjs.Cloth3DRuntimeObject): boolean {
      const preference = object.getBackendPreference();
      return (
        preference === 'WebGPUPreferred' ||
        (preference === 'Auto' &&
          object.getSimulationTopology().particleCount >= 512)
      );
    }

    private _ensureWebGpuInitializationIfNeeded(): void {
      if (
        this._disposed ||
        this._managerInitializationStarted ||
        !this._records.some((record) => this._isWebGpuEligible(record.object))
      ) {
        return;
      }
      this._managerInitializationStarted = true;
      this._manager = gdjs.WebGpuClothDeviceManager.acquire(
        this._runtimeScene.getGame(),
        this._onManagerFailure
      );
      this._manager
        .initialize()
        .then(() => {
          if (!this._disposed) this._managerReady = true;
        })
        .catch((error) => {
          if (this._disposed) return;
          this._managerFailureReason =
            error instanceof gdjs.ClothWebGpuError
              ? error.reason
              : 'webgpu-device-failed';
        });
    }

    private _updateAdmission(): void {
      let admittedCount = 0;
      let admittedParticles = 0;
      let admittedSprings = 0;
      let budgetExceeded = false;
      for (let index = 0; index < this._records.length; index++) {
        const record = this._records[index];
        const topology = record.object.getSimulationTopology();
        const admitted =
          admittedCount + 1 <= maximumClothsPerScene &&
          admittedParticles + topology.particleCount <=
            maximumParticlesPerScene &&
          admittedSprings + topology.springCount <= maximumSpringsPerScene;
        if (record.admitted && !admitted) record.accumulator = 0;
        record.admitted = admitted;
        record.object._setBudgetPaused(!admitted);
        if (admitted) {
          admittedCount++;
          admittedParticles += topology.particleCount;
          admittedSprings += topology.springCount;
        } else {
          budgetExceeded = true;
        }
      }
      if (budgetExceeded) this._warn('scene-budget-exceeded');
    }

    private _warn(reason: ClothFallbackReason): void {
      if (this._warnedReasons.has(reason)) return;
      this._warnedReasons.add(reason);
      this._logger.warn(`${reason} (ClothSimulation::Cloth3DObject)`);
    }

    private _findRecord(
      object: gdjs.Cloth3DRuntimeObject
    ): ClothSimulationRecord | null {
      return this._records.find((record) => record.object === object) || null;
    }

    dispose(): void {
      if (this._disposed) return;
      this._disposed = true;
      for (let index = 0; index < this._records.length; index++) {
        this._records[index].backend.dispose();
      }
      this._records.length = 0;
      if (this._manager) {
        this._manager.release(this._onManagerFailure);
        this._manager = null;
      }
      this._managerReady = false;
    }
  }

  gdjs.registerRuntimeScenePostEventsCallback((runtimeScene) => {
    const system = runtimeScene.clothSimulationSystem;
    if (!system) return;
    system.step(runtimeScene.getTimeManager().getElapsedTime() / 1000);
  });

  gdjs.registerRuntimeSceneUnloadedCallback((runtimeScene) => {
    const system = runtimeScene.clothSimulationSystem;
    if (!system) return;
    system.dispose();
    runtimeScene.clothSimulationSystem = null;
  });
}
