namespace gdjs {
  interface RuntimeLightMapNetworkSyncData {
    r: string;
    i: number;
    d: number;
    e: boolean;
    au?: boolean;
    om?: boolean;
  }

  interface LightingPipelineState {
    mode?: string;
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

  const getBakedLightingMultiplier = (
    state: LightingPipelineState | null
  ): number => {
    if (!state || !state.mode) {
      return 1;
    }
    if (state.mode === 'realtime') {
      return 0;
    }
    return Math.max(0, state.bakedWeight !== undefined ? state.bakedWeight : 1);
  };

  type LightMapCompatibleMaterial =
    | THREE.MeshBasicMaterial
    | THREE.MeshLambertMaterial
    | THREE.MeshPhongMaterial
    | THREE.MeshStandardMaterial
    | THREE.MeshPhysicalMaterial;

  interface RuntimeLightMapMaterialState {
    lightMap: THREE.Texture | null;
    lightMapIntensity: number;
    touchedByRuntimeLightMap: boolean;
  }

  const clampRuntimeLightMapIntensity = (value: number): number =>
    Math.max(0, value);
  const clampRuntimeLightMapDynamicBlend = (value: number): number =>
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
    'Scene3D::RuntimeLightMap',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }

        return new (class implements gdjs.PixiFiltersTools.Filter {
          _isEnabled: boolean;
          _effectEnabled: boolean;
          _lightMapResourceName: string;
          _lightMapIntensity: number;
          _dynamicBlend: number;
          _autoAssignUv2: boolean;
          _onlyIfMissingLightMap: boolean;
          _lightMapTexture: THREE.Texture | null;
          _materialStates: WeakMap<
            LightMapCompatibleMaterial,
            RuntimeLightMapMaterialState
          >;
          _touchedMaterials: Set<LightMapCompatibleMaterial>;
          _needsRefresh: boolean;
          _elapsedSinceRefresh: number;

          constructor() {
            this._isEnabled = false;
            this._effectEnabled =
              effectData.booleanParameters.enabled === undefined
                ? true
                : !!effectData.booleanParameters.enabled;
            this._lightMapResourceName =
              effectData.stringParameters.lightMapResourceName || '';
            this._lightMapIntensity = clampRuntimeLightMapIntensity(
              effectData.doubleParameters.lightMapIntensity !== undefined
                ? effectData.doubleParameters.lightMapIntensity
                : 1
            );
            this._dynamicBlend = clampRuntimeLightMapDynamicBlend(
              effectData.doubleParameters.dynamicBlend !== undefined
                ? effectData.doubleParameters.dynamicBlend
                : 0.35
            );
            this._autoAssignUv2 =
              effectData.booleanParameters.autoAssignUv2 === undefined
                ? true
                : !!effectData.booleanParameters.autoAssignUv2;
            this._onlyIfMissingLightMap =
              effectData.booleanParameters.onlyIfMissingLightMap === undefined
                ? true
                : !!effectData.booleanParameters.onlyIfMissingLightMap;
            this._lightMapTexture = null;
            this._materialStates = new WeakMap();
            this._touchedMaterials = new Set();
            this._needsRefresh = true;
            this._elapsedSinceRefresh = 0;
            void target;
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
          ): RuntimeLightMapMaterialState {
            const existingState = this._materialStates.get(material);
            if (existingState) {
              return existingState;
            }

            const state: RuntimeLightMapMaterialState = {
              lightMap: material.lightMap || null,
              lightMapIntensity:
                typeof material.lightMapIntensity === 'number'
                  ? material.lightMapIntensity
                  : 1,
              touchedByRuntimeLightMap: false,
            };
            this._materialStates.set(material, state);
            return state;
          }

          private _ensureUv2IfMissing(geometry: THREE.BufferGeometry): void {
            if (!this._autoAssignUv2) {
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
            if (this._dynamicBlend <= 0) {
              return 1;
            }

            let weightedIntensity = 0;
            scene.traverse((object: THREE.Object3D) => {
              const maybeLight = object as THREE.Light & { isLight?: boolean };
              if (!maybeLight.isLight || !maybeLight.visible) {
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
              1 - this._dynamicBlend * normalizedDynamicIntensity
            );
          }

          private _applyLightMapToMaterial(
            material: LightMapCompatibleMaterial,
            lightMapTexture: THREE.Texture,
            effectiveIntensity: number
          ): void {
            const savedState = this._rememberMaterialState(material);
            if (
              this._onlyIfMissingLightMap &&
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
            savedState.touchedByRuntimeLightMap = true;
            this._touchedMaterials.add(material);
          }

          private _refreshSceneLightMap(target: EffectsTarget): void {
            const scene = this._getScene(target);
            if (!scene) {
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
              if (!state || !state.touchedByRuntimeLightMap) {
                continue;
              }

              material.lightMap = state.lightMap;
              material.lightMapIntensity = state.lightMapIntensity;
              material.needsUpdate = true;
              state.touchedByRuntimeLightMap = false;
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
            }
            return this.removeEffect(target);
          }

          applyEffect(target: EffectsTarget): boolean {
            this._isEnabled = true;
            this._needsRefresh = true;
            this._elapsedSinceRefresh = 0;
            if (this._effectEnabled) {
              this._refreshSceneLightMap(target);
            }
            return true;
          }

          removeEffect(target: EffectsTarget): boolean {
            this._restoreOriginalMaterials();
            this._isEnabled = false;
            this._elapsedSinceRefresh = 0;
            this._needsRefresh = true;
            return true;
          }

          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled) {
              return;
            }

            const runtimeScene = target.getRuntimeScene();
            const deltaTime = Math.max(0, runtimeScene.getElapsedTime() / 1000);
            this._elapsedSinceRefresh += deltaTime;

            if (!this._effectEnabled) {
              this._restoreOriginalMaterials();
              return;
            }

            const refreshInterval = this._dynamicBlend > 0 ? 0.12 : 0.35;
            if (
              this._needsRefresh ||
              this._elapsedSinceRefresh >= refreshInterval
            ) {
              this._refreshSceneLightMap(target);
              this._elapsedSinceRefresh = 0;
              this._needsRefresh = false;
            }
          }

          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'lightMapIntensity') {
              this._lightMapIntensity = clampRuntimeLightMapIntensity(value);
              this._needsRefresh = true;
            } else if (parameterName === 'dynamicBlend') {
              this._dynamicBlend = clampRuntimeLightMapDynamicBlend(value);
              this._needsRefresh = true;
            }
          }

          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'lightMapIntensity') {
              return this._lightMapIntensity;
            }
            if (parameterName === 'dynamicBlend') {
              return this._dynamicBlend;
            }
            return 0;
          }

          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'lightMapResourceName') {
              if (this._lightMapResourceName === value) {
                return;
              }
              this._lightMapResourceName = value || '';
              this._lightMapTexture = null;
              this._needsRefresh = true;
            }
          }

          updateColorParameter(parameterName: string, value: number): void {}

          getColorParameter(parameterName: string): number {
            return 0;
          }

          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'enabled') {
              this._effectEnabled = value;
              this._needsRefresh = true;
              if (!value) {
                this._restoreOriginalMaterials();
              }
            } else if (parameterName === 'autoAssignUv2') {
              this._autoAssignUv2 = value;
              this._needsRefresh = true;
            } else if (parameterName === 'onlyIfMissingLightMap') {
              this._onlyIfMissingLightMap = value;
              this._needsRefresh = true;
            }
          }

          getNetworkSyncData(): RuntimeLightMapNetworkSyncData {
            return {
              r: this._lightMapResourceName,
              i: this._lightMapIntensity,
              d: this._dynamicBlend,
              e: this._effectEnabled,
              au: this._autoAssignUv2,
              om: this._onlyIfMissingLightMap,
            };
          }

          updateFromNetworkSyncData(
            syncData: RuntimeLightMapNetworkSyncData
          ): void {
            this._lightMapResourceName = syncData.r || '';
            this._lightMapIntensity = clampRuntimeLightMapIntensity(syncData.i);
            this._dynamicBlend = clampRuntimeLightMapDynamicBlend(syncData.d);
            this._effectEnabled = !!syncData.e;
            this._autoAssignUv2 = syncData.au ?? true;
            this._onlyIfMissingLightMap = syncData.om ?? true;
            this._lightMapTexture = null;
            this._needsRefresh = true;
          }
        })();
      }
    })()
  );
}
