namespace gdjs {
  export namespace scene3d {
    export namespace shadows {
      export type ShadowMapTypeName = 'pcf' | 'basic';
      export type ShadowQualityName = 'low' | 'medium' | 'high' | 'ultra';

      export interface GlobalShadowSettings {
        enabled: boolean;
        shadowMapType: ShadowMapTypeName;
        autoUpdate: boolean;
        directionalShadowQuality: ShadowQualityName;
      }

      export interface ApplyDirectionalLightShadowOptions {
        castShadow: boolean;
        frustumSize: number;
        distanceFromCamera: number;
        forceUpdate?: boolean;
        baseBias: number;
        normalBias: number;
      }

      const defaultSettings: GlobalShadowSettings = {
        enabled: false,
        shadowMapType: 'pcf',
        autoUpdate: true,
        directionalShadowQuality: 'medium',
      };

      type DirectionalLightShadowState = {
        castShadow: boolean;
        shadowMapType: ShadowMapTypeName;
        shadowMapSize: number;
        shadowCameraNear: number;
        shadowCameraFar: number;
        shadowCameraRight: number;
        shadowCameraLeft: number;
        shadowCameraTop: number;
        shadowCameraBottom: number;
        bias: number;
        normalBias: number;
      };

      type ShadowLayerState = {
        settings: GlobalShadowSettings;
        shadowSettingsObservers: Set<() => void>;
        directionalLightShadowStates: WeakMap<
          THREE.DirectionalLight,
          DirectionalLightShadowState
        >;
        shadowMapUpdateRequested: boolean;
      };

      const createShadowLayerState = (): ShadowLayerState => ({
        settings: {
          ...defaultSettings,
        },
        shadowSettingsObservers: new Set<() => void>(),
        directionalLightShadowStates: new WeakMap<
          THREE.DirectionalLight,
          DirectionalLightShadowState
        >(),
        shadowMapUpdateRequested: false,
      });

      const defaultShadowLayerState = createShadowLayerState();
      const shadowSceneStates = new WeakMap<gdjs.RuntimeScene, ShadowLayerState>();

      const getShadowLayerState = (
        runtimeLayerOrUnknown: unknown
      ): ShadowLayerState => {
        const runtimeLayer =
          typeof gdjs.RuntimeLayer !== 'undefined' &&
          runtimeLayerOrUnknown instanceof gdjs.RuntimeLayer
            ? runtimeLayerOrUnknown
            : null;
        if (!runtimeLayer) {
          return defaultShadowLayerState;
        }
        const runtimeScene = runtimeLayer.getRuntimeScene();
        const existingShadowLayerState = shadowSceneStates.get(runtimeScene);
        if (existingShadowLayerState) {
          return existingShadowLayerState;
        }
        const createdShadowLayerState = createShadowLayerState();
        shadowSceneStates.set(runtimeScene, createdShadowLayerState);
        return createdShadowLayerState;
      };

      const directionalLightShadowCameraNear = 1;
      const directionalLightExtraFarDistance = 3000;

      const requestShadowMapUpdate = (shadowLayerState: ShadowLayerState) => {
        shadowLayerState.shadowMapUpdateRequested = true;
      };

      const areSettingsEqual = (
        left: GlobalShadowSettings,
        right: GlobalShadowSettings
      ): boolean =>
        left.enabled === right.enabled &&
        left.shadowMapType === right.shadowMapType &&
        left.directionalShadowQuality === right.directionalShadowQuality;

      const getEffectiveShadowBaseBias = (
        rawBaseBias: number,
        _shadowMapTypeName: ShadowMapTypeName
      ): number => rawBaseBias;

      const getEffectiveShadowNormalBias = (
        rawNormalBias: number,
        _shadowMapTypeName: ShadowMapTypeName
      ): number => rawNormalBias;

      const notifyShadowSettingsObservers = (shadowLayerState: ShadowLayerState) => {
        shadowLayerState.shadowSettingsObservers.forEach((refreshShadows) => {
          refreshShadows();
        });
      };

      export const getDefaultSettings = (): GlobalShadowSettings => ({
        ...defaultSettings,
      });

      export const getSettings = (
        runtimeLayer: gdjs.RuntimeLayer | null = null
      ): GlobalShadowSettings => getShadowLayerState(runtimeLayer).settings;

      export const resetSettings = (
        runtimeLayer: gdjs.RuntimeLayer | null = null
      ): void => {
        const shadowLayerState = getShadowLayerState(runtimeLayer);
        const newSettings = {
          ...defaultSettings,
          autoUpdate: true,
        };
        if (areSettingsEqual(shadowLayerState.settings, newSettings)) {
          return;
        }
        shadowLayerState.settings = newSettings;
        requestShadowMapUpdate(shadowLayerState);
        notifyShadowSettingsObservers(shadowLayerState);
      };

