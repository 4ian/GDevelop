namespace gdjs {
  export interface SpringBoneBackend {
    readonly kind: SpringBoneBackendKind;
    setFrameData(frameData: SpringBoneFrameData): void;
    step(fixedDeltaSeconds: number): void;
    requestSnapshot(sequence: number): void;
    getLatestSnapshot(): SpringBoneSimulationSnapshot | null;
    exportLatestRecoverableState(): SpringBoneSimulationState;
    reset(state: SpringBoneSimulationState): void;
    dispose(): void;
  }
}
