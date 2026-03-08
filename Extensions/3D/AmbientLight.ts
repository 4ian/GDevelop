namespace gdjs {
  interface AmbientLightFilterNetworkSyncData {
    i: number;
    c: number;
    sm?: number;
    lme?: boolean;
    lmr?: string;
    lmi?: number;
    lmd?: number;
    lau?: boolean;
    lom?: boolean;
  }

  interface LightingPipelineState {
    mode?: string;
    realtimeWeight?: number;
    bakedWeight?: number;
  }

  const lightingPipelineStateKey = '__gdScene3dLightingPipelineState';

  const getLightingPipelineState = (
    scene: THREE.Scene | null | undefined
  ): LightingPipelineState | null => {
    if (!scene) {
      return null;
    }
    const state = (scene as THREE.Scene & {
      userData?: { [key: string]: any };
    }).userData?.[lightingPipelineStateKey] as LightingPipelineState | undefined;
    return state || null;
  };

  const getRealtimeLightingMultiplier = (
    state: LightingPipelineState | null
  ): number => {
    if (!state || !state.mode) {
      return 1;
    }
    if (state.mode === 'realtime') {
      return 1;
    }
    if (state.mode === 'baked') {
      return 0;
    }
    return gdjs.evtTools.common.clamp(
      0,
      1,
      state.realtimeWeight !== undefined ? state.realtimeWeight : 0.75
    );
  };

  const getBakedLightingMultiplier = (
    state: LightingPipelineState | null
  ): number => {
    if (!state || !state.mode) {
      return 1;
    }
    if (state.mode === 'realtime') {
      return 0;
    }
    if (state.mode === 'baked') {
      return Math.max(0, state.bakedWeight !== undefined ? state.bakedWeight : 1);
    }
    return Math.max(0, state.bakedWeight !== undefined ? state.bakedWeight : 1);
  };

  type LightMapCompatibleMaterial =
    | THREE.MeshBasicMaterial
    | THREE.MeshLambertMaterial
    | THREE.MeshPhongMaterial
    | THREE.MeshStandardMaterial
    | THREE.MeshPhysicalMaterial;

  interface AmbientLightMapMaterialState {
    lightMap: THREE.Texture | null;
    lightMapIntensity: number;
    touchedByAmbientLightMap: boolean;
  }

  const clampAmbientLightMapIntensity = (value: number): number =>
    Math.max(0, value);
  const clampAmbientLightMapDynamicBlend = (value: number): number =>
    gdjs.evtTools.common.clamp(0, 1, value);

  const isLightMapCompatibleMaterial = (
    material: THREE.Material
  ): material is LightMapCompatibleMaterial =>
    material instanceof THREE.MeshBasicMaterial ||
    material instanceof THREE.MeshLambertMaterial ||
    material instanceof THREE.MeshPhongMaterial ||
    material instanceof THREE.MeshStandardMaterial ||
    material instanceof THREE.MeshPhysicalMaterial;

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::AmbientLight',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          light: THREE.AmbientLight;
          _isEnabled: boolean;
          _targetIntensity: number;
          _targetColor: THREE.Color;
          _smoothing: number;
          _lightMapEnabled: boolean;
          _lightMapResourceName: string;
          _lightMapIntensity: number;
          _lightMapDynamicBlend: number;
          _lightMapAutoAssignUv2: boolean;
          _lightMapOnlyIfMissing: boolean;
          _lightMapTexture: THREE.Texture | null;
          _materialStates: WeakMap<
            LightMapCompatibleMaterial,
            AmbientLightMapMaterialState
          >;
          _touchedMaterials: Set<LightMapCompatibleMaterial>;
          _needsLightMapRefresh: boolean;
          _elapsedSinceLightMapRefresh: number;

          constructor() {
            this.light = new THREE.AmbientLight();
            this._isEnabled = false;
            this._targetIntensity = Math.max(
              0,
              effectData.doubleParameters.intensity !== undefined
                ? effectData.doubleParameters.intensity
                : this.light.intensity
            );
            this._targetColor = new THREE.Color(
              gdjs.rgbOrHexStringToNumber(
                effectData.stringParameters.color || '255;255;255'
              )
            );
            this._smoothing = Math.max(
              0,
              effectData.doubleParameters.smoothing !== undefined
                ? effectData.doubleParameters.smoothing
                : 0
            );
            this._lightMapEnabled =
              effectData.booleanParameters.lightMapEnabled === undefined
                ? false
                : !!effectData.booleanParameters.lightMapEnabled;
            this._lightMapResourceName =
              effectData.stringParameters.lightMapResourceName || '';
            this._lightMapIntensity = clampAmbientLightMapIntensity(
              effectData.doubleParameters.lightMapIntensity !== undefined
                ? effectData.doubleParameters.lightMapIntensity
                : 1
            );
            this._lightMapDynamicBlend = clampAmbientLightMapDynamicBlend(
              effectData.doubleParameters.lightMapDynamicBlend !== undefined
                ? effectData.doubleParameters.lightMapDynamicBlend
                : 0.35
            );
            this._lightMapAutoAssignUv2 =
              effectData.booleanParameters.lightMapAutoAssignUv2 === undefined
                ? true
                : !!effectData.booleanParameters.lightMapAutoAssignUv2;
            this._lightMapOnlyIfMissing =
              effectData.booleanParameters.lightMapOnlyIfMissing === undefined
                ? true
                : !!effectData.booleanParameters.lightMapOnlyIfMissing;
            this._lightMapTexture = null;
            this._materialStates = new WeakMap();
            this._touchedMaterials = new Set();
            this._needsLightMapRefresh = true;
            this._elapsedSinceLightMapRefresh = 0;
            this.light.intensity = this._targetIntensity;
            this.light.color.copy(this._targetColor);
          }

          private _getScene(target: EffectsTarget): THREE.Scene | null {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            return scene || null;
          }

          private _resolveLightMapTexture(
            target: EffectsTarget
          ): THREE.Texture | null {
            if (!this._lightMapResourceName) {
              return null;
            }
            if (this._lightMapTexture) {
              return this._lightMapTexture;
            }
            this._lightMapTexture = target
              .getRuntimeScene()
              .getGame()
              .getImageManager()
              .getThreeTexture(this._lightMapResourceName);
            return this._lightMapTexture;
          }

          private _rememberMaterialState(
            material: LightMapCompatibleMaterial
          ): AmbientLightMapMaterialState {
            const existingState = this._materialStates.get(material);
            if (existingState) {
              return existingState;
            }
            const state: AmbientLightMapMaterialState = {
              lightMap: material.lightMap || null,
              lightMapIntensity:
                typeof material.lightMapIntensity === 'number'
                  ? material.lightMapIntensity
                  : 1,
              touchedByAmbientLightMap: false,
            };
            this._materialStates.set(material, state);
            return state;
          }

          private _ensureUv2IfMissing(geometry: THREE.BufferGeometry): void {
            if (!this._lightMapAutoAssignUv2) {
              return;
            }
            if (geometry.getAttribute('uv2')) {
              return;
            }
            const uv = geometry.getAttribute('uv');
            if (!uv || uv.itemSize < 2) {
              return;
            }
            geometry.setAttribute('uv2', uv.clone());
          }

          private _computeDynamicLightScale(scene: THREE.Scene): number {
            if (this._lightMapDynamicBlend <= 0) {
              return 1;
            }

            let weightedIntensity = 0;
            scene.traverse((object: THREE.Object3D) => {
              const maybeLight = object as THREE.Light & { isLight?: boolean };
              if (!maybeLight.isLight || !maybeLight.visible) {
                return;
              }
              if (maybeLight === this.light) {
                return;
              }

              const baseIntensity = Math.max(0, maybeLight.intensity || 0);
              if (baseIntensity <= 0) {
                return;
              }

              let weight = 1;
              if (maybeLight instanceof THREE.AmbientLight) {
                weight = 0.35;
              } else if (maybeLight instanceof THREE.HemisphereLight) {
                weight = 0.45;
              } else if (maybeLight instanceof THREE.DirectionalLight) {
                weight = 0.7;
              }
              weightedIntensity += baseIntensity * weight;
            });

            const normalizedDynamicIntensity =
              weightedIntensity / (1 + weightedIntensity);
            return Math.max(
              0.1,
              1 - this._lightMapDynamicBlend * normalizedDynamicIntensity
            );
          }

          private _applyLightMapToMaterial(
            material: LightMapCompatibleMaterial,
            lightMapTexture: THREE.Texture,
            effectiveIntensity: number
          ): void {
            const savedState = this._rememberMaterialState(material);
            if (
              this._lightMapOnlyIfMissing &&
              savedState.lightMap &&
              savedState.lightMap !== lightMapTexture
            ) {
              return;
            }

            const shouldUpdateLightMap = material.lightMap !== lightMapTexture;
            const shouldUpdateIntensity =
              Math.abs(material.lightMapIntensity - effectiveIntensity) >
              0.0001;
            if (!shouldUpdateLightMap && !shouldUpdateIntensity) {
              return;
            }

            material.lightMap = lightMapTexture;
            material.lightMapIntensity = effectiveIntensity;
            material.needsUpdate = true;
            savedState.touchedByAmbientLightMap = true;
            this._touchedMaterials.add(material);
          }

          private _refreshSceneLightMap(target: EffectsTarget): void {
            const scene = this._getScene(target);
            if (!scene) {
              return;
            }
            if (!this._lightMapEnabled) {
              this._restoreOriginalMaterials();
              return;
            }

            const lightMapTexture = this._resolveLightMapTexture(target);
            if (!lightMapTexture) {
              this._restoreOriginalMaterials();
              return;
            }

            const pipelineState = getLightingPipelineState(scene);
            const bakedMultiplier = getBakedLightingMultiplier(pipelineState);
            if (bakedMultiplier <= 0.0001) {
              this._restoreOriginalMaterials();
              return;
            }

            const effectiveIntensity =
              this._lightMapIntensity *
              bakedMultiplier *
              this._computeDynamicLightScale(scene);

            scene.traverse((object: THREE.Object3D) => {
              const mesh = object as THREE.Mesh;
              if (!mesh.isMesh) {
                return;
              }

              const geometry = mesh.geometry as
                | THREE.BufferGeometry
                | undefined;
              if (geometry) {
                this._ensureUv2IfMissing(geometry);
              }

              const materials = Array.isArray(mesh.material)
                ? mesh.material
                : [mesh.material];
              for (const material of materials) {
                if (!material || !isLightMapCompatibleMaterial(material)) {
                  continue;
                }
                this._applyLightMapToMaterial(
                  material,
                  lightMapTexture,
                  effectiveIntensity
                );
              }
            });
          }

          private _restoreOriginalMaterials(): void {
            if (this._touchedMaterials.size === 0) {
              return;
            }

            for (const material of this._touchedMaterials) {
              const state = this._materialStates.get(material);
              if (!state || !state.touchedByAmbientLightMap) {
                continue;
              }

              material.lightMap = state.lightMap;
              material.lightMapIntensity = state.lightMapIntensity;
              material.needsUpdate = true;
              state.touchedByAmbientLightMap = false;
            }
            this._touchedMaterials.clear();
          }

          isEnabled(target: EffectsTarget): boolean {
            return this._isEnabled;
          }
          setEnabled(target: EffectsTarget, enabled: boolean): boolean {
            if (this._isEnabled === enabled) {
              return true;
            }
            if (enabled) {
              return this.applyEffect(target);
            } else {
              return this.removeEffect(target);
            }
          }
          applyEffect(target: EffectsTarget): boolean {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (!scene) {
              return false;
            }
            scene.add(this.light);
            this._isEnabled = true;
            this._needsLightMapRefresh = true;
            this._elapsedSinceLightMapRefresh = 0;
            if (this._lightMapEnabled) {
              this._refreshSceneLightMap(target);
              this._needsLightMapRefresh = false;
            }
            return true;
          }
          removeEffect(target: EffectsTarget): boolean {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (!scene) {
              return false;
            }
            scene.remove(this.light);
            this._restoreOriginalMaterials();
            this._isEnabled = false;
            this._elapsedSinceLightMapRefresh = 0;
            this._needsLightMapRefresh = true;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled) {
              return;
            }

            const runtimeScene = target.getRuntimeScene
              ? target.getRuntimeScene()
              : null;
            const scene = this._getScene(target);
            const realtimeMultiplier = getRealtimeLightingMultiplier(
              getLightingPipelineState(scene)
            );
            const effectiveTargetIntensity =
              this._targetIntensity * realtimeMultiplier;
            if (this._smoothing <= 0) {
              this.light.intensity = effectiveTargetIntensity;
              this.light.color.copy(this._targetColor);
            } else if (!runtimeScene) {
              this.light.intensity = effectiveTargetIntensity;
              this.light.color.copy(this._targetColor);
            } else {
              const deltaTime = Math.max(
                0,
                runtimeScene.getElapsedTime() / 1000
              );
              if (deltaTime > 0) {
                const alpha = 1 - Math.exp(-this._smoothing * deltaTime);
                this.light.intensity +=
                  (effectiveTargetIntensity - this.light.intensity) * alpha;
                this.light.color.lerp(this._targetColor, alpha);
              }
            }

            const deltaTime = runtimeScene
              ? Math.max(0, runtimeScene.getElapsedTime() / 1000)
              : 0;
            this._elapsedSinceLightMapRefresh += deltaTime;

            if (!this._lightMapEnabled) {
              this._restoreOriginalMaterials();
              this._elapsedSinceLightMapRefresh = 0;
              return;
            }

            const refreshInterval = this._lightMapDynamicBlend > 0 ? 0.12 : 0.35;
            if (
              this._needsLightMapRefresh ||
              this._elapsedSinceLightMapRefresh >= refreshInterval
            ) {
              this._refreshSceneLightMap(target);
              this._elapsedSinceLightMapRefresh = 0;
              this._needsLightMapRefresh = false;
            }
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this._targetIntensity = Math.max(0, value);
              if (this._smoothing <= 0) {
                this.light.intensity = this._targetIntensity;
              }
            } else if (parameterName === 'smoothing') {
              this._smoothing = Math.max(0, value);
              if (this._smoothing <= 0) {
                this.light.intensity = this._targetIntensity;
                this.light.color.copy(this._targetColor);
              }
            } else if (parameterName === 'lightMapIntensity') {
              this._lightMapIntensity = clampAmbientLightMapIntensity(value);
              this._needsLightMapRefresh = true;
            } else if (parameterName === 'lightMapDynamicBlend') {
              this._lightMapDynamicBlend = clampAmbientLightMapDynamicBlend(
                value
              );
              this._needsLightMapRefresh = true;
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._targetIntensity;
            }
            if (parameterName === 'smoothing') {
              return this._smoothing;
            }
            if (parameterName === 'lightMapIntensity') {
              return this._lightMapIntensity;
            }
            if (parameterName === 'lightMapDynamicBlend') {
              return this._lightMapDynamicBlend;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'color') {
              this._targetColor.setHex(gdjs.rgbOrHexStringToNumber(value));
              if (this._smoothing <= 0) {
                this.light.color.copy(this._targetColor);
              }
            } else if (parameterName === 'lightMapResourceName') {
              if (this._lightMapResourceName === value) {
                return;
              }
              this._lightMapResourceName = value || '';
              this._lightMapTexture = null;
              this._needsLightMapRefresh = true;
            }
          }
          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'color') {
              this._targetColor.setHex(value);
              if (this._smoothing <= 0) {
                this.light.color.copy(this._targetColor);
              }
            }
          }
          getColorParameter(parameterName: string): number {
            if (parameterName === 'color') {
              return this._targetColor.getHex();
            }
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'lightMapEnabled') {
              this._lightMapEnabled = value;
              this._needsLightMapRefresh = true;
              if (!value) {
                this._restoreOriginalMaterials();
              }
            } else if (parameterName === 'lightMapAutoAssignUv2') {
              this._lightMapAutoAssignUv2 = value;
              this._needsLightMapRefresh = true;
            } else if (parameterName === 'lightMapOnlyIfMissing') {
              this._lightMapOnlyIfMissing = value;
              this._needsLightMapRefresh = true;
            }
          }
          getNetworkSyncData(): AmbientLightFilterNetworkSyncData {
            return {
              i: this._targetIntensity,
              c: this._targetColor.getHex(),
              sm: this._smoothing,
              lme: this._lightMapEnabled,
              lmr: this._lightMapResourceName,
              lmi: this._lightMapIntensity,
              lmd: this._lightMapDynamicBlend,
              lau: this._lightMapAutoAssignUv2,
              lom: this._lightMapOnlyIfMissing,
            };
          }
          updateFromNetworkSyncData(data: AmbientLightFilterNetworkSyncData) {
            this._targetIntensity = Math.max(0, data.i);
            this._targetColor.setHex(data.c);
            this._smoothing = Math.max(0, data.sm ?? this._smoothing);
            this._lightMapEnabled = data.lme ?? this._lightMapEnabled;
            if (data.lmr !== undefined && data.lmr !== this._lightMapResourceName) {
              this._lightMapResourceName = data.lmr || '';
              this._lightMapTexture = null;
            }
            this._lightMapIntensity = clampAmbientLightMapIntensity(
              data.lmi ?? this._lightMapIntensity
            );
            this._lightMapDynamicBlend = clampAmbientLightMapDynamicBlend(
              data.lmd ?? this._lightMapDynamicBlend
            );
            this._lightMapAutoAssignUv2 =
              data.lau ?? this._lightMapAutoAssignUv2;
            this._lightMapOnlyIfMissing =
              data.lom ?? this._lightMapOnlyIfMissing;
            if (this._smoothing <= 0) {
              this.light.intensity = this._targetIntensity;
              this.light.color.copy(this._targetColor);
            }
            this._needsLightMapRefresh = true;
            if (!this._lightMapEnabled) {
              this._restoreOriginalMaterials();
            }
          }
        })();
      }
    })()
  );
}
