namespace gdjs {
  export class CpuSpringBoneBackend implements SpringBoneBackend {
    readonly kind: SpringBoneBackendKind = 'CPU';
    private _solver: SpringBoneSolver;
    private _snapshotPositions: Float32Array;
    private _snapshotPreviousPositions: Float32Array;
    private _latestSnapshot: SpringBoneSimulationSnapshot | null = null;
    private _disposed = false;

    constructor(
      configuration: SpringBoneConfiguration,
      state: SpringBoneSimulationState
    ) {
      this._solver = new gdjs.SpringBoneSolver(configuration, state);
      this._snapshotPositions = new Float32Array(state.positions.length);
      this._snapshotPreviousPositions = new Float32Array(
        state.previousPositions.length
      );
    }

    setFrameData(frameData: SpringBoneFrameData): void {
      if (!this._disposed) this._solver.setFrameData(frameData);
    }

    step(fixedDeltaSeconds: number): void {
      if (!this._disposed) this._solver.step(fixedDeltaSeconds);
    }

    requestSnapshot(sequence: number): void {
      if (this._disposed) return;
      this._snapshotPositions.set(this._solver.positions);
      this._snapshotPreviousPositions.set(this._solver.previousPositions);
      this._latestSnapshot = {
        sequence,
        positions: this._snapshotPositions,
        previousPositions: this._snapshotPreviousPositions,
      };
    }

    getLatestSnapshot(): SpringBoneSimulationSnapshot | null {
      return this._latestSnapshot;
    }

    exportLatestRecoverableState(): SpringBoneSimulationState {
      return {
        positions: this._solver.positions.slice(),
        previousPositions: this._solver.previousPositions.slice(),
      };
    }

    reset(state: SpringBoneSimulationState): void {
      this._solver.reset(state);
      this._latestSnapshot = null;
    }

    dispose(): void {
      this._disposed = true;
      this._latestSnapshot = null;
    }
  }
}