      export const updateSettings = (
        runtimeLayer: gdjs.RuntimeLayer | null,
        partialSettings: Partial<GlobalShadowSettings>
      ): void => {
        const shadowLayerState = getShadowLayerState(runtimeLayer);
        const newSettings = {
          ...shadowLayerState.settings,
          ...partialSettings,
          autoUpdate: true,
        };
        if (areSettingsEqual(shadowLayerState.settings, newSettings)) {
          return;
        }
        shadowLayerState.settings = newSettings;
        requestShadowMapUpdate(shadowLayerState);
        notifyShadowSettingsObservers(shadowLayerState);
      };

      export const registerShadowSettingsObserver = (
        runtimeLayer: gdjs.RuntimeLayer | null,
        refreshShadows: () => void
      ): (() => void) => {
        const shadowLayerState = getShadowLayerState(runtimeLayer);
        shadowLayerState.shadowSettingsObservers.add(refreshShadows);
        return () => {
          shadowLayerState.shadowSettingsObservers.delete(refreshShadows);
        };
      };

      export const getShadowMapType = (
        shadowMapTypeName: ShadowMapTypeName
      ): THREE.ShadowMapType => {
        if (shadowMapTypeName === 'basic') {
          return THREE.BasicShadowMap;
        }
        return THREE.PCFShadowMap;
      };

      export const getShadowMapSizeForQuality = (quality: string): number => {
        if (quality === 'low') {
          return 512;
        }
        if (quality === 'high') {
          return 2048;
        }
        if (quality === 'ultra') {
          return 4096;
        }
        return 1024;
      };

      export const getShadowBiasMultiplier = (shadowMapSize: number): number => {
        if (shadowMapSize < 1024) {
          return 2;
        }
        if (shadowMapSize < 2048) {
          return 1.25;
        }
        return 1;
      };

      export const applyToThreeRenderer = (
        runtimeLayer: gdjs.RuntimeLayer | null,
        threeRenderer: THREE.WebGLRenderer | null
      ): void => {
        if (!threeRenderer) {
          return;
        }
        const shadowLayerState = getShadowLayerState(runtimeLayer);
        const settings = shadowLayerState.settings;
        const shadowMap = threeRenderer.shadowMap;
        const expectedShadowMapType = getShadowMapType(settings.shadowMapType);
        const didRendererConfigChange =
          shadowMap.enabled !== settings.enabled ||
          shadowMap.type !== expectedShadowMapType ||
          shadowMap.autoUpdate !== true;

        shadowMap.enabled = settings.enabled;
        shadowMap.type = expectedShadowMapType;
        shadowMap.autoUpdate = true;

        if (didRendererConfigChange) {
          requestShadowMapUpdate(shadowLayerState);
        }

        if (shadowLayerState.shadowMapUpdateRequested) {
          shadowMap.needsUpdate = true;
          shadowLayerState.shadowMapUpdateRequested = false;
        }
      };

