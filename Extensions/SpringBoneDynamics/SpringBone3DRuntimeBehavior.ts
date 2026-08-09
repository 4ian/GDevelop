namespace gdjs {
  const springBoneLogger = new gdjs.Logger('Spring bone dynamics');

  const finiteOr = (value: unknown, fallback: number): number =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  const clamp = (value: number, minimum: number, maximum: number): number =>
    Math.min(maximum, Math.max(minimum, value));
  const debugColliderRadialSegments = 12;
  const debugColliderHemisphereSegments = 4;
  const debugColliderEpsilon = 1e-5;

  /** Build a tapered capsule centered on the local Z axis. @internal */
  const makeSpringBoneDebugColliderVertices = (
    length: number,
    radiusA: number,
    radiusB: number
  ): Float32Array => {
    const safeLength = Math.max(0, finiteOr(length, 0));
    const safeRadiusA = Math.max(0, finiteOr(radiusA, 0));
    const safeRadiusB = Math.max(0, finiteOr(radiusB, 0));
    if (safeRadiusA <= 0 || safeRadiusB <= 0) {
      return new Float32Array(0);
    }

    const rings: Array<{ radius: number; z: number }> = [];
    if (safeLength <= debugColliderEpsilon) {
      const radius = Math.max(safeRadiusA, safeRadiusB);
      for (
        let index = 0;
        index <= debugColliderHemisphereSegments * 2;
        index++
      ) {
        const latitude =
          -Math.PI / 2 +
          (Math.PI * index) / (debugColliderHemisphereSegments * 2);
        rings.push({
          radius: Math.cos(latitude) * radius,
          z: Math.sin(latitude) * radius,
        });
      }
    } else {
      const halfLength = safeLength / 2;
      for (let index = 0; index <= debugColliderHemisphereSegments; index++) {
        const latitude =
          -Math.PI / 2 +
          ((Math.PI / 2) * index) / debugColliderHemisphereSegments;
        rings.push({
          radius: Math.cos(latitude) * safeRadiusA,
          z: -halfLength + Math.sin(latitude) * safeRadiusA,
        });
      }
      for (let index = 0; index <= debugColliderHemisphereSegments; index++) {
        const latitude =
          ((Math.PI / 2) * index) / debugColliderHemisphereSegments;
        rings.push({
          radius: Math.cos(latitude) * safeRadiusB,
          z: halfLength + Math.sin(latitude) * safeRadiusB,
        });
      }
    }

    const vertices: number[] = [];
    const appendVertex = (
      ring: { radius: number; z: number },
      angle: number
    ) => {
      vertices.push(
        ring.radius * Math.cos(angle),
        ring.radius * Math.sin(angle),
        ring.z
      );
    };
    for (let ringIndex = 0; ringIndex < rings.length - 1; ringIndex++) {
      const ringA = rings[ringIndex];
      const ringB = rings[ringIndex + 1];
      for (
        let segmentIndex = 0;
        segmentIndex < debugColliderRadialSegments;
        segmentIndex++
      ) {
        const angleA =
          (Math.PI * 2 * segmentIndex) / debugColliderRadialSegments;
        const angleB =
          (Math.PI * 2 * (segmentIndex + 1)) / debugColliderRadialSegments;
        appendVertex(ringA, angleA);
        appendVertex(ringB, angleA);
        appendVertex(ringB, angleB);
        appendVertex(ringA, angleA);
        appendVertex(ringB, angleB);
        appendVertex(ringA, angleB);
      }
    }
    return new Float32Array(vertices);
  };

  export class SpringBone3DRuntimeBehavior extends gdjs.RuntimeBehavior {
    declare owner: gdjs.Model3DRuntimeObject;
    private _runtimeScene: gdjs.RuntimeScene;
    private _configurationResource = '';
    private _simulationEnabled = true;
    private _backendPreference: SpringBoneBackendPreference =
      'WebGPUPreferred';
    private _simulationFrequency = 120;
    private _maxSubsteps = 6;
    private _blendWeight = 1;
    private _movementInertia = 1;
    private _rotationInertia = 1;
    private _gravityScale = 1;
    private _windX = 0;
    private _windY = 0;
    private _windZ = 0;
    private _teleportDistance = 300;
    private _teleportAngle = 90;
    private _configuration: SpringBoneConfiguration | null = null;
    private _binding: gdjs.Model3DSpringBoneDynamicsBinding | null = null;
    private _configurationStatus: SpringBoneConfigurationStatus = 'loading';
    private _loadGeneration = 0;
    private _targets = new Float32Array(0);
    private _animationLocalQuaternions = new Float32Array(0);
    private _colliderLocalData = new Float32Array(0);
    private _colliderWorldPoints = new Float32Array(0);
    private _colliderWorldData = new Float32Array(0);
    private _debugCollisionMasks: gdjs.DebugCollisionMask3D[] = [];
    private _debugCollisionGeometryParameters = new Float32Array(0);
    private _debugColliderPointA = new THREE.Vector3();
    private _debugColliderPointB = new THREE.Vector3();
    private _frameData: SpringBoneFrameData = {
      targets: this._targets,
      colliderWorldData: this._colliderWorldData,
      gravityScale: 1,
      windX: 0,
      windY: 0,
      windZ: 0,
    };
    private _capturedFrame = false;
    private _resetRequested = false;
    private _budgetPaused = false;
    private _activeBackend: SpringBoneBackendKind | null = null;
    private _fallbackReason: SpringBoneFallbackReason | null = null;
    private _droppedSimulationTime = 0;
    private _lastRootX = 0;
    private _lastRootY = 0;
    private _lastRootZ = 0;
    private _lastRotationX = 0;
    private _lastRotationY = 0;
    private _lastRotationZ = 0;
    private _hasPreviousRootTransform = false;
    private _destroyed = false;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData: SpringBone3DBehaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      this.owner = owner as gdjs.Model3DRuntimeObject;
      this._runtimeScene = instanceContainer.getScene();
      this._applyData(behaviorData);
      this.enableSynchronization(false);
    }

    override onCreated(): void {
      if (!(this.owner instanceof gdjs.Model3DRuntimeObject)) {
        this._configurationStatus = 'missing-bone';
        springBoneLogger.warn(
          'SpringBone3DBehavior can only be attached to a 3D model object.'
        );
        return;
      }
      this._loadConfiguration();
    }

    private _applyData(data: Partial<SpringBone3DBehaviorData>): void {
      if (typeof data.configurationResource === 'string') {
        this._configurationResource = data.configurationResource;
      }
      if (typeof data.enabled === 'boolean') this._simulationEnabled = data.enabled;
      if (
        data.backendPreference === 'Auto' ||
        data.backendPreference === 'CPU' ||
        data.backendPreference === 'WebGPUPreferred'
      ) {
        this._backendPreference = data.backendPreference;
      }
      this._simulationFrequency = Math.trunc(
        clamp(finiteOr(data.simulationFrequency, this._simulationFrequency), 30, 240)
      );
      this._maxSubsteps = Math.trunc(
        clamp(finiteOr(data.maxSubsteps, this._maxSubsteps), 1, 12)
      );
      this._blendWeight = clamp(
        finiteOr(data.blendWeight, this._blendWeight),
        0,
        1
      );
      this._movementInertia = clamp(
        finiteOr(data.movementInertia, this._movementInertia),
        0,
        2
      );
      this._rotationInertia = clamp(
        finiteOr(data.rotationInertia, this._rotationInertia),
        0,
        2
      );
      this._gravityScale = clamp(
        finiteOr(data.gravityScale, this._gravityScale),
        0,
        10
      );
      this._windX = clamp(finiteOr(data.windX, this._windX), -100000, 100000);
      this._windY = clamp(finiteOr(data.windY, this._windY), -100000, 100000);
      this._windZ = clamp(finiteOr(data.windZ, this._windZ), -100000, 100000);
      this._teleportDistance = clamp(
        finiteOr(data.teleportDistance, this._teleportDistance),
        0,
        1000000
      );
      this._teleportAngle = clamp(
        finiteOr(data.teleportAngle, this._teleportAngle),
        0,
        180
      );
    }

    override applyBehaviorOverriding(
      behaviorData: SpringBone3DBehaviorData
    ): boolean {
      const previousResource = this._configurationResource;
      this._applyData(behaviorData);
      if (this._configurationResource !== previousResource) {
        this._unbind();
        this._loadConfiguration();
      } else if (this._configuration) {
        gdjs.SpringBoneSimulationSystem.get(
          this._runtimeScene
        ).onBehaviorConfigurationChanged(this);
      }
      return true;
    }

    private _loadConfiguration(): void {
      const generation = ++this._loadGeneration;
      this._configurationStatus = 'loading';
      if (!this._configurationResource) {
        this._configurationStatus = 'missing-resource';
        return;
      }
      this._runtimeScene
        .getGame()
        .getJsonManager()
        .loadJson(this._configurationResource, (error, content) => {
          if (this._destroyed || generation !== this._loadGeneration) return;
          if (error || !content) {
            this._configurationStatus = 'missing-resource';
            return;
          }
          try {
            this._configuration = gdjs.parseSpringBoneConfiguration(content);
          } catch (configurationError) {
            this._configurationStatus =
              configurationError instanceof gdjs.SpringBoneConfigurationError
                ? configurationError.status
                : 'invalid-json';
            return;
          }
          this._bindConfiguration();
        });
    }

    private _bindConfiguration(): void {
      const configuration = this._configuration;
      if (!configuration) return;
      const renderer = this.owner.getRenderer();
      const chainNames = configuration.chains.map((chain) => chain.bones);
      const colliderBoneNames = configuration.colliders.map(
        (collider) => collider.bone
      );
      for (let index = 0; index < chainNames.length; index++) {
        for (let boneIndex = 0; boneIndex < chainNames[index].length; boneIndex++) {
          const name = chainNames[index][boneIndex];
          if (renderer.isBoneNameAmbiguous(name)) {
            this._configurationStatus = 'ambiguous-bone';
            return;
          }
          if (!renderer.hasBone(name)) {
            this._configurationStatus = 'missing-bone';
            return;
          }
        }
      }
      for (let index = 0; index < colliderBoneNames.length; index++) {
        if (renderer.isBoneNameAmbiguous(colliderBoneNames[index])) {
          this._configurationStatus = 'ambiguous-bone';
          return;
        }
        if (!renderer.hasBone(colliderBoneNames[index])) {
          this._configurationStatus = 'missing-bone';
          return;
        }
      }
      const binding = renderer.createSpringBoneDynamicsBinding(
        chainNames,
        colliderBoneNames
      );
      if (!binding) {
        this._configurationStatus = 'invalid-chain';
        return;
      }
      this._binding = binding;
      this._targets = new Float32Array(configuration.pointCount * 3);
      this._animationLocalQuaternions = new Float32Array(
        configuration.pointCount * 4
      );
      this._colliderLocalData = new Float32Array(
        configuration.colliders.length * 12
      );
      this._colliderWorldPoints = new Float32Array(
        configuration.colliders.length * 12
      );
      this._colliderWorldData = new Float32Array(
        configuration.colliders.length * 8
      );
      for (let index = 0; index < configuration.colliders.length; index++) {
        const collider = configuration.colliders[index];
        const offset = index * 12;
        if (
          !renderer.convertSpringBoneModelPointToBoneLocal(
            binding,
            collider.bone,
            collider.aX,
            collider.aY,
            collider.aZ,
            this._colliderLocalData,
            offset
          ) ||
          !renderer.convertSpringBoneModelPointToBoneLocal(
            binding,
            collider.bone,
            collider.bX,
            collider.bY,
            collider.bZ,
            this._colliderLocalData,
            offset + 3
          ) ||
          !renderer.convertSpringBoneModelPointToBoneLocal(
            binding,
            collider.bone,
            collider.aX + collider.radiusA,
            collider.aY,
            collider.aZ,
            this._colliderLocalData,
            offset + 6
          ) ||
          !renderer.convertSpringBoneModelPointToBoneLocal(
            binding,
            collider.bone,
            collider.bX + collider.radiusB,
            collider.bY,
            collider.bZ,
            this._colliderLocalData,
            offset + 9
          )
        ) {
          this._configurationStatus = 'missing-bone';
          this._binding = null;
          return;
        }
      }
      this._frameData = {
        targets: this._targets,
        colliderWorldData: this._colliderWorldData,
        gravityScale: this._gravityScale,
        windX: this._windX,
        windY: this._windY,
        windZ: this._windZ,
      };
      if (!this._capturePoseAndColliders()) {
        this._configurationStatus = 'missing-bone';
        this._binding = null;
        return;
      }
      this._configurationStatus = 'ready';
      this._fallbackReason = null;
      this._hasPreviousRootTransform = false;
      gdjs.SpringBoneSimulationSystem.get(this._runtimeScene).registerBehavior(
        this
      );
    }

    private _capturePoseAndColliders(): boolean {
      const binding = this._binding;
      const configuration = this._configuration;
      if (!binding || !configuration) return false;
      const renderer = this.owner.getRenderer();
      if (
        !renderer.captureSpringBoneDynamicsPose(
          binding,
          this._targets,
          this._animationLocalQuaternions
        )
      ) {
        return false;
      }
      for (let index = 0; index < configuration.colliders.length; index++) {
        const collider = configuration.colliders[index];
        const localOffset = index * 12;
        for (let point = 0; point < 4; point++) {
          const pointOffset = localOffset + point * 3;
          if (
            !renderer.getSpringBoneLocalPointInWorld(
              binding,
              collider.bone,
              this._colliderLocalData[pointOffset],
              this._colliderLocalData[pointOffset + 1],
              this._colliderLocalData[pointOffset + 2],
              this._colliderWorldPoints,
              pointOffset
            )
          ) {
            return false;
          }
        }
        const worldOffset = index * 8;
        this._colliderWorldData[worldOffset] =
          this._colliderWorldPoints[localOffset];
        this._colliderWorldData[worldOffset + 1] =
          this._colliderWorldPoints[localOffset + 1];
        this._colliderWorldData[worldOffset + 2] =
          this._colliderWorldPoints[localOffset + 2];
        this._colliderWorldData[worldOffset + 3] = Math.hypot(
          this._colliderWorldPoints[localOffset + 6] -
            this._colliderWorldPoints[localOffset],
          this._colliderWorldPoints[localOffset + 7] -
            this._colliderWorldPoints[localOffset + 1],
          this._colliderWorldPoints[localOffset + 8] -
            this._colliderWorldPoints[localOffset + 2]
        );
        this._colliderWorldData[worldOffset + 4] =
          this._colliderWorldPoints[localOffset + 3];
        this._colliderWorldData[worldOffset + 5] =
          this._colliderWorldPoints[localOffset + 4];
        this._colliderWorldData[worldOffset + 6] =
          this._colliderWorldPoints[localOffset + 5];
        this._colliderWorldData[worldOffset + 7] = Math.hypot(
          this._colliderWorldPoints[localOffset + 9] -
            this._colliderWorldPoints[localOffset + 3],
          this._colliderWorldPoints[localOffset + 10] -
            this._colliderWorldPoints[localOffset + 4],
          this._colliderWorldPoints[localOffset + 11] -
            this._colliderWorldPoints[localOffset + 5]
        );
      }
      this._frameData.gravityScale = this._gravityScale;
      this._frameData.windX = this._windX;
      this._frameData.windY = this._windY;
      this._frameData.windZ = this._windZ;
      return true;
    }

    private _restoreAnimationPose(): boolean {
      return !!this._binding &&
        this.owner.getRenderer().restoreSpringBoneDynamicsAnimationPose(
          this._binding,
          this._animationLocalQuaternions
        );
    }

    override doStepPreEvents(): void {
      if (!this._binding || !this._configuration) return;
      // Animation clips without hair tracks do not overwrite the simulated
      // local rotations. Restore the clean animation pose every frame so a
      // previous simulation result never becomes the next frame's target.
      if (!this._restoreAnimationPose()) {
        this._unbind();
        this._bindConfiguration();
      }
    }

    override doStepPostEvents(): void {
      if (!this._binding || !this._configuration) return;
      if (!this._capturePoseAndColliders()) {
        this._unbind();
        this._bindConfiguration();
        return;
      }
      const rootX = this.owner.getX();
      const rootY = this.owner.getY();
      const rootZ = this.owner.getZ();
      const rotationX = this.owner.getRotationX();
      const rotationY = this.owner.getRotationY();
      const rotationZ = this.owner.getAngle();
      if (this._hasPreviousRootTransform) {
        const distance = Math.hypot(
          rootX - this._lastRootX,
          rootY - this._lastRootY,
          rootZ - this._lastRootZ
        );
        const angleDelta = Math.max(
          Math.abs(rotationX - this._lastRotationX),
          Math.abs(rotationY - this._lastRotationY),
          Math.abs(rotationZ - this._lastRotationZ)
        );
        if (distance > this._teleportDistance || angleDelta > this._teleportAngle) {
          this._resetRequested = true;
        }
      }
      this._lastRootX = rootX;
      this._lastRootY = rootY;
      this._lastRootZ = rootZ;
      this._lastRotationX = rotationX;
      this._lastRotationY = rotationY;
      this._lastRotationZ = rotationZ;
      this._hasPreviousRootTransform = true;
      this._capturedFrame = true;
      if (this._resetRequested) {
        this._resetRequested = false;
        gdjs.SpringBoneSimulationSystem.get(this._runtimeScene).resetBehavior(
          this
        );
      }
    }

    _consumeCapturedFrame(): boolean {
      const captured = this._capturedFrame;
      this._capturedFrame = false;
      return captured;
    }

    _applySimulationSnapshot(snapshot: SpringBoneSimulationSnapshot): void {
      if (!this._binding || !this._simulationEnabled) return;
      this.owner.getRenderer().applySpringBoneDynamicsPose(
        this._binding,
        snapshot.positions,
        this._animationLocalQuaternions,
        this._blendWeight
      );
    }

    _makeCurrentSimulationState(): SpringBoneSimulationState {
      return {
        positions: this._targets.slice(),
        previousPositions: this._targets.slice(),
      };
    }

    _getFrameData(): SpringBoneFrameData {
      return this._frameData;
    }

    _getConfiguration(): SpringBoneConfiguration | null {
      return this._configuration;
    }

    _setConfigurationStatus(status: SpringBoneConfigurationStatus): void {
      this._configurationStatus = status;
    }

    _setBudgetPaused(paused: boolean): void {
      this._budgetPaused = paused;
    }

    _setActiveBackend(backend: SpringBoneBackendKind): void {
      this._activeBackend = backend;
    }

    _setFallbackReason(reason: SpringBoneFallbackReason): void {
      this._fallbackReason = reason;
      this._activeBackend = 'CPU';
    }

    _setDroppedSimulationTime(value: number): void {
      this._droppedSimulationTime = value;
    }

    _addDroppedSimulationTime(value: number): void {
      this._droppedSimulationTime += value;
    }

    private _unbind(): void {
      gdjs.SpringBoneSimulationSystem.get(this._runtimeScene).unregisterBehavior(
        this
      );
      this._binding = null;
      this._capturedFrame = false;
      this._activeBackend = null;
      this.clear3DDebugCollisionMaskCache();
    }

    override get3DDebugCollisionMasks(): gdjs.DebugCollisionMask3D[] {
      const configuration = this._configuration;
      if (
        !configuration ||
        this._configurationStatus !== 'ready' ||
        this._colliderWorldData.length !== configuration.colliders.length * 8
      ) {
        this._debugCollisionMasks.length = 0;
        return this._debugCollisionMasks;
      }

      const colliderCount = configuration.colliders.length;
      if (this._debugCollisionGeometryParameters.length !== colliderCount * 3) {
        this._debugCollisionMasks = [];
        this._debugCollisionGeometryParameters = new Float32Array(
          colliderCount * 3
        );
      }
      this._debugCollisionMasks.length = colliderCount;
      const debugParent = this.owner.getRenderer().get3DRendererObject().parent;
      if (debugParent) {
        debugParent.updateWorldMatrix(true, false);
      }

      for (let index = 0; index < colliderCount; index++) {
        const worldOffset = index * 8;
        this._debugColliderPointA.set(
          this._colliderWorldData[worldOffset],
          this._colliderWorldData[worldOffset + 1],
          this._colliderWorldData[worldOffset + 2]
        );
        this._debugColliderPointB.set(
          this._colliderWorldData[worldOffset + 4],
          this._colliderWorldData[worldOffset + 5],
          this._colliderWorldData[worldOffset + 6]
        );
        if (debugParent) {
          debugParent.worldToLocal(this._debugColliderPointA);
          debugParent.worldToLocal(this._debugColliderPointB);
        }
        const ax = this._debugColliderPointA.x;
        const ay = this._debugColliderPointA.y;
        const az = this._debugColliderPointA.z;
        const bx = this._debugColliderPointB.x;
        const by = this._debugColliderPointB.y;
        const bz = this._debugColliderPointB.z;
        const deltaX = bx - ax;
        const deltaY = by - ay;
        const deltaZ = bz - az;
        const length = Math.hypot(deltaX, deltaY, deltaZ);
        const radiusA = this._colliderWorldData[worldOffset + 3];
        const radiusB = this._colliderWorldData[worldOffset + 7];
        const geometryOffset = index * 3;
        let debugMask = this._debugCollisionMasks[index];
        if (
          !debugMask ||
          Math.abs(
            this._debugCollisionGeometryParameters[geometryOffset] - length
          ) > debugColliderEpsilon ||
          Math.abs(
            this._debugCollisionGeometryParameters[geometryOffset + 1] - radiusA
          ) > debugColliderEpsilon ||
          Math.abs(
            this._debugCollisionGeometryParameters[geometryOffset + 2] - radiusB
          ) > debugColliderEpsilon
        ) {
          debugMask = this._debugCollisionMasks[index] = {
            vertices: makeSpringBoneDebugColliderVertices(
              length,
              radiusA,
              radiusB
            ),
            positionX: 0,
            positionY: 0,
            positionZ: 0,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0,
            rotationW: 1,
          };
          this._debugCollisionGeometryParameters[geometryOffset] = length;
          this._debugCollisionGeometryParameters[geometryOffset + 1] = radiusA;
          this._debugCollisionGeometryParameters[geometryOffset + 2] = radiusB;
        }

        debugMask.positionX = (ax + bx) / 2;
        debugMask.positionY = (ay + by) / 2;
        debugMask.positionZ = (az + bz) / 2;
        if (length <= debugColliderEpsilon) {
          debugMask.rotationX = 0;
          debugMask.rotationY = 0;
          debugMask.rotationZ = 0;
          debugMask.rotationW = 1;
        } else {
          const directionX = deltaX / length;
          const directionY = deltaY / length;
          const directionZ = deltaZ / length;
          if (directionZ < -1 + debugColliderEpsilon) {
            debugMask.rotationX = 1;
            debugMask.rotationY = 0;
            debugMask.rotationZ = 0;
            debugMask.rotationW = 0;
          } else {
            const quaternionX = -directionY;
            const quaternionY = directionX;
            const quaternionW = 1 + directionZ;
            const quaternionLength = Math.hypot(
              quaternionX,
              quaternionY,
              quaternionW
            );
            debugMask.rotationX = quaternionX / quaternionLength;
            debugMask.rotationY = quaternionY / quaternionLength;
            debugMask.rotationZ = 0;
            debugMask.rotationW = quaternionW / quaternionLength;
          }
        }
      }
      return this._debugCollisionMasks;
    }

    override clear3DDebugCollisionMaskCache(): void {
      this._debugCollisionMasks = [];
      this._debugCollisionGeometryParameters = new Float32Array(0);
    }

    override onDeActivate(): void {
      this._restoreAnimationPose();
      this._unbind();
    }

    override onActivate(): void {
      if (this._configuration) this._bindConfiguration();
      else this._loadConfiguration();
    }

    override onDestroy(): void {
      this._destroyed = true;
      this._loadGeneration++;
      this._unbind();
    }

    setSimulationEnabled(enabled: boolean): void {
      this._simulationEnabled = !!enabled;
      if (!enabled) {
        gdjs.SpringBoneSimulationSystem.get(this._runtimeScene).clearAccumulator(
          this
        );
      }
    }

    isSimulationEnabled(): boolean {
      return this._simulationEnabled;
    }

    isSimulationRunning(): boolean {
      return (
        this._simulationEnabled &&
        this._configurationStatus === 'ready' &&
        !this._budgetPaused &&
        !!this._activeBackend
      );
    }

    resetSimulation(): void {
      this._resetRequested = true;
    }

    notifyTeleported(): void {
      this._resetRequested = true;
    }

    setBlendWeight(value: number): void {
      this._blendWeight = clamp(finiteOr(value, 1), 0, 1);
    }

    setMovementInertia(value: number): void {
      this._movementInertia = clamp(finiteOr(value, 1), 0, 2);
    }

    setRotationInertia(value: number): void {
      this._rotationInertia = clamp(finiteOr(value, 1), 0, 2);
    }

    setGravityScale(value: number): void {
      this._gravityScale = clamp(finiteOr(value, 1), 0, 10);
    }

    setWind(x: number, y: number, z: number): void {
      this._windX = clamp(finiteOr(x, 0), -100000, 100000);
      this._windY = clamp(finiteOr(y, 0), -100000, 100000);
      this._windZ = clamp(finiteOr(z, 0), -100000, 100000);
    }

    hasValidConfiguration(): boolean {
      return !!this._binding && this._configurationStatus === 'ready';
    }

    isBudgetPaused(): boolean {
      return this._budgetPaused;
    }

    hasChain(name: string): boolean {
      return !!this._configuration?.chains.some((chain) => chain.name === name);
    }

    isUsingWebGPU(): boolean {
      return this._activeBackend === 'WebGPU';
    }

    hasWebGPUFallbackOccurred(): boolean {
      return !!this._fallbackReason;
    }

    getConfigurationStatus(): string {
      return this._budgetPaused ? 'budget-paused' : this._configurationStatus;
    }

    getChainCount(): number {
      return this._configuration?.chains.length || 0;
    }

    getSimulatedBoneCount(): number {
      return this._configuration?.pointCount || 0;
    }

    getDroppedSimulationTime(): number {
      return this._droppedSimulationTime;
    }

    getActiveBackend(): string {
      return this._activeBackend || 'None';
    }

    getBackendStatus(): string {
      if (this._activeBackend === 'WebGPU') return 'webgpu-ready';
      if (this._fallbackReason) {
        return this._fallbackReason === 'webgpu-unavailable' ||
          this._fallbackReason === 'webgpu-adapter-unavailable'
          ? 'cpu-webgpu-unavailable'
          : 'cpu-webgpu-failed';
      }
      if (this._backendPreference === 'CPU') return 'cpu-forced';
      if (this._backendPreference === 'Auto') return 'cpu-auto';
      return 'initializing-webgpu';
    }

    getBackendPreference(): SpringBoneBackendPreference {
      return this._backendPreference;
    }

    getSimulationFrequency(): number {
      return this._simulationFrequency;
    }

    getMaxSubsteps(): number {
      return this._maxSubsteps;
    }
  }

  gdjs.registerBehavior(
    'SpringBoneDynamics::SpringBone3DBehavior',
    gdjs.SpringBone3DRuntimeBehavior
  );
}
