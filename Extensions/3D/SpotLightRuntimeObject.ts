namespace gdjs {
  const DEFAULT_MAX_ACTIVE_SPOT_LIGHTS = 8;

  const clampSpotLightAngle = (value: number): number =>
    Math.max(1, Math.min(89, value));

  const clampShadowQuality = (value: string): 'low' | 'medium' | 'high' => {
    const normalized = (value || '').toLowerCase();
    if (normalized === 'low' || normalized === 'high') {
      return normalized;
    }
    return 'medium';
  };

  const shadowQualityToMapSize = (quality: string): integer => {
    const normalized = clampShadowQuality(quality);
    if (normalized === 'low') {
      return 512;
    }
    if (normalized === 'high') {
      return 2048;
    }
    return 1024;
  };

  const sanitizeLayerName = (layerName: string): string => layerName || '';

  interface SpotLightGuardrailsState {
    lights: Set<gdjs.SpotLightRuntimeObject>;
    maxActiveByLayerName: Map<string, integer>;
    lastUpdateTimeFromStartMs: number;
  }

  const spotLightGuardrailsStateByRuntimeScene = new WeakMap<
    gdjs.RuntimeScene,
    SpotLightGuardrailsState
  >();

  const getOrCreateGuardrailsState = (
    runtimeScene: gdjs.RuntimeScene
  ): SpotLightGuardrailsState => {
    const existingState =
      spotLightGuardrailsStateByRuntimeScene.get(runtimeScene);
    if (existingState) {
      return existingState;
    }

    const newState: SpotLightGuardrailsState = {
      lights: new Set(),
      maxActiveByLayerName: new Map(),
      lastUpdateTimeFromStartMs: -1,
    };
    spotLightGuardrailsStateByRuntimeScene.set(runtimeScene, newState);
    return newState;
  };

  export namespace scene3d {
    export namespace spotLights {
      export const registerSpotLight = (
        light: gdjs.SpotLightRuntimeObject
      ): void => {
        const runtimeScene = light.getRuntimeScene();
        const state = getOrCreateGuardrailsState(runtimeScene);
        state.lights.add(light);
      };

      export const unregisterSpotLight = (
        light: gdjs.SpotLightRuntimeObject
      ): void => {
        const runtimeScene = light.getRuntimeScene();
        const state = spotLightGuardrailsStateByRuntimeScene.get(runtimeScene);
        if (!state) {
          return;
        }
        state.lights.delete(light);
      };

      export const setMaxActiveSpotLights = (
        runtimeScene: gdjs.RuntimeScene,
        layerName: string,
        maxActiveSpotLights: number
      ): void => {
        const state = getOrCreateGuardrailsState(runtimeScene);
        const safeMax = Math.max(0, Math.floor(maxActiveSpotLights));
        state.maxActiveByLayerName.set(sanitizeLayerName(layerName), safeMax);
      };

      export const getMaxActiveSpotLights = (
        runtimeScene: gdjs.RuntimeScene,
        layerName: string
      ): number => {
        const state = getOrCreateGuardrailsState(runtimeScene);
        const configuredMax = state.maxActiveByLayerName.get(
          sanitizeLayerName(layerName)
        );
        if (configuredMax === undefined) {
          return DEFAULT_MAX_ACTIVE_SPOT_LIGHTS;
        }
        return configuredMax;
      };

      export const updateGuardrailsForScene = (
        runtimeScene: gdjs.RuntimeScene
      ): void => {
        const state = spotLightGuardrailsStateByRuntimeScene.get(runtimeScene);
        if (!state) {
          return;
        }

        const timeFromStart = runtimeScene.getTimeManager().getTimeFromStart();
        if (state.lastUpdateTimeFromStartMs === timeFromStart) {
          return;
        }
        state.lastUpdateTimeFromStartMs = timeFromStart;

        const spotLightsByLayerName = new Map<
          string,
          gdjs.SpotLightRuntimeObject[]
        >();

        for (const spotLight of state.lights) {
          if (!spotLight.shouldUseGuardrails()) {
            spotLight.setGuardrailActive(true);
            continue;
          }

          const layerName = sanitizeLayerName(spotLight.getLayer());
          const lights = spotLightsByLayerName.get(layerName);
          if (lights) {
            lights.push(spotLight);
          } else {
            spotLightsByLayerName.set(layerName, [spotLight]);
          }
        }

        for (const [layerName, lights] of spotLightsByLayerName) {
          if (lights.length === 0) {
            continue;
          }

          if (!runtimeScene.hasLayer(layerName)) {
            for (const light of lights) {
              light.setGuardrailActive(false);
            }
            continue;
          }

          const layer = runtimeScene.getLayer(layerName);
          const cameraX = layer.getCameraX();
          const cameraY = layer.getCameraY();
          const cameraZ = layer.getCameraZ(
            layer.getInitialCamera3DFieldOfView()
          );

          lights.sort(
            (firstLight, secondLight) =>
              firstLight.getDistanceToCameraSquared(cameraX, cameraY, cameraZ) -
              secondLight.getDistanceToCameraSquared(cameraX, cameraY, cameraZ)
          );

          const maxActiveLights = getMaxActiveSpotLights(
            runtimeScene,
            layerName
          );

          for (let index = 0; index < lights.length; index++) {
            lights[index].setGuardrailActive(index < maxActiveLights);
          }
        }
      };
    }
  }

  export interface SpotLightObjectData extends Object3DData {
    content: Object3DDataContent & {
      enabled: boolean | undefined;
      color: string;
      intensity: number | undefined;
      distance: number | undefined;
      angle: number | undefined;
      penumbra: number | undefined;
      decay: number | undefined;
      castShadow: boolean | undefined;
      shadowQuality: 'low' | 'medium' | 'high' | undefined;
      shadowBias: number | undefined;
      shadowNormalBias: number | undefined;
      shadowRadius: number | undefined;
      shadowNear: number | undefined;
      shadowFar: number | undefined;
      guardrailsEnabled: boolean | undefined;
    };
  }

  type SpotLightObjectNetworkSyncDataType = {
    en: boolean;
    c: string;
    i: number;
    d: number;
    a: number;
    p: number;
    dc: number;
    cs: boolean;
    sq: 'low' | 'medium' | 'high';
    sb: number;
    snb: number;
    sr: number;
    sn: number;
    sf: number;
    ge: boolean;
    ga: boolean;
  };

  type SpotLightObjectNetworkSyncData = Object3DNetworkSyncData &
    SpotLightObjectNetworkSyncDataType;

  export class SpotLightRuntimeObject extends gdjs.RuntimeObject3D {
    private _renderer: gdjs.SpotLightRuntimeObjectRenderer;

    private _enabled: boolean;
    private _color: string;
    private _intensity: number;
    private _distance: number;
    private _angle: number;
    private _penumbra: number;
    private _decay: number;
    private _castShadow: boolean;
    private _shadowQuality: 'low' | 'medium' | 'high';
    private _shadowBias: number;
    private _shadowNormalBias: number;
    private _shadowRadius: number;
    private _shadowNear: number;
    private _shadowFar: number;
    private _guardrailsEnabled: boolean;
    private _guardrailActive: boolean;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      objectData: SpotLightObjectData,
      instanceData?: InstanceData
    ) {
      super(instanceContainer, objectData, instanceData);

      const objectContent = objectData.content;
      this._enabled =
        objectContent.enabled === undefined ? true : !!objectContent.enabled;
      this._color = objectContent.color || '255;255;255';
      this._intensity = Math.max(
        0,
        objectContent.intensity !== undefined ? objectContent.intensity : 1
      );
      this._distance = Math.max(
        0,
        objectContent.distance !== undefined ? objectContent.distance : 600
      );
      this._angle = clampSpotLightAngle(
        objectContent.angle !== undefined ? objectContent.angle : 45
      );
      this._penumbra = Math.max(
        0,
        Math.min(
          1,
          objectContent.penumbra !== undefined ? objectContent.penumbra : 0.1
        )
      );
      this._decay = Math.max(
        0,
        objectContent.decay !== undefined ? objectContent.decay : 2
      );
      this._castShadow = !!objectContent.castShadow;
      this._shadowQuality = clampShadowQuality(
        objectContent.shadowQuality || 'medium'
      );
      this._shadowBias =
        objectContent.shadowBias !== undefined
          ? objectContent.shadowBias
          : 0.001;
      this._shadowNormalBias = Math.max(
        0,
        objectContent.shadowNormalBias !== undefined
          ? objectContent.shadowNormalBias
          : 0.02
      );
      this._shadowRadius = Math.max(
        0,
        objectContent.shadowRadius !== undefined
          ? objectContent.shadowRadius
          : 1.5
      );
      this._shadowNear = Math.max(
        0.01,
        objectContent.shadowNear !== undefined ? objectContent.shadowNear : 1
      );
      this._shadowFar = Math.max(
        this._shadowNear + 1,
        objectContent.shadowFar !== undefined ? objectContent.shadowFar : 2000
      );
      this._guardrailsEnabled =
        objectContent.guardrailsEnabled === undefined
          ? true
          : !!objectContent.guardrailsEnabled;
      this._guardrailActive = true;

      this._renderer = new gdjs.SpotLightRuntimeObjectRenderer(
        this,
        instanceContainer
      );
      this._applyAllPropertiesToRenderer();

      gdjs.scene3d.spotLights.registerSpotLight(this);

      this.onCreated();
    }

    getRenderer(): gdjs.RuntimeObject3DRenderer {
      return this._renderer;
    }

    private _applyAllPropertiesToRenderer(): void {
      this._renderer.setColor(this._color);
      this._renderer.setIntensity(this._intensity);
      this._renderer.setDistance(this._distance);
      this._renderer.setAngle(this._angle);
      this._renderer.setPenumbra(this._penumbra);
      this._renderer.setDecay(this._decay);
      this._renderer.setCastShadow(this._castShadow);
      this._renderer.setShadowMapSize(
        shadowQualityToMapSize(this._shadowQuality)
      );
      this._renderer.setShadowBias(this._shadowBias);
      this._renderer.setShadowNormalBias(this._shadowNormalBias);
      this._renderer.setShadowRadius(this._shadowRadius);
      this._renderer.setShadowNear(this._shadowNear);
      this._renderer.setShadowFar(this._shadowFar);
      this._renderer.setRuntimeEnabled(this._enabled);
      this._renderer.setGuardrailActive(
        !this._guardrailsEnabled || this._guardrailActive
      );
    }

    override updateFromObjectData(
      oldObjectData: SpotLightObjectData,
      newObjectData: SpotLightObjectData
    ): boolean {
      super.updateFromObjectData(oldObjectData, newObjectData);

      const objectContent = newObjectData.content;
      this.setEnabled(
        objectContent.enabled === undefined ? true : !!objectContent.enabled
      );
      this.setColor(objectContent.color || '255;255;255');
      this.setIntensity(
        objectContent.intensity !== undefined ? objectContent.intensity : 1
      );
      this.setDistance(
        objectContent.distance !== undefined ? objectContent.distance : 600
      );
      this.setConeAngle(
        objectContent.angle !== undefined ? objectContent.angle : 45
      );
      this.setPenumbra(
        objectContent.penumbra !== undefined ? objectContent.penumbra : 0.1
      );
      this.setDecay(
        objectContent.decay !== undefined ? objectContent.decay : 2
      );
      this.setCastShadow(!!objectContent.castShadow);
      this.setShadowQuality(objectContent.shadowQuality || 'medium');
      this.setShadowBias(
        objectContent.shadowBias !== undefined
          ? objectContent.shadowBias
          : 0.001
      );
      this.setShadowNormalBias(
        objectContent.shadowNormalBias !== undefined
          ? objectContent.shadowNormalBias
          : 0.02
      );
      this.setShadowRadius(
        objectContent.shadowRadius !== undefined
          ? objectContent.shadowRadius
          : 1.5
      );
      this.setShadowNear(
        objectContent.shadowNear !== undefined ? objectContent.shadowNear : 1
      );
      this.setShadowFar(
        objectContent.shadowFar !== undefined ? objectContent.shadowFar : 2000
      );
      this.setGuardrailsEnabled(
        objectContent.guardrailsEnabled === undefined
          ? true
          : !!objectContent.guardrailsEnabled
      );

      return true;
    }

    override onDeletedFromScene(): void {
      gdjs.scene3d.spotLights.unregisterSpotLight(this);
      super.onDeletedFromScene();
    }

    override onDestroyed(): void {
      gdjs.scene3d.spotLights.unregisterSpotLight(this);
      super.onDestroyed();
    }

    override updatePreRender(): void {
      gdjs.scene3d.spotLights.updateGuardrailsForScene(this.getRuntimeScene());
    }

    override getNetworkSyncData(
      syncOptions: GetNetworkSyncDataOptions
    ): SpotLightObjectNetworkSyncData {
      return {
        ...super.getNetworkSyncData(syncOptions),
        en: this._enabled,
        c: this._color,
        i: this._intensity,
        d: this._distance,
        a: this._angle,
        p: this._penumbra,
        dc: this._decay,
        cs: this._castShadow,
        sq: this._shadowQuality,
        sb: this._shadowBias,
        snb: this._shadowNormalBias,
        sr: this._shadowRadius,
        sn: this._shadowNear,
        sf: this._shadowFar,
        ge: this._guardrailsEnabled,
        ga: this._guardrailActive,
      };
    }

    override updateFromNetworkSyncData(
      networkSyncData: SpotLightObjectNetworkSyncData,
      options: UpdateFromNetworkSyncDataOptions
    ): void {
      super.updateFromNetworkSyncData(networkSyncData, options);

      if (networkSyncData.en !== undefined) this.setEnabled(networkSyncData.en);
      if (networkSyncData.c !== undefined) this.setColor(networkSyncData.c);
      if (networkSyncData.i !== undefined) this.setIntensity(networkSyncData.i);
      if (networkSyncData.d !== undefined) this.setDistance(networkSyncData.d);
      if (networkSyncData.a !== undefined) this.setConeAngle(networkSyncData.a);
      if (networkSyncData.p !== undefined) this.setPenumbra(networkSyncData.p);
      if (networkSyncData.dc !== undefined) this.setDecay(networkSyncData.dc);
      if (networkSyncData.cs !== undefined)
        this.setCastShadow(networkSyncData.cs);
      if (networkSyncData.sq !== undefined)
        this.setShadowQuality(networkSyncData.sq);
      if (networkSyncData.sb !== undefined)
        this.setShadowBias(networkSyncData.sb);
      if (networkSyncData.snb !== undefined)
        this.setShadowNormalBias(networkSyncData.snb);
      if (networkSyncData.sr !== undefined)
        this.setShadowRadius(networkSyncData.sr);
      if (networkSyncData.sn !== undefined)
        this.setShadowNear(networkSyncData.sn);
      if (networkSyncData.sf !== undefined)
        this.setShadowFar(networkSyncData.sf);
      if (networkSyncData.ge !== undefined)
        this.setGuardrailsEnabled(networkSyncData.ge);
      if (networkSyncData.ga !== undefined)
        this.setGuardrailActive(networkSyncData.ga);
    }

    setEnabled(enabled: boolean): void {
      this._enabled = !!enabled;
      this._renderer.setRuntimeEnabled(this._enabled);
    }

    isEnabled(): boolean {
      return this._enabled;
    }

    isActiveAfterGuardrails(): boolean {
      return (
        this._enabled && (!this._guardrailsEnabled || this._guardrailActive)
      );
    }

    setColor(color: string): void {
      this._color = color;
      this._renderer.setColor(color);
    }

    getColor(): string {
      return this._color;
    }

    setIntensity(intensity: number): void {
      this._intensity = Math.max(0, intensity);
      this._renderer.setIntensity(this._intensity);
    }

    getIntensity(): number {
      return this._intensity;
    }

    setDistance(distance: number): void {
      this._distance = Math.max(0, distance);
      this._renderer.setDistance(this._distance);
    }

    getDistance(): number {
      return this._distance;
    }

    setConeAngle(angle: number): void {
      this._angle = clampSpotLightAngle(angle);
      this._renderer.setAngle(this._angle);
    }

    getConeAngle(): number {
      return this._angle;
    }

    setPenumbra(penumbra: number): void {
      this._penumbra = Math.max(0, Math.min(1, penumbra));
      this._renderer.setPenumbra(this._penumbra);
    }

    getPenumbra(): number {
      return this._penumbra;
    }

    setDecay(decay: number): void {
      this._decay = Math.max(0, decay);
      this._renderer.setDecay(this._decay);
    }

    getDecay(): number {
      return this._decay;
    }

    setCastShadow(castShadow: boolean): void {
      this._castShadow = !!castShadow;
      this._renderer.setCastShadow(this._castShadow);
    }

    isCastingShadow(): boolean {
      return this._castShadow;
    }

    setShadowQuality(shadowQuality: string): void {
      this._shadowQuality = clampShadowQuality(shadowQuality);
      this._renderer.setShadowMapSize(
        shadowQualityToMapSize(this._shadowQuality)
      );
    }

    getShadowQuality(): 'low' | 'medium' | 'high' {
      return this._shadowQuality;
    }

    setShadowBias(shadowBias: number): void {
      this._shadowBias = shadowBias;
      this._renderer.setShadowBias(this._shadowBias);
    }

    getShadowBias(): number {
      return this._shadowBias;
    }

    setShadowNormalBias(shadowNormalBias: number): void {
      this._shadowNormalBias = Math.max(0, shadowNormalBias);
      this._renderer.setShadowNormalBias(this._shadowNormalBias);
    }

    getShadowNormalBias(): number {
      return this._shadowNormalBias;
    }

    setShadowRadius(shadowRadius: number): void {
      this._shadowRadius = Math.max(0, shadowRadius);
      this._renderer.setShadowRadius(this._shadowRadius);
    }

    getShadowRadius(): number {
      return this._shadowRadius;
    }

    setShadowNear(shadowNear: number): void {
      this._shadowNear = Math.max(0.01, shadowNear);
      if (this._shadowFar < this._shadowNear + 1) {
        this._shadowFar = this._shadowNear + 1;
        this._renderer.setShadowFar(this._shadowFar);
      }
      this._renderer.setShadowNear(this._shadowNear);
    }

    getShadowNear(): number {
      return this._shadowNear;
    }

    setShadowFar(shadowFar: number): void {
      this._shadowFar = Math.max(this._shadowNear + 1, shadowFar);
      this._renderer.setShadowFar(this._shadowFar);
    }

    getShadowFar(): number {
      return this._shadowFar;
    }

    setGuardrailsEnabled(enabled: boolean): void {
      this._guardrailsEnabled = !!enabled;
      this._renderer.setGuardrailActive(
        !this._guardrailsEnabled || this._guardrailActive
      );
    }

    areGuardrailsEnabled(): boolean {
      return this._guardrailsEnabled;
    }

    shouldUseGuardrails(): boolean {
      return this._guardrailsEnabled && this._enabled && !this.isHidden();
    }

    setGuardrailActive(active: boolean): void {
      this._guardrailActive = !!active;
      this._renderer.setGuardrailActive(
        !this._guardrailsEnabled || this._guardrailActive
      );
    }

    getDistanceToCameraSquared(
      cameraX: number,
      cameraY: number,
      cameraZ: number
    ): number {
      const dx = this.getCenterXInScene() - cameraX;
      const dy = this.getCenterYInScene() - cameraY;
      const dz = this.getCenterZInScene() - cameraZ;
      return dx * dx + dy * dy + dz * dz;
    }
  }

  export class SpotLightRuntimeObjectRenderer extends gdjs.RuntimeObject3DRenderer {
    private _spotLight: THREE.SpotLight;
    private _shadowMapSize: integer;
    private _shadowMapDirty: boolean;
    private _shadowNear: number;
    private _shadowFar: number;
    private _shadowCameraDirty: boolean;
    private _runtimeEnabled: boolean;
    private _guardrailActive: boolean;

    constructor(
      runtimeObject: gdjs.SpotLightRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      const threeGroup = new THREE.Group();
      const spotLight = new THREE.SpotLight(
        0xffffff,
        1,
        600,
        gdjs.toRad(45),
        0.1,
        2
      );
      spotLight.position.set(0, 0, 0);
      spotLight.target.position.set(0, 0, -1);
      threeGroup.add(spotLight);
      threeGroup.add(spotLight.target);

      super(runtimeObject, instanceContainer, threeGroup);

      this._spotLight = spotLight;
      this._shadowMapSize = 1024;
      this._shadowMapDirty = true;
      this._shadowNear = 1;
      this._shadowFar = 2000;
      this._shadowCameraDirty = true;
      this._runtimeEnabled = true;
      this._guardrailActive = true;

      this.updateSize();
      this.updatePosition();
      this.updateRotation();
      this._updateShadowMapSize();
      this._updateShadowCamera();
      this._updateLightVisibility();
    }

    override updateSize(): void {
      // Keep spotlight transforms stable regardless of object scaling.
      this.updatePosition();
    }

    override updateRotation(): void {
      super.updateRotation();
      this._spotLight.target.position.set(0, 0, -1);
      this._spotLight.target.updateMatrixWorld(true);
    }

    override updateVisibility(): void {
      this._updateLightVisibility();
    }

    private _updateLightVisibility(): void {
      this._spotLight.visible =
        !this._object.isHidden() &&
        this._runtimeEnabled &&
        this._guardrailActive;
    }

    private _sanitizeShadowMapSize(size: number): integer {
      const safeSize = Math.max(256, Math.min(4096, Math.floor(size)));
      const power = Math.round(Math.log2(safeSize));
      return Math.max(256, Math.min(4096, Math.pow(2, power)));
    }

    private _updateShadowMapSize(): void {
      if (!this._shadowMapDirty || !this._spotLight.castShadow) {
        return;
      }
      this._shadowMapDirty = false;

      this._spotLight.shadow.mapSize.set(
        this._shadowMapSize,
        this._shadowMapSize
      );
      this._spotLight.shadow.map?.dispose();
      this._spotLight.shadow.map = null;
      this._spotLight.shadow.needsUpdate = true;
    }

    private _updateShadowCamera(): void {
      if (!this._shadowCameraDirty || !this._spotLight.castShadow) {
        return;
      }
      this._shadowCameraDirty = false;

      const safeNear = Math.max(0.01, this._shadowNear);
      const safeFar = Math.max(safeNear + 1, this._shadowFar);
      const shadowCamera = this._spotLight.shadow
        .camera as THREE.PerspectiveCamera;
      shadowCamera.near = safeNear;
      shadowCamera.far = safeFar;
      shadowCamera.fov = Math.max(
        2,
        Math.min(170, gdjs.toDegrees(this._spotLight.angle) * 2)
      );
      shadowCamera.updateProjectionMatrix();
      this._spotLight.shadow.needsUpdate = true;
    }

    setRuntimeEnabled(enabled: boolean): void {
      this._runtimeEnabled = !!enabled;
      this._updateLightVisibility();
    }

    setGuardrailActive(active: boolean): void {
      this._guardrailActive = !!active;
      this._updateLightVisibility();
    }

    setColor(color: string): void {
      this._spotLight.color.set(gdjs.rgbOrHexStringToNumber(color));
    }

    setIntensity(intensity: number): void {
      this._spotLight.intensity = Math.max(0, intensity);
    }

    setDistance(distance: number): void {
      this._spotLight.distance = Math.max(0, distance);
      this._shadowCameraDirty = true;
      this._updateShadowCamera();
    }

    setAngle(angleInDegrees: number): void {
      this._spotLight.angle = gdjs.toRad(clampSpotLightAngle(angleInDegrees));
      this._shadowCameraDirty = true;
      this._updateShadowCamera();
    }

    setPenumbra(penumbra: number): void {
      this._spotLight.penumbra = Math.max(0, Math.min(1, penumbra));
    }

    setDecay(decay: number): void {
      this._spotLight.decay = Math.max(0, decay);
    }

    setCastShadow(castShadow: boolean): void {
      this._spotLight.castShadow = !!castShadow;
      if (this._spotLight.castShadow) {
        this._shadowMapDirty = true;
        this._shadowCameraDirty = true;
      }
      this._updateShadowMapSize();
      this._updateShadowCamera();
    }

    setShadowMapSize(shadowMapSize: number): void {
      this._shadowMapSize = this._sanitizeShadowMapSize(shadowMapSize);
      this._shadowMapDirty = true;
      this._updateShadowMapSize();
    }

    setShadowBias(shadowBias: number): void {
      this._spotLight.shadow.bias = shadowBias;
    }

    setShadowNormalBias(shadowNormalBias: number): void {
      this._spotLight.shadow.normalBias = Math.max(0, shadowNormalBias);
    }

    setShadowRadius(shadowRadius: number): void {
      this._spotLight.shadow.radius = Math.max(0, shadowRadius);
    }

    setShadowNear(shadowNear: number): void {
      this._shadowNear = Math.max(0.01, shadowNear);
      this._shadowCameraDirty = true;
      this._updateShadowCamera();
    }

    setShadowFar(shadowFar: number): void {
      this._shadowFar = Math.max(this._shadowNear + 1, shadowFar);
      this._shadowCameraDirty = true;
      this._updateShadowCamera();
    }
  }

  gdjs.registerObject('Scene3D::SpotLightObject', gdjs.SpotLightRuntimeObject);
}