      export const applyDirectionalLightShadow = (
        runtimeLayer: gdjs.RuntimeLayer | null,
        directionalLight: THREE.DirectionalLight,
        options: ApplyDirectionalLightShadowOptions
      ): void => {
        const shadowLayerState = getShadowLayerState(runtimeLayer);
        const settings = shadowLayerState.settings;
        const directionalLightShadowStates =
          shadowLayerState.directionalLightShadowStates;
        const previousState = directionalLightShadowStates.get(directionalLight);
        const shadowMapType = settings.shadowMapType;
        const shadowMapSize = getShadowMapSizeForQuality(
          settings.directionalShadowQuality
        );
        const castShadow = settings.enabled && options.castShadow;
        let didUpdate = options.forceUpdate || false;

        if (directionalLight.castShadow !== castShadow) {
          directionalLight.castShadow = castShadow;
          didUpdate = true;
        }
        if (!castShadow) {
          directionalLightShadowStates.set(directionalLight, {
            castShadow,
            shadowMapType,
            shadowMapSize,
            shadowCameraNear: directionalLight.shadow.camera.near,
            shadowCameraFar: directionalLight.shadow.camera.far,
            shadowCameraRight: (directionalLight.shadow.camera as any).right || 0,
            shadowCameraLeft: (directionalLight.shadow.camera as any).left || 0,
            shadowCameraTop: (directionalLight.shadow.camera as any).top || 0,
            shadowCameraBottom:
              (directionalLight.shadow.camera as any).bottom || 0,
            bias: directionalLight.shadow.bias,
            normalBias: directionalLight.shadow.normalBias,
          });
          return;
        }

        const hasShadowMapSizeChanged =
          !previousState ||
          previousState.shadowMapType !== shadowMapType ||
          previousState.shadowMapSize !== shadowMapSize;
        if (hasShadowMapSizeChanged) {
          directionalLight.shadow.mapSize.set(shadowMapSize, shadowMapSize);
          directionalLight.shadow.map?.dispose();
          directionalLight.shadow.map = null;
          didUpdate = true;
        }

        const shadowCamera = directionalLight.shadow.camera as THREE.OrthographicCamera;
        const halfFrustumSize = options.frustumSize / 2;
        const shadowCameraFar =
          options.distanceFromCamera + directionalLightExtraFarDistance;
        const shadowCameraNear = directionalLightShadowCameraNear;
        if (
          !previousState ||
          previousState.shadowCameraNear !== shadowCameraNear ||
          previousState.shadowCameraFar !== shadowCameraFar ||
          previousState.shadowCameraRight !== halfFrustumSize ||
          previousState.shadowCameraLeft !== -halfFrustumSize ||
          previousState.shadowCameraTop !== halfFrustumSize ||
          previousState.shadowCameraBottom !== -halfFrustumSize
        ) {
          shadowCamera.near = shadowCameraNear;
          shadowCamera.far = shadowCameraFar;
          shadowCamera.right = halfFrustumSize;
          shadowCamera.left = -halfFrustumSize;
          shadowCamera.top = halfFrustumSize;
          shadowCamera.bottom = -halfFrustumSize;
          shadowCamera.updateProjectionMatrix();
          didUpdate = true;
        }

        const biasMultiplier = getShadowBiasMultiplier(shadowMapSize);
        const bias = options.baseBias * biasMultiplier;
        const normalBias = options.normalBias;
        if (!previousState || previousState.bias !== bias) {
          directionalLight.shadow.bias = bias;
          didUpdate = true;
        }
        if (!previousState || previousState.normalBias !== normalBias) {
          directionalLight.shadow.normalBias = normalBias;
          didUpdate = true;
        }

        if (didUpdate) {
          directionalLight.shadow.needsUpdate = true;
          requestShadowMapUpdate(shadowLayerState);
        }

        directionalLightShadowStates.set(directionalLight, {
          castShadow,
          shadowMapType,
          shadowMapSize,
          shadowCameraNear,
          shadowCameraFar,
          shadowCameraRight: halfFrustumSize,
          shadowCameraLeft: -halfFrustumSize,
          shadowCameraTop: halfFrustumSize,
          shadowCameraBottom: -halfFrustumSize,
          bias,
          normalBias,
        });
      };
    }
  }

  interface ShadowSettingsFilterNetworkSyncData {
    e: boolean;
    t: gdjs.scene3d.shadows.ShadowMapTypeName;
    a: boolean;
    dq: gdjs.scene3d.shadows.ShadowQualityName;
  }

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::ShadowSettings',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          private _isEnabled = false;
          private _settings = gdjs.scene3d.shadows.getDefaultSettings();

          private _applySettings(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            gdjs.scene3d.shadows.updateSettings(target, this._settings);
            return true;
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
            const wasApplied = this._applySettings(target);
            if (wasApplied) {
              this._isEnabled = true;
            }
            return wasApplied;
          }

          removeEffect(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            gdjs.scene3d.shadows.resetSettings(target);
            this._isEnabled = false;
            return true;
          }

          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled) {
              return;
            }
            this._applySettings(target);
          }

          updateDoubleParameter(parameterName: string, value: number): void {
            // No numeric parameters for shadow settings.
          }

          getDoubleParameter(parameterName: string): number {
            return 0;
          }

          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'shadowMapType') {
              if (value === 'basic' || value === 'pcf') {
                this._settings.shadowMapType = value;
              }
            } else if (parameterName === 'directionalShadowQuality') {
            if (
              value === 'low' ||
              value === 'medium' ||
              value === 'high' ||
              value === 'ultra'
            ) {
              this._settings.directionalShadowQuality = value;
            }
            }
          }

          updateColorParameter(parameterName: string, value: number): void {}

          getColorParameter(parameterName: string): number {
            return 0;
          }

          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'enabled') {
              this._settings.enabled = value;
            }
          }

          getNetworkSyncData(): ShadowSettingsFilterNetworkSyncData {
            return {
              e: this._settings.enabled,
              t: this._settings.shadowMapType,
              a: true,
              dq: this._settings.directionalShadowQuality,
            };
          }

          updateFromNetworkSyncData(
            syncData: ShadowSettingsFilterNetworkSyncData
          ): void {
            if (syncData.e !== undefined) this._settings.enabled = syncData.e;
            if (syncData.t === 'basic' || syncData.t === 'pcf') {
              this._settings.shadowMapType = syncData.t;
            }
            if (syncData.a !== undefined) this._settings.autoUpdate = true;
            if (syncData.dq !== undefined) {
              this._settings.directionalShadowQuality = syncData.dq;
            }
          }
        })();
      }
    })()
  );
}
