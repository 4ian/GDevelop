namespace gdjs {
  /** A WebGL-rendered 3D cloth driven by the scene cloth simulation system. */
  export class Cloth3DRuntimeObject extends gdjs.RuntimeObject3D {
    private _normalizedData: NormalizedCloth3DObjectData;
    private _topology: ClothSimulationTopology;
    private _pinMask: Uint8Array;
    private _pinTargets: Float32Array;
    private _pendingPinCommands: ClothPinCommand[] = [];
    private _renderer: gdjs.Cloth3DRuntimeObjectRenderer;
    private _system: gdjs.ClothSimulationSystem;
    private _simulationEnabled = true;
    private _activeBackend: ClothBackendKind = 'CPU';
    private _fallbackReason: ClothFallbackReason | null = null;
    private _budgetPaused = false;
    private _droppedSimulationTime = 0;
    private _simulationGeneration = 1;
    private _updatingObjectData = false;
    private _disposed = false;
    private _stepParameters: ClothStepParameters = {
      stiffness: 0,
      damping: 0,
      accelerationX: 0,
      accelerationY: 0,
      accelerationZ: 0,
      sphereColliderEnabled: false,
      sphereCenterX: 0,
      sphereCenterY: 0,
      sphereCenterZ: 0,
      sphereRadius: 0,
    };
    private static _force = new THREE.Vector3();
    private static _worldQuaternion = new THREE.Quaternion();

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: Cloth3DObjectData,
      instanceData?: InstanceData
    ) {
      super(
        instanceContainer,
        gdjs.normalizeCloth3DObjectData(objectData),
        instanceData
      );
      this._normalizedData = gdjs.normalizeCloth3DObjectData(objectData);
      this._topology = gdjs.buildClothSimulationTopology(
        this._normalizedData.content.segmentsX,
        this._normalizedData.content.segmentsY,
        this.getWidth(),
        this.getHeight()
      );
      this._pinMask = gdjs.buildClothPinMask(
        this._topology,
        this._normalizedData.content.pinMode,
        this._normalizedData.content.pinInterval
      );
      this._pinTargets = this._topology.restPositions.slice();
      this._renderer = new gdjs.Cloth3DRuntimeObjectRenderer(
        this,
        instanceContainer
      );
      this._system = gdjs.ClothSimulationSystem.get(
        instanceContainer.getScene()
      );
      this._system.registerObject(this);
      this.onCreated();
    }

    override getRenderer(): gdjs.Cloth3DRuntimeObjectRenderer {
      return this._renderer;
    }

    getNormalizedContent(): NormalizedCloth3DObjectContent {
      return this._normalizedData.content;
    }

    getSimulationTopology(): ClothSimulationTopology {
      return this._topology;
    }

    getSimulationGeneration(): number {
      return this._simulationGeneration;
    }

    getBackendPreference(): ClothBackendPreference {
      return this._normalizedData.content.backendPreference;
    }

    getSimulationFrequency(): number {
      return this._normalizedData.content.simulationFrequency;
    }

    getMaxSubsteps(): number {
      return this._normalizedData.content.maxSubsteps;
    }

    makeRestSimulationState(): ClothSimulationState {
      return {
        positions: this._topology.restPositions.slice(),
        previousPositions: this._topology.restPositions.slice(),
        fixed: this._pinMask.slice(),
        pinTargets: this._pinTargets.slice(),
      };
    }

    getStepParameters(): ClothStepParameters {
      const data = this._normalizedData.content;
      const force = Cloth3DRuntimeObject._force.set(
        data.gravityX + data.windX,
        data.gravityY + data.windY,
        data.gravityZ + data.windZ
      );
      const root = this.get3DRendererObject();
      root.updateWorldMatrix(true, false);
      root.getWorldQuaternion(Cloth3DRuntimeObject._worldQuaternion).invert();
      force.applyQuaternion(Cloth3DRuntimeObject._worldQuaternion);
      if (this.isFlippedX()) force.x = -force.x;
      if (this.isFlippedY()) force.y = -force.y;
      if (this.isFlippedZ()) force.z = -force.z;
      this._stepParameters.stiffness = data.stiffness;
      this._stepParameters.damping = data.damping;
      this._stepParameters.accelerationX = force.x;
      this._stepParameters.accelerationY = force.y;
      this._stepParameters.accelerationZ = force.z;
      this._stepParameters.sphereColliderEnabled =
        data.sphereColliderEnabled && data.sphereRadius > 0;
      this._stepParameters.sphereCenterX = data.sphereCenterX;
      this._stepParameters.sphereCenterY = data.sphereCenterY;
      this._stepParameters.sphereCenterZ = data.sphereCenterZ;
      this._stepParameters.sphereRadius = data.sphereRadius;
      return this._stepParameters;
    }

    _getPendingPinCommands(): readonly ClothPinCommand[] {
      return this._pendingPinCommands;
    }

    _clearPendingPinCommands(): void {
      this._pendingPinCommands.length = 0;
    }

    _onRuntimeSizeChanged(): void {
      if (this._updatingObjectData || this._disposed) return;
      this._rebuildTopology();
    }

    private _rebuildTopology(): void {
      this._simulationGeneration++;
      this._topology = gdjs.buildClothSimulationTopology(
        this._normalizedData.content.segmentsX,
        this._normalizedData.content.segmentsY,
        this.getWidth(),
        this.getHeight()
      );
      this._pinMask = gdjs.buildClothPinMask(
        this._topology,
        this._normalizedData.content.pinMode,
        this._normalizedData.content.pinInterval
      );
      this._pinTargets = this._topology.restPositions.slice();
      this._pendingPinCommands.length = 0;
      this._renderer.rebuildGeometry(this._topology);
      this._system.rebuildObject(this);
    }

    override setWidth(width: float): void {
      super.setWidth(Number.isFinite(width) && width > 0 ? width : 1);
    }

    override setHeight(height: float): void {
      super.setHeight(Number.isFinite(height) && height > 0 ? height : 1);
    }

    override setDepth(depth: float): void {
      super.setDepth(Number.isFinite(depth) && depth > 0 ? depth : 1);
    }

    setSimulationEnabled(enabled: boolean): void {
      const normalizedEnabled = !!enabled;
      if (this._simulationEnabled === normalizedEnabled) return;
      this._simulationEnabled = normalizedEnabled;
      this._system.clearAccumulator(this);
    }

    isSimulationEnabled(): boolean {
      return this._simulationEnabled;
    }

    isSimulationRunning(): boolean {
      return this._simulationEnabled && !this._budgetPaused && !this._disposed;
    }

    resetSimulation(): void {
      for (let index = 0; index < this._topology.particleCount; index++) {
        if (!this._pinMask[index]) continue;
        const offset = index * 3;
        this._pinTargets[offset] = this._topology.restPositions[offset];
        this._pinTargets[offset + 1] = this._topology.restPositions[offset + 1];
        this._pinTargets[offset + 2] = this._topology.restPositions[offset + 2];
      }
      this._pendingPinCommands.length = 0;
      this._system.resetObject(this);
    }

    resetPinning(): void {
      const authoredMask = gdjs.buildClothPinMask(
        this._topology,
        this._normalizedData.content.pinMode,
        this._normalizedData.content.pinInterval
      );
      for (let index = 0; index < this._topology.particleCount; index++) {
        if (authoredMask[index]) {
          const offset = index * 3;
          const targetX = this._topology.restPositions[offset];
          const targetY = this._topology.restPositions[offset + 1];
          const targetZ = this._topology.restPositions[offset + 2];
          this._pinTargets[offset] = targetX;
          this._pinTargets[offset + 1] = targetY;
          this._pinTargets[offset + 2] = targetZ;
          this._pendingPinCommands.push({
            index,
            pinned: true,
            targetX,
            targetY,
            targetZ,
          });
        } else if (this._pinMask[index]) {
          this._pendingPinCommands.push({ index, pinned: false });
        }
      }
      this._pinMask = authoredMask;
    }

    setStiffness(value: number): void {
      this._normalizedData.content.stiffness = this._normalizedUnitValue(
        value,
        gdjs.cloth3DObjectDefaultContent.stiffness
      );
    }

    setDamping(value: number): void {
      this._normalizedData.content.damping = this._normalizedUnitValue(
        value,
        gdjs.cloth3DObjectDefaultContent.damping
      );
    }

    setGravity(x: number, y: number, z: number): void {
      this._normalizedData.content.gravityX = this._normalizedForce(
        x,
        gdjs.cloth3DObjectDefaultContent.gravityX
      );
      this._normalizedData.content.gravityY = this._normalizedForce(
        y,
        gdjs.cloth3DObjectDefaultContent.gravityY
      );
      this._normalizedData.content.gravityZ = this._normalizedForce(
        z,
        gdjs.cloth3DObjectDefaultContent.gravityZ
      );
    }

    setWind(x: number, y: number, z: number): void {
      this._normalizedData.content.windX = this._normalizedForce(
        x,
        gdjs.cloth3DObjectDefaultContent.windX
      );
      this._normalizedData.content.windY = this._normalizedForce(
        y,
        gdjs.cloth3DObjectDefaultContent.windY
      );
      this._normalizedData.content.windZ = this._normalizedForce(
        z,
        gdjs.cloth3DObjectDefaultContent.windZ
      );
    }

    private _normalizedUnitValue(value: number, defaultValue: number): number {
      return Math.min(
        1,
        Math.max(0, Number.isFinite(value) ? value : defaultValue)
      );
    }

    private _normalizedForce(value: number, defaultValue: number): number {
      return Math.min(
        100000,
        Math.max(-100000, Number.isFinite(value) ? value : defaultValue)
      );
    }

    private _getVertexIndex(column: number, row: number): number {
      if (!Number.isFinite(column) || !Number.isFinite(row)) return -1;
      const normalizedColumn = Math.trunc(column);
      const normalizedRow = Math.trunc(row);
      if (
        normalizedColumn < 0 ||
        normalizedColumn > this._topology.segmentsX ||
        normalizedRow < 0 ||
        normalizedRow > this._topology.segmentsY
      ) {
        return -1;
      }
      return normalizedRow * this._topology.columns + normalizedColumn;
    }

    pinVertex(column: number, row: number): void {
      const index = this._getVertexIndex(column, row);
      if (index < 0 || this._pinMask[index]) return;
      const position = this._system.getParticlePosition(this, index);
      if (!position) return;
      const offset = index * 3;
      this._pinMask[index] = 1;
      this._pinTargets[offset] = position[0];
      this._pinTargets[offset + 1] = position[1];
      this._pinTargets[offset + 2] = position[2];
      this._pendingPinCommands.push(
        this._activeBackend === 'WebGPU'
          ? { index, pinned: true }
          : {
              index,
              pinned: true,
              targetX: position[0],
              targetY: position[1],
              targetZ: position[2],
            }
      );
    }

    unpinVertex(column: number, row: number): void {
      const index = this._getVertexIndex(column, row);
      if (index < 0 || !this._pinMask[index]) return;
      this._pinMask[index] = 0;
      this._pendingPinCommands.push({ index, pinned: false });
    }

    isVertexPinned(column: number, row: number): boolean {
      const index = this._getVertexIndex(column, row);
      return index >= 0 && this._pinMask[index] !== 0;
    }

    setSphereColliderEnabled(enabled: boolean): void {
      this._normalizedData.content.sphereColliderEnabled = !!enabled;
    }

    setSphereCollider(
      centerX: number,
      centerY: number,
      centerZ: number,
      radius: number
    ): void {
      const data = this._normalizedData.content;
      data.sphereCenterX = Number.isFinite(centerX) ? centerX : 0;
      data.sphereCenterY = Number.isFinite(centerY) ? centerY : 0;
      data.sphereCenterZ = Number.isFinite(centerZ) ? centerZ : 0;
      data.sphereRadius = Math.min(
        1000000,
        Math.max(0, Number.isFinite(radius) ? radius : 25)
      );
    }

    isUsingWebGPU(): boolean {
      return this._activeBackend === 'WebGPU';
    }

    hasWebGPUFallbackOccurred(): boolean {
      return this._fallbackReason !== null;
    }

    isBudgetPaused(): boolean {
      return this._budgetPaused;
    }

    getActiveBackend(): string {
      return this._activeBackend;
    }

    getActualSegmentsX(): number {
      return this._topology.segmentsX;
    }

    getActualSegmentsY(): number {
      return this._topology.segmentsY;
    }

    getDroppedSimulationTime(): number {
      return this._droppedSimulationTime;
    }

    _setActiveBackend(kind: ClothBackendKind): void {
      this._activeBackend = kind;
    }

    _setFallbackReason(reason: ClothFallbackReason | null): void {
      this._fallbackReason = reason;
    }

    _setBudgetPaused(paused: boolean): void {
      this._budgetPaused = paused;
    }

    _addDroppedSimulationTime(seconds: number): void {
      this._droppedSimulationTime += seconds;
    }

    _setDroppedSimulationTime(seconds: number): void {
      this._droppedSimulationTime = seconds;
    }

    getDebuggerProperties(): Record<string, unknown> {
      return {
        activeBackend: this._activeBackend,
        preference: this.getBackendPreference(),
        simulationEnabled: this._simulationEnabled,
        budgetPaused: this._budgetPaused,
        segmentsX: this._topology.segmentsX,
        segmentsY: this._topology.segmentsY,
        droppedSimulationTime: this._droppedSimulationTime,
        fallbackReason: this._fallbackReason,
      };
    }

    override updateFromObjectData(
      oldObjectData: Cloth3DObjectData,
      newObjectData: Cloth3DObjectData
    ): boolean {
      const oldNormalized = gdjs.normalizeCloth3DObjectData(oldObjectData);
      const newNormalized = gdjs.normalizeCloth3DObjectData(newObjectData);
      const oldContent = oldNormalized.content;
      const newContent = newNormalized.content;
      const topologyChanged =
        oldContent.width !== newContent.width ||
        oldContent.height !== newContent.height ||
        oldContent.segmentsX !== newContent.segmentsX ||
        oldContent.segmentsY !== newContent.segmentsY;
      const pinningChanged =
        oldContent.pinMode !== newContent.pinMode ||
        oldContent.pinInterval !== newContent.pinInterval;
      const frequencyChanged =
        oldContent.simulationFrequency !== newContent.simulationFrequency;
      const backendChanged =
        oldContent.backendPreference !== newContent.backendPreference;

      this._updatingObjectData = true;
      super.updateFromObjectData(oldNormalized, newNormalized);
      this._updatingObjectData = false;
      this._normalizedData = newNormalized;
      if (topologyChanged) {
        this._rebuildTopology();
      } else if (pinningChanged) {
        this.resetPinning();
      }
      this._renderer.updateAppearance();
      if (frequencyChanged) this._system.clearAccumulator(this);
      if (backendChanged) this._system.onObjectConfigurationChanged(this);
      return true;
    }

    override onDeletedFromScene(): void {
      if (!this._disposed) this._system.unregisterObject(this);
      super.onDeletedFromScene();
      this._dispose();
    }

    override onDestroyed(): void {
      super.onDestroyed();
      this._dispose();
    }

    private _dispose(): void {
      if (this._disposed) return;
      this._disposed = true;
      this._renderer.dispose();
      this._pendingPinCommands.length = 0;
    }
  }

  gdjs.registerObject(
    'ClothSimulation::Cloth3DObject',
    gdjs.Cloth3DRuntimeObject
  );
}
