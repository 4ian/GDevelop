namespace gdjs {
  export interface ClothSimulationBackend {
    readonly kind: ClothBackendKind;
    readonly generation: number;
    applyParameters(parameters: ClothStepParameters): void;
    applyPinCommands(commands: readonly ClothPinCommand[]): void;
    step(fixedDeltaSeconds: number): void;
    requestSnapshot(sequence: number): void;
    getLatestSnapshot(): ClothSimulationSnapshot | null;
    exportLatestRecoverableState(): ClothSimulationState;
    reset(state: ClothSimulationState): void;
    dispose(): void;
  }
}
