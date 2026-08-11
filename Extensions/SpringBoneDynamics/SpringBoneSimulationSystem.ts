namespace gdjs {
  export interface RuntimeScene {
    springBoneSimulationSystem: gdjs.SpringBoneSimulationSystem | null;
  }

  type SpringBoneRecord = {
    behavior: gdjs.SpringBone3DRuntimeBehavior;
    backend: SpringBoneBackend;
    admitted: boolean;
    accumulator: number;
    snapshotSequence: number;
    pendingFailure: SpringBoneFallbackReason | null;
  };

  const maximumBonesPerScene = 1024;
  const maximumCollidersPerScene = 256;
  const maximumFrameDelta = 1 / 15;

  export class SpringBoneSimulationSystem {
    static get(runtimeScene: gdjs.RuntimeScene): SpringBoneSimulationSystem {
      if (!runtimeScene.springBoneSimulationSystem) {
        runtimeScene.springBoneSimulationSystem =
          new gdjs.SpringBoneSimulationSystem(runtimeScene);
      }
      return runtimeScene.springBoneSimulationSystem;
    }

    private _runtimeScene: gdjs.RuntimeScene;
    private _records: SpringBoneRecord[] = [];
    private _manager: gdjs.WebGpuComputeDeviceManager | null = null;
    private _managerInitializationStarted = false;
    private _managerReady = false;
    private _managerFailureReason: SpringBoneFallbackReason | null = null;
    private _disposed = false;
    private _warnedReasons = new Set<SpringBoneFallbackReason>();
    private _logger = new gdjs.Logger('Spring bone dynamics');
    private _onManagerFailure = (
      reason: gdjs.WebGpuComputeFailureReason
    ): void => {
      if (!this._disposed) this._managerFailureReason = reason;
    };

    constructor(runtimeScene: gdjs.RuntimeScene) {
      this._runtimeScene = runtimeScene;
    }

    registerBehavior(behavior: gdjs.SpringBone3DRuntimeBehavior): boolean {
      if (this._disposed || this._findRecord(behavior)) return false;
      if (
        this._records.some(
          (record) => record.behavior.owner === behavior.owner
        )
      ) {
        behavior._setConfigurationStatus('duplicate-behavior');
        return false;
      }
      const state = behavior._makeCurrentSimulationState();
      const backend = new gdjs.CpuSpringBoneBackend(
        behavior._getConfiguration()!,
        state
      );
      const record: SpringBoneRecord = {
        behavior,
        backend,
        admitted: false,
        accumulator: 0,
        snapshotSequence: 1,
        pendingFailure: null,
      };
      backend.requestSnapshot(record.snapshotSequence);
      this._records.push(record);
      behavior._setActiveBackend('CPU');
      this._updateAdmission();
      this._ensureWebGpuInitializationIfNeeded();
      return true;
    }

    unregisterBehavior(behavior: gdjs.SpringBone3DRuntimeBehavior): void {
      const index = this._records.findIndex(
        (record) => record.behavior === behavior
      );
      if (index === -1) return;
      this._records[index].backend.dispose();
      this._records.splice(index, 1);
      this._updateAdmission();
    }

    resetBehavior(behavior: gdjs.SpringBone3DRuntimeBehavior): void {
      const record = this._findRecord(behavior);
      if (!record) return;
      record.backend.reset(behavior._makeCurrentSimulationState());
      record.accumulator = 0;
      behavior._setDroppedSimulationTime(0);
      record.backend.requestSnapshot(++record.snapshotSequence);
    }

    clearAccumulator(behavior: gdjs.SpringBone3DRuntimeBehavior): void {
      const record = this._findRecord(behavior);
      if (record) record.accumulator = 0;
    }

    onBehaviorConfigurationChanged(
      behavior: gdjs.SpringBone3DRuntimeBehavior
    ): void {
      const record = this._findRecord(behavior);
      if (!record) return;
      record.accumulator = 0;
      if (
        behavior.getBackendPreference() === 'CPU' &&
        record.backend.kind === 'WebGPU'
      ) {
        this._migrateToCpu(record, null);
      }
      this._ensureWebGpuInitializationIfNeeded();
    }

    step(elapsedSeconds: number): void {
      if (this._disposed) return;
      this._processBackendTransitions();
      this._updateAdmission();
      const manager = this._managerReady ? this._manager : null;
      if (manager) manager.beginFrame();

      const elapsed = Math.max(
        0,
        Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0
      );
      const contributed = Math.min(maximumFrameDelta, elapsed);
      const discarded = elapsed - contributed;
      for (let index = 0; index < this._records.length; index++) {
        const record = this._records[index];
        const behavior = record.behavior;
        if (!behavior._consumeCapturedFrame()) continue;
        if (!record.admitted || !behavior.isSimulationEnabled()) {
          record.accumulator = 0;
          continue;
        }
        record.backend.setFrameData(behavior._getFrameData());
        if (discarded > 0) behavior._addDroppedSimulationTime(discarded);
        record.accumulator += contributed;
        const fixedDelta = 1 / behavior.getSimulationFrequency();
        let substeps = 0;
        while (
          record.accumulator + 1e-12 >= fixedDelta &&
          substeps < behavior.getMaxSubsteps()
        ) {
          record.backend.step(fixedDelta);
          record.accumulator -= fixedDelta;
          substeps++;
        }
        if (record.accumulator + 1e-12 >= fixedDelta) {
          const count = Math.floor((record.accumulator + 1e-12) / fixedDelta);
          const dropped = count * fixedDelta;
          record.accumulator -= dropped;
          behavior._addDroppedSimulationTime(dropped);
        }
        if (substeps > 0) {
          record.backend.requestSnapshot(++record.snapshotSequence);
        }
        const snapshot = record.backend.getLatestSnapshot();
        if (snapshot) behavior._applySimulationSnapshot(snapshot);
      }
      if (manager) manager.endFrame();
    }

    private _processBackendTransitions(): void {
      if (this._managerFailureReason) {
        const reason = this._managerFailureReason;
        this._managerFailureReason = null;
        this._warn(reason);
        for (let index = 0; index < this._records.length; index++) {
          this._migrateToCpu(this._records[index], reason);
        }
      }
      for (let index = 0; index < this._records.length; index++) {
        const record = this._records[index];
        if (record.pendingFailure) {
          const reason = record.pendingFailure;
          record.pendingFailure = null;
          this._warn(reason);
          this._migrateToCpu(record, reason);
        }
      }
      if (!this._managerReady || !this._manager) return;
      for (let index = 0; index < this._records.length; index++) {
        const record = this._records[index];
        if (
          record.admitted &&
          record.backend.kind === 'CPU' &&
          this._isWebGpuEligible(record.behavior) &&
          !record.behavior.hasWebGPUFallbackOccurred()
        ) {
          try {
            const backend = gdjs.WebGpuSpringBoneBackend.create(
              this._manager,
              record.behavior._getConfiguration()!,
              record.backend.exportLatestRecoverableState(),
              (reason) => {
                if (!this._disposed) record.pendingFailure = reason;
              }
            );
            record.backend.dispose();
            record.backend = backend;
            record.accumulator = 0;
            record.behavior._setActiveBackend('WebGPU');
          } catch (_error) {
            record.behavior._setFallbackReason('webgpu-allocation-failed');
            this._warn('webgpu-allocation-failed');
          }
        }
      }
    }

    private _migrateToCpu(
      record: SpringBoneRecord,
      reason: SpringBoneFallbackReason | null
    ): void {
      if (record.backend.kind === 'CPU') {
        if (reason && this._isWebGpuEligible(record.behavior)) {
          record.behavior._setFallbackReason(reason);
        }
        return;
      }
      const state = record.backend.exportLatestRecoverableState();
      record.backend.dispose();
      record.backend = new gdjs.CpuSpringBoneBackend(
        record.behavior._getConfiguration()!,
        state
      );
      record.backend.requestSnapshot(++record.snapshotSequence);
      record.accumulator = 0;
      record.behavior._setActiveBackend('CPU');
      if (reason) record.behavior._setFallbackReason(reason);
    }

    private _isWebGpuEligible(
      behavior: gdjs.SpringBone3DRuntimeBehavior
    ): boolean {
      const preference = behavior.getBackendPreference();
      return (
        preference === 'WebGPUPreferred' ||
        (preference === 'Auto' && behavior.getSimulatedBoneCount() >= 32)
      );
    }

    private _ensureWebGpuInitializationIfNeeded(): void {
      if (
        this._disposed ||
        this._managerInitializationStarted ||
        !this._records.some((record) =>
          this._isWebGpuEligible(record.behavior)
        )
      ) {
        return;
      }
      this._managerInitializationStarted = true;
      this._manager = gdjs.WebGpuComputeDeviceManager.acquire(
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
            error instanceof gdjs.WebGpuComputeError
              ? error.reason
              : 'webgpu-device-failed';
        });
    }

    private _updateAdmission(): void {
      let bones = 0;
      let colliders = 0;
      let exceeded = false;
      for (let index = 0; index < this._records.length; index++) {
        const record = this._records[index];
        const configuration = record.behavior._getConfiguration()!;
        const admitted =
          bones + configuration.pointCount <= maximumBonesPerScene &&
          colliders + configuration.colliders.length <= maximumCollidersPerScene;
        if (record.admitted && !admitted) record.accumulator = 0;
        record.admitted = admitted;
        record.behavior._setBudgetPaused(!admitted);
        if (admitted) {
          bones += configuration.pointCount;
          colliders += configuration.colliders.length;
        } else {
          exceeded = true;
        }
      }
      if (exceeded) this._warn('scene-budget-exceeded');
    }

    private _warn(reason: SpringBoneFallbackReason): void {
      if (this._warnedReasons.has(reason)) return;
      this._warnedReasons.add(reason);
      this._logger.warn(
        `${reason} (SpringBoneDynamics::SpringBone3DBehavior)`
      );
    }

    private _findRecord(
      behavior: gdjs.SpringBone3DRuntimeBehavior
    ): SpringBoneRecord | null {
      return (
        this._records.find((record) => record.behavior === behavior) || null
      );
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
    const system = runtimeScene.springBoneSimulationSystem;
    if (!system) return;
    system.step(runtimeScene.getTimeManager().getElapsedTime() / 1000);
  });

  gdjs.registerRuntimeSceneUnloadedCallback((runtimeScene) => {
    const system = runtimeScene.springBoneSimulationSystem;
    if (!system) return;
    system.dispose();
    runtimeScene.springBoneSimulationSystem = null;
  });
}
