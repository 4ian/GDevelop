namespace gdjs {
  const lodOriginalCastShadowKey = '__gdScene3dLodOriginalCastShadow';
  const lodOriginalReceiveShadowKey = '__gdScene3dLodOriginalReceiveShadow';
  const lightingPipelineStateKey = '__gdScene3dLightingPipelineState';

  interface LightingPipelineState {
    mode?: string;
    realtimeWeight?: number;
    lodDistanceScale?: number;
  }

  type RuntimeObjectWith3DRenderer = gdjs.RuntimeObject & {
    get3DRendererObject?: () => THREE.Object3D | null;
  };

  type RuntimeObjectWithAnimationSpeed = gdjs.RuntimeObject & {
    getAnimationSpeedScale?: () => number;
    setAnimationSpeedScale?: (speed: number) => void;
  };

  type RuntimeModel3DObject = gdjs.RuntimeObject & {
    _modelResourceName?: string;
    _data?: { content?: { [key: string]: any } };
    _renderer?: any;
    _reloadModel?: (objectData: any) => void;
  };

  /**
   * @category Behaviors > 3D
   */
  export class LODRuntimeBehavior extends gdjs.RuntimeBehavior {
    private _enabled: boolean;
    private _lod1Distance: number;
    private _lod2Distance: number;
    private _cullDistance: number;
    private _hysteresis: number;
    private _updateIntervalFrames: number;
    private _lod1AnimationSpeed: number;
    private _lod2AnimationSpeed: number;
    private _lod1CastShadows: boolean;
    private _lod2CastShadows: boolean;
    private _lod1ReceiveShadows: boolean;
    private _lod2ReceiveShadows: boolean;
    private _lod1ModelResource: string;
    private _lod2ModelResource: string;
    private _forceLevel: number;
    private _modelSwitchCooldownMs: number;
    private _useBoundingRadius: boolean;
    private _distanceScale: number;

    private _frameCounter: number;
    private _currentLevel: number;
    private _lastComputedDistanceToCamera: number;
    private _baseAnimationSpeed: number;
    private _hasBaseAnimationSpeed: boolean;
    private _tempObjectPosition: THREE.Vector3;
    private _tempCameraPosition: THREE.Vector3;
    private _baseModelResource: string;
    private _activeModelResource: string;
    private _lastModelSwitchTimeMs: number;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);

      this._enabled =
        behaviorData.enabled === undefined ? true : !!behaviorData.enabled;
      this._lod1Distance = this._clampNonNegative(
        behaviorData.lod1Distance !== undefined ? behaviorData.lod1Distance : 900
      );
      this._lod2Distance = this._clampNonNegative(
        behaviorData.lod2Distance !== undefined ? behaviorData.lod2Distance : 1800
      );
      this._cullDistance = this._clampNonNegative(
        behaviorData.cullDistance !== undefined ? behaviorData.cullDistance : 3200
      );
      this._hysteresis = this._clampNonNegative(
        behaviorData.hysteresis !== undefined ? behaviorData.hysteresis : 120
      );
      this._updateIntervalFrames = this._clampInt(
        behaviorData.updateIntervalFrames !== undefined
          ? behaviorData.updateIntervalFrames
          : 2,
        1,
        30
      );
      this._lod1AnimationSpeed = this._clampNonNegative(
        behaviorData.lod1AnimationSpeed !== undefined
          ? behaviorData.lod1AnimationSpeed
          : 0.65
      );
      this._lod2AnimationSpeed = this._clampNonNegative(
        behaviorData.lod2AnimationSpeed !== undefined
          ? behaviorData.lod2AnimationSpeed
          : 0
      );
      this._lod1CastShadows =
        behaviorData.lod1CastShadows === undefined
          ? true
          : !!behaviorData.lod1CastShadows;
      this._lod2CastShadows =
        behaviorData.lod2CastShadows === undefined
          ? false
          : !!behaviorData.lod2CastShadows;
      this._lod1ReceiveShadows =
        behaviorData.lod1ReceiveShadows === undefined
          ? true
          : !!behaviorData.lod1ReceiveShadows;
      this._lod2ReceiveShadows =
        behaviorData.lod2ReceiveShadows === undefined
          ? false
          : !!behaviorData.lod2ReceiveShadows;
      this._lod1ModelResource = behaviorData.lod1ModelResource || '';
      this._lod2ModelResource = behaviorData.lod2ModelResource || '';
      this._forceLevel = this._clampInt(
        behaviorData.forceLevel !== undefined ? behaviorData.forceLevel : -1,
        -1,
        3
      );
      this._modelSwitchCooldownMs = this._clamp(
        behaviorData.modelSwitchCooldownMs !== undefined
          ? behaviorData.modelSwitchCooldownMs
          : 250,
        0,
        5000
      );
      this._useBoundingRadius =
        behaviorData.useBoundingRadius === undefined
          ? true
          : !!behaviorData.useBoundingRadius;
      this._distanceScale = this._clamp(
        behaviorData.distanceScale !== undefined ? behaviorData.distanceScale : 1,
        0.1,
        8
      );

      this._frameCounter = 0;
      this._currentLevel = -1;
      this._lastComputedDistanceToCamera = 0;
      this._baseAnimationSpeed = 1;
      this._hasBaseAnimationSpeed = false;
      this._tempObjectPosition = new THREE.Vector3();
      this._tempCameraPosition = new THREE.Vector3();
      this._baseModelResource = '';
      this._activeModelResource = '';
      this._lastModelSwitchTimeMs = -1;

      this._sortThresholds();
      this._captureBaseModelResource();
    }

    override applyBehaviorOverriding(behaviorData): boolean {
      if (behaviorData.enabled !== undefined) this.setEnabled(behaviorData.enabled);
      if (behaviorData.lod1Distance !== undefined)
        this.setLod1Distance(behaviorData.lod1Distance);
      if (behaviorData.lod2Distance !== undefined)
        this.setLod2Distance(behaviorData.lod2Distance);
      if (behaviorData.cullDistance !== undefined)
        this.setCullDistance(behaviorData.cullDistance);
      if (behaviorData.hysteresis !== undefined)
        this.setHysteresis(behaviorData.hysteresis);
      if (behaviorData.updateIntervalFrames !== undefined)
        this.setUpdateIntervalFrames(behaviorData.updateIntervalFrames);
      if (behaviorData.lod1AnimationSpeed !== undefined)
        this.setLod1AnimationSpeed(behaviorData.lod1AnimationSpeed);
      if (behaviorData.lod2AnimationSpeed !== undefined)
        this.setLod2AnimationSpeed(behaviorData.lod2AnimationSpeed);
      if (behaviorData.lod1CastShadows !== undefined)
        this.setLod1CastShadows(behaviorData.lod1CastShadows);
      if (behaviorData.lod2CastShadows !== undefined)
        this.setLod2CastShadows(behaviorData.lod2CastShadows);
      if (behaviorData.lod1ReceiveShadows !== undefined)
        this.setLod1ReceiveShadows(behaviorData.lod1ReceiveShadows);
      if (behaviorData.lod2ReceiveShadows !== undefined)
        this.setLod2ReceiveShadows(behaviorData.lod2ReceiveShadows);
      if (behaviorData.lod1ModelResource !== undefined)
        this.setLod1ModelResource(behaviorData.lod1ModelResource);
      if (behaviorData.lod2ModelResource !== undefined)
        this.setLod2ModelResource(behaviorData.lod2ModelResource);
      if (behaviorData.forceLevel !== undefined)
        this.setForceLevel(behaviorData.forceLevel);
      if (behaviorData.modelSwitchCooldownMs !== undefined)
        this.setModelSwitchCooldownMs(behaviorData.modelSwitchCooldownMs);
      if (behaviorData.useBoundingRadius !== undefined)
        this.setUseBoundingRadius(behaviorData.useBoundingRadius);
      if (behaviorData.distanceScale !== undefined)
        this.setDistanceScale(behaviorData.distanceScale);
      return true;
    }

    override onDeActivate(): void {
      this._resetToFullQuality();
    }

    override onDestroy(): void {
      this._resetToFullQuality();
    }

    override doStepPostEvents(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): void {
      if (!this._enabled) {
        if (this._currentLevel !== -1) {
          this._resetToFullQuality();
        }
        return;
      }

      const object3D = this._getOwner3DObject();
      if (!object3D) {
        return;
      }

      if (this._updateIntervalFrames > 1) {
        this._frameCounter = (this._frameCounter + 1) % this._updateIntervalFrames;
        if (this._frameCounter !== 0) {
          this._applyVisibility(this._currentLevel < 0 ? 0 : this._currentLevel, object3D);
          return;
        }
      }

      const camera = this._getLayerCamera();
      if (!camera) {
        return;
      }

      const distance = this._computeDistanceToCamera(object3D, camera);
      this._lastComputedDistanceToCamera = distance;
      const effectiveScale = this._getEffectiveDistanceScale();
      const scaledDistance = distance / effectiveScale;
      const nextLevel = this._computeNextLevel(scaledDistance);
      const levelChanged = nextLevel !== this._currentLevel;

      if (levelChanged) {
        this._applyAnimationLevel(nextLevel);
        this._applyShadowLevel(nextLevel, object3D);
        this._applyModelLevel(nextLevel);
        this._currentLevel = nextLevel;
      }

      this._applyVisibility(nextLevel, object3D);
    }

    isEnabled(): boolean {
      return this._enabled;
    }

    setEnabled(enabled: boolean): void {
      this._enabled = !!enabled;
      if (!this._enabled) {
        this._resetToFullQuality();
      }
    }

    getCurrentLevel(): number {
      return this._currentLevel < 0 ? 0 : this._currentLevel;
    }

    getLod1Distance(): number {
      return this._lod1Distance;
    }

    setLod1Distance(value: number): void {
      this._lod1Distance = this._clampNonNegative(value);
      this._sortThresholds();
    }

    getLod2Distance(): number {
      return this._lod2Distance;
    }

    setLod2Distance(value: number): void {
      this._lod2Distance = this._clampNonNegative(value);
      this._sortThresholds();
    }

    getCullDistance(): number {
      return this._cullDistance;
    }

    setCullDistance(value: number): void {
      this._cullDistance = this._clampNonNegative(value);
      this._sortThresholds();
    }

    getHysteresis(): number {
      return this._hysteresis;
    }

    setHysteresis(value: number): void {
      this._hysteresis = this._clampNonNegative(value);
    }

    getUpdateIntervalFrames(): number {
      return this._updateIntervalFrames;
    }

    setUpdateIntervalFrames(value: number): void {
      this._updateIntervalFrames = this._clampInt(value, 1, 30);
      this._frameCounter = 0;
    }

    getLod1AnimationSpeed(): number {
      return this._lod1AnimationSpeed;
    }

    setLod1AnimationSpeed(value: number): void {
      this._lod1AnimationSpeed = this._clampNonNegative(value);
    }

    getLod2AnimationSpeed(): number {
      return this._lod2AnimationSpeed;
    }

    setLod2AnimationSpeed(value: number): void {
      this._lod2AnimationSpeed = this._clampNonNegative(value);
    }

    setLod1CastShadows(value: boolean): void {
      this._lod1CastShadows = !!value;
    }

    isLod1CastShadowsEnabled(): boolean {
      return this._lod1CastShadows;
    }

    setLod2CastShadows(value: boolean): void {
      this._lod2CastShadows = !!value;
    }

    isLod2CastShadowsEnabled(): boolean {
      return this._lod2CastShadows;
    }

    setLod1ReceiveShadows(value: boolean): void {
      this._lod1ReceiveShadows = !!value;
    }

    isLod1ReceiveShadowsEnabled(): boolean {
      return this._lod1ReceiveShadows;
    }

    setLod2ReceiveShadows(value: boolean): void {
      this._lod2ReceiveShadows = !!value;
    }

    isLod2ReceiveShadowsEnabled(): boolean {
      return this._lod2ReceiveShadows;
    }

    getLod1ModelResource(): string {
      return this._lod1ModelResource;
    }

    setLod1ModelResource(resourceName: string): void {
      this._lod1ModelResource = (resourceName || '').trim();
    }

    getLod2ModelResource(): string {
      return this._lod2ModelResource;
    }

    setLod2ModelResource(resourceName: string): void {
      this._lod2ModelResource = (resourceName || '').trim();
    }

    getForceLevel(): number {
      return this._forceLevel;
    }

    setForceLevel(value: number): void {
      this._forceLevel = this._clampInt(value, -1, 3);
    }

    getModelSwitchCooldownMs(): number {
      return this._modelSwitchCooldownMs;
    }

    setModelSwitchCooldownMs(value: number): void {
      this._modelSwitchCooldownMs = this._clamp(value, 0, 5000);
    }

    isUsingBoundingRadius(): boolean {
      return this._useBoundingRadius;
    }

    setUseBoundingRadius(value: boolean): void {
      this._useBoundingRadius = !!value;
    }

    getDistanceScale(): number {
      return this._distanceScale;
    }

    setDistanceScale(value: number): void {
      this._distanceScale = this._clamp(value, 0.1, 8);
    }

    getLastDistanceToCamera(): number {
      return this._lastComputedDistanceToCamera;
    }

    isCulled(): boolean {
      return this.getCurrentLevel() >= 3;
    }

    private _clamp(value: number, min: number, max: number): number {
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) {
        return min;
      }
      return Math.max(min, Math.min(max, numericValue));
    }

    private _clampInt(value: number, min: number, max: number): number {
      return Math.round(this._clamp(value, min, max));
    }

    private _clampNonNegative(value: number): number {
      return this._clamp(value, 0, 10000000);
    }

    private _sortThresholds(): void {
      this._lod1Distance = this._clampNonNegative(this._lod1Distance);
      this._lod2Distance = Math.max(this._lod1Distance + 1, this._lod2Distance);
      this._cullDistance = Math.max(this._lod2Distance + 1, this._cullDistance);
    }

    private _getOwner3DObject(): THREE.Object3D | null {
      const ownerWith3DRenderer = this.owner as RuntimeObjectWith3DRenderer;
      if (
        !ownerWith3DRenderer ||
        typeof ownerWith3DRenderer.get3DRendererObject !== 'function'
      ) {
        return null;
      }
      return ownerWith3DRenderer.get3DRendererObject() || null;
    }

    private _getLayerCamera(): THREE.Camera | null {
      const runtimeScene = this.owner.getRuntimeScene();
      if (!runtimeScene) {
        return null;
      }
      const runtimeLayer = runtimeScene.getLayer(this.owner.getLayer());
      if (!runtimeLayer) {
        return null;
      }
      const layerRenderer = runtimeLayer.getRenderer() as any;
      if (
        !layerRenderer ||
        typeof layerRenderer.getThreeCamera !== 'function'
      ) {
        return null;
      }
      return layerRenderer.getThreeCamera() as THREE.Camera | null;
    }

    private _getLightingPipelineState(): LightingPipelineState | null {
      const runtimeScene = this.owner.getRuntimeScene();
      if (!runtimeScene) {
        return null;
      }
      const runtimeLayer = runtimeScene.getLayer(this.owner.getLayer());
      if (!runtimeLayer) {
        return null;
      }
      const layerRenderer = runtimeLayer.getRenderer() as any;
      if (
        !layerRenderer ||
        typeof layerRenderer.getThreeScene !== 'function'
      ) {
        return null;
      }
      const threeScene = layerRenderer.getThreeScene() as
        | THREE.Scene
        | null
        | undefined;
      if (!threeScene) {
        return null;
      }
      const state = (threeScene as THREE.Scene & {
        userData?: { [key: string]: any };
      }).userData?.[lightingPipelineStateKey] as LightingPipelineState | undefined;
      return state || null;
    }

    private _getEffectiveDistanceScale(): number {
      const pipelineState = this._getLightingPipelineState();
      let pipelineDistanceScale = 1;
      if (pipelineState) {
        pipelineDistanceScale = this._clamp(
          pipelineState.lodDistanceScale !== undefined
            ? pipelineState.lodDistanceScale
            : 1,
          0.25,
          4
        );
        if (pipelineState.mode === 'baked') {
          pipelineDistanceScale *= 0.9;
        } else if (pipelineState.mode === 'hybrid') {
          const realtimeWeight = this._clamp(
            pipelineState.realtimeWeight !== undefined
              ? pipelineState.realtimeWeight
              : 0.75,
            0,
            1
          );
          pipelineDistanceScale *= 0.85 + realtimeWeight * 0.3;
        }
      }
      return this._clamp(this._distanceScale * pipelineDistanceScale, 0.1, 16);
    }

    private _computeDistanceToCamera(
      object3D: THREE.Object3D,
      camera: THREE.Camera
    ): number {
      object3D.getWorldPosition(this._tempObjectPosition);
      camera.getWorldPosition(this._tempCameraPosition);
      let distance = this._tempCameraPosition.distanceTo(this._tempObjectPosition);
      if (!this._useBoundingRadius) {
        return distance;
      }

      const ownerAny = this.owner as any;
      if (
        typeof ownerAny.getWidth !== 'function' ||
        typeof ownerAny.getHeight !== 'function' ||
        typeof ownerAny.getDepth !== 'function'
      ) {
        return distance;
      }

      const width = Math.max(0, Number(ownerAny.getWidth()) || 0);
      const height = Math.max(0, Number(ownerAny.getHeight()) || 0);
      const depth = Math.max(0, Number(ownerAny.getDepth()) || 0);
      const radius = 0.5 * Math.sqrt(width * width + height * height + depth * depth);
      return Math.max(0, distance - radius);
    }

    private _computeNextLevel(distanceToCamera: number): number {
      if (this._forceLevel >= 0) {
        return this._forceLevel;
      }

      const lod1 = this._lod1Distance;
      const lod2 = this._lod2Distance;
      const cull = this._cullDistance;
      const h = this._hysteresis;

      if (this._currentLevel < 0) {
        if (distanceToCamera > cull) return 3;
        if (distanceToCamera > lod2) return 2;
        if (distanceToCamera > lod1) return 1;
        return 0;
      }

      if (this._currentLevel === 0) {
        if (distanceToCamera > lod1 + h) return 1;
        return 0;
      }
      if (this._currentLevel === 1) {
        if (distanceToCamera > lod2 + h) return 2;
        if (distanceToCamera < lod1 - h) return 0;
        return 1;
      }
      if (this._currentLevel === 2) {
        if (distanceToCamera > cull + h) return 3;
        if (distanceToCamera < lod2 - h) return 1;
        return 2;
      }

      if (distanceToCamera < cull - h) {
        return 2;
      }
      return 3;
    }

    private _captureShadowDefaults(object3D: THREE.Object3D): void {
      object3D.traverse((child) => {
        const shadowObject = child as THREE.Object3D & {
          castShadow?: boolean;
          receiveShadow?: boolean;
          userData?: { [key: string]: any };
        };
        shadowObject.userData = shadowObject.userData || {};
        if (
          typeof shadowObject.castShadow === 'boolean' &&
          shadowObject.userData[lodOriginalCastShadowKey] === undefined
        ) {
          shadowObject.userData[lodOriginalCastShadowKey] = shadowObject.castShadow;
        }
        if (
          typeof shadowObject.receiveShadow === 'boolean' &&
          shadowObject.userData[lodOriginalReceiveShadowKey] === undefined
        ) {
          shadowObject.userData[lodOriginalReceiveShadowKey] =
            shadowObject.receiveShadow;
        }
      });
    }

    private _restoreShadowDefaults(object3D: THREE.Object3D): void {
      object3D.traverse((child) => {
        const shadowObject = child as THREE.Object3D & {
          castShadow?: boolean;
          receiveShadow?: boolean;
          userData?: { [key: string]: any };
        };
        const userData = shadowObject.userData;
        if (!userData) {
          return;
        }
        if (
          typeof shadowObject.castShadow === 'boolean' &&
          userData[lodOriginalCastShadowKey] !== undefined
        ) {
          shadowObject.castShadow = !!userData[lodOriginalCastShadowKey];
          delete userData[lodOriginalCastShadowKey];
        }
        if (
          typeof shadowObject.receiveShadow === 'boolean' &&
          userData[lodOriginalReceiveShadowKey] !== undefined
        ) {
          shadowObject.receiveShadow = !!userData[lodOriginalReceiveShadowKey];
          delete userData[lodOriginalReceiveShadowKey];
        }
      });
    }

    private _applyShadowLevel(level: number, object3D: THREE.Object3D): void {
      this._captureShadowDefaults(object3D);
      object3D.traverse((child) => {
        const shadowObject = child as THREE.Object3D & {
          castShadow?: boolean;
          receiveShadow?: boolean;
          userData?: { [key: string]: any };
        };
        const userData = shadowObject.userData;
        if (!userData) {
          return;
        }
        const originalCast =
          userData[lodOriginalCastShadowKey] === undefined
            ? !!shadowObject.castShadow
            : !!userData[lodOriginalCastShadowKey];
        const originalReceive =
          userData[lodOriginalReceiveShadowKey] === undefined
            ? !!shadowObject.receiveShadow
            : !!userData[lodOriginalReceiveShadowKey];

        if (typeof shadowObject.castShadow === 'boolean') {
          if (level <= 0) {
            shadowObject.castShadow = originalCast;
          } else if (level === 1) {
            shadowObject.castShadow = this._lod1CastShadows && originalCast;
          } else {
            shadowObject.castShadow = this._lod2CastShadows && originalCast;
          }
        }
        if (typeof shadowObject.receiveShadow === 'boolean') {
          if (level <= 0) {
            shadowObject.receiveShadow = originalReceive;
          } else if (level === 1) {
            shadowObject.receiveShadow =
              this._lod1ReceiveShadows && originalReceive;
          } else {
            shadowObject.receiveShadow =
              this._lod2ReceiveShadows && originalReceive;
          }
        }
      });
    }

    private _applyAnimationLevel(level: number): void {
      const ownerWithAnimation = this.owner as RuntimeObjectWithAnimationSpeed;
      if (
        typeof ownerWithAnimation.getAnimationSpeedScale !== 'function' ||
        typeof ownerWithAnimation.setAnimationSpeedScale !== 'function'
      ) {
        return;
      }

      const currentSpeed = Number(ownerWithAnimation.getAnimationSpeedScale());
      const safeCurrentSpeed = Number.isFinite(currentSpeed) ? currentSpeed : 1;

      if (level <= 0) {
        if (this._hasBaseAnimationSpeed) {
          ownerWithAnimation.setAnimationSpeedScale(this._baseAnimationSpeed);
        } else {
          this._baseAnimationSpeed = safeCurrentSpeed;
          this._hasBaseAnimationSpeed = true;
        }
        return;
      }

      if (this._currentLevel <= 0 || !this._hasBaseAnimationSpeed) {
        this._baseAnimationSpeed = safeCurrentSpeed;
        this._hasBaseAnimationSpeed = true;
      }

      const lodSpeed = level === 1 ? this._lod1AnimationSpeed : this._lod2AnimationSpeed;
      ownerWithAnimation.setAnimationSpeedScale(Math.max(0, lodSpeed));
    }

    private _applyVisibility(level: number, object3D: THREE.Object3D): void {
      const objectHidden = this.owner.isHidden();
      object3D.visible = level < 3 && !objectHidden;
    }

    private _captureBaseModelResource(): void {
      const modelOwner = this.owner as RuntimeModel3DObject;
      if (typeof modelOwner._modelResourceName !== 'string') {
        return;
      }
      if (!this._baseModelResource) {
        this._baseModelResource = modelOwner._modelResourceName;
      }
      if (!this._activeModelResource) {
        this._activeModelResource = modelOwner._modelResourceName;
      }
    }

    private _resolveTargetModelResource(level: number): string {
      this._captureBaseModelResource();
      if (!this._baseModelResource) {
        return '';
      }
      if (level <= 0) {
        return this._baseModelResource;
      }
      if (level === 1) {
        return this._lod1ModelResource || this._baseModelResource;
      }
      return (
        this._lod2ModelResource ||
        this._lod1ModelResource ||
        this._baseModelResource
      );
    }

    private _canSwitchModel(runtimeScene: gdjs.RuntimeScene): boolean {
      if (this._modelSwitchCooldownMs <= 0) {
        return true;
      }
      const nowMs = runtimeScene.getTimeManager().getTimeFromStart();
      if (this._lastModelSwitchTimeMs < 0) {
        return true;
      }
      return nowMs - this._lastModelSwitchTimeMs >= this._modelSwitchCooldownMs;
    }

    private _markModelSwitch(runtimeScene: gdjs.RuntimeScene): void {
      this._lastModelSwitchTimeMs =
        runtimeScene.getTimeManager().getTimeFromStart();
    }

    private _setModelResource(
      modelOwner: RuntimeModel3DObject,
      resourceName: string
    ): boolean {
      const runtimeScene = this.owner.getRuntimeScene();
      if (!runtimeScene) {
        return false;
      }
      if (typeof modelOwner._modelResourceName !== 'string') {
        return false;
      }
      if (modelOwner._modelResourceName === resourceName) {
        return true;
      }

      try {
        modelOwner._modelResourceName = resourceName;

        const renderer = modelOwner._renderer as any;
        if (
          renderer &&
          typeof renderer._reloadModel === 'function' &&
          typeof renderer._updateModel === 'function'
        ) {
          renderer._reloadModel(modelOwner, runtimeScene);
          const content =
            modelOwner._data && modelOwner._data.content
              ? modelOwner._data.content
              : {};
          const rotationX = Number(content.rotationX) || 0;
          const rotationY = Number(content.rotationY) || 0;
          const rotationZ = Number(content.rotationZ) || 0;
          const width = Math.max(1, Number(content.width) || 100);
          const height = Math.max(1, Number(content.height) || 100);
          const depth = Math.max(1, Number(content.depth) || 100);
          const keepAspectRatio = !!content.keepAspectRatio;
          renderer._updateModel(
            rotationX,
            rotationY,
            rotationZ,
            width,
            height,
            depth,
            keepAspectRatio
          );
          return true;
        }

        if (
          typeof modelOwner._reloadModel === 'function' &&
          modelOwner._data &&
          modelOwner._data.content
        ) {
          const updatedData = {
            ...modelOwner._data,
            content: {
              ...modelOwner._data.content,
              modelResourceName: resourceName,
            },
          };
          modelOwner._reloadModel(updatedData);
          return true;
        }
      } catch (error) {
        console.warn(
          `[Scene3D::LOD] Failed to switch model resource for "${this.owner.getName()}" to "${resourceName}".`,
          error
        );
      }
      return false;
    }

    private _applyModelLevel(level: number): void {
      const modelOwner = this.owner as RuntimeModel3DObject;
      if (typeof modelOwner._modelResourceName !== 'string') {
        return;
      }
      const runtimeScene = this.owner.getRuntimeScene();
      if (!runtimeScene) {
        return;
      }

      const targetModelResource = this._resolveTargetModelResource(level);
      if (!targetModelResource) {
        return;
      }

      const currentModelResource = modelOwner._modelResourceName;
      this._activeModelResource = currentModelResource;
      if (targetModelResource === currentModelResource) {
        return;
      }
      if (!this._canSwitchModel(runtimeScene)) {
        return;
      }

      const switched = this._setModelResource(modelOwner, targetModelResource);
      this._markModelSwitch(runtimeScene);
      if (switched) {
        this._activeModelResource = targetModelResource;
      }
    }

    private _resetToFullQuality(): void {
      const object3D = this._getOwner3DObject();
      if (object3D) {
        this._restoreShadowDefaults(object3D);
        this._applyVisibility(0, object3D);
      }

      const ownerWithAnimation = this.owner as RuntimeObjectWithAnimationSpeed;
      if (
        this._hasBaseAnimationSpeed &&
        typeof ownerWithAnimation.setAnimationSpeedScale === 'function'
      ) {
        ownerWithAnimation.setAnimationSpeedScale(this._baseAnimationSpeed);
      }

      const modelOwner = this.owner as RuntimeModel3DObject;
      if (
        this._baseModelResource &&
        typeof modelOwner._modelResourceName === 'string' &&
        modelOwner._modelResourceName !== this._baseModelResource
      ) {
        this._setModelResource(modelOwner, this._baseModelResource);
      }

      this._currentLevel = -1;
    }
  }

  gdjs.registerBehavior('Scene3D::LOD', gdjs.LODRuntimeBehavior);
}
