namespace gdjs {
  export namespace scene3d {
    export namespace shadows {
      export type ShadowMapTypeName = 'pcfSoft' | 'pcf' | 'basic';
      export type ShadowQualityName = 'low' | 'medium' | 'high';

      export interface GlobalShadowSettings {
        enabled: boolean;
        shadowMapType: ShadowMapTypeName;
        autoUpdate: boolean;
        directionalShadowQuality: ShadowQualityName;
        pointLightBaseBias: number;
        pointLightNormalBias: number;
        pointLightRadius: number;
      }

      export type ShadowTypeRecommendedSettings = Pick<
        GlobalShadowSettings,
        | 'pointLightBaseBias'
        | 'pointLightNormalBias'
        | 'pointLightRadius'
      >;

      export interface ApplyPointLightShadowOptions {
        castShadow: boolean;
        shadowMapSize: number;
        lightDistance: number;
        forceUpdate?: boolean;
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
        shadowMapType: 'pcfSoft',
        autoUpdate: true,
        directionalShadowQuality: 'medium',
        pointLightBaseBias: -0.006,
        pointLightNormalBias: 0.04,
        pointLightRadius: 1,
      };

      type PointLightShadowState = {
        castShadow: boolean;
        shadowMapType: ShadowMapTypeName;
        shadowMapSize: number;
        shadowCameraFar: number;
        shadowCameraNear: number;
        bias: number;
        normalBias: number;
        radius: number;
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
        pointLightShadowStates: WeakMap<THREE.PointLight, PointLightShadowState>;
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
        pointLightShadowStates: new WeakMap<THREE.PointLight, PointLightShadowState>(),
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

      const pointLightShadowCameraNear = 0.1;
      const pointLightInfiniteShadowFar = 5000;
      const pointLightMinimumFiniteShadowFar = 50;
      const directionalLightShadowCameraNear = 1;
      const directionalLightExtraFarDistance = 10000;

      const minimumPointLightShadowMapSize = 256;
      const maximumPointLightShadowMapSize = 4096;
      const allowedPointLightShadowMapSizes = [256, 512, 1024, 2048, 4096];

      const sanitizePointLightShadowMapSize = (rawSize: number): number => {
        if (!Number.isFinite(rawSize)) {
          return 1024;
        }
        const roundedSize = Math.round(rawSize);
        const clampedSize = Math.max(
          minimumPointLightShadowMapSize,
          Math.min(maximumPointLightShadowMapSize, roundedSize)
        );
        let nearestSize = allowedPointLightShadowMapSizes[0];
        let nearestDistance = Math.abs(clampedSize - nearestSize);
        for (
          let index = 1;
          index < allowedPointLightShadowMapSizes.length;
          index++
        ) {
          const candidateSize = allowedPointLightShadowMapSizes[index];
          const candidateDistance = Math.abs(clampedSize - candidateSize);
          if (candidateDistance < nearestDistance) {
            nearestSize = candidateSize;
            nearestDistance = candidateDistance;
          }
        }
        return nearestSize;
      };

      const requestShadowMapUpdate = (shadowLayerState: ShadowLayerState) => {
        shadowLayerState.shadowMapUpdateRequested = true;
      };

      const areSettingsEqual = (
        left: GlobalShadowSettings,
        right: GlobalShadowSettings
      ): boolean =>
        left.enabled === right.enabled &&
        left.shadowMapType === right.shadowMapType &&
        left.autoUpdate === right.autoUpdate &&
        left.directionalShadowQuality === right.directionalShadowQuality &&
        left.pointLightBaseBias === right.pointLightBaseBias &&
        left.pointLightNormalBias === right.pointLightNormalBias &&
        left.pointLightRadius === right.pointLightRadius;

      const getEffectiveShadowBaseBias = (
        rawBaseBias: number,
        _shadowMapTypeName: ShadowMapTypeName
      ): number => rawBaseBias;

      const getEffectiveShadowNormalBias = (
        rawNormalBias: number,
        _shadowMapTypeName: ShadowMapTypeName
      ): number => rawNormalBias;

      const getEffectivePointLightShadowRadius = (
        rawRadius: number,
        shadowMapTypeName: ShadowMapTypeName
      ): number => {
        if (shadowMapTypeName === 'pcf') {
          return Math.max(0, rawRadius);
        }
        // Radius has no meaningful effect for Basic/PCFSoft shadow maps.
        return 1;
      };

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

      // Deprecated alias kept for compatibility with older code paths.
      export const registerPointLightRenderer = (
        runtimeLayer: gdjs.RuntimeLayer | null,
        refreshShadows: () => void
      ): (() => void) =>
        registerShadowSettingsObserver(runtimeLayer, refreshShadows);

      export const getShadowMapType = (
        shadowMapTypeName: ShadowMapTypeName
      ): THREE.ShadowMapType => {
        if (shadowMapTypeName === 'basic') {
          return THREE.BasicShadowMap;
        }
        if (shadowMapTypeName === 'pcf') {
          return THREE.PCFShadowMap;
        }
        return THREE.PCFSoftShadowMap;
      };

      export const getRecommendedSettingsForShadowMapType = (
        shadowMapTypeName: ShadowMapTypeName
      ): ShadowTypeRecommendedSettings => {
        if (shadowMapTypeName === 'basic') {
          return {
            pointLightBaseBias: -0.015,
            pointLightNormalBias: 0.12,
            pointLightRadius: 1,
          };
        }
        if (shadowMapTypeName === 'pcf') {
          return {
            pointLightBaseBias: -0.01,
            pointLightNormalBias: 0.08,
            pointLightRadius: 2,
          };
        }
        // pcfSoft default.
        return {
          pointLightBaseBias: -0.006,
          pointLightNormalBias: 0.04,
          pointLightRadius: 1,
        };
      };

      export const getShadowMapSizeForQuality = (quality: string): number => {
        if (quality === 'low') {
          return 512;
        }
        if (quality === 'high') {
          return 2048;
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

      export const getPointLightShadowCameraFar = (lightDistance: number): number =>
        !Number.isFinite(lightDistance) || lightDistance <= 0
          ? pointLightInfiniteShadowFar
          : Math.max(lightDistance * 1.5, pointLightMinimumFiniteShadowFar);

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
          shadowMap.autoUpdate !== settings.autoUpdate;

        shadowMap.enabled = settings.enabled;
        shadowMap.type = expectedShadowMapType;
        shadowMap.autoUpdate = settings.autoUpdate;

        if (didRendererConfigChange) {
          requestShadowMapUpdate(shadowLayerState);
        }

        if (shadowLayerState.shadowMapUpdateRequested) {
          shadowMap.needsUpdate = true;
          shadowLayerState.shadowMapUpdateRequested = false;
        }
      };

      export const applyPointLightShadow = (
        runtimeLayer: gdjs.RuntimeLayer | null,
        pointLight: THREE.PointLight,
        options: ApplyPointLightShadowOptions
      ): void => {
        const shadowLayerState = getShadowLayerState(runtimeLayer);
        const settings = shadowLayerState.settings;
        const pointLightShadowStates = shadowLayerState.pointLightShadowStates;
        const previousState = pointLightShadowStates.get(pointLight);
        const shadowMapType = settings.shadowMapType;
        const castShadow = settings.enabled && options.castShadow;
        let didUpdate = options.forceUpdate || false;

        if (pointLight.castShadow !== castShadow) {
          pointLight.castShadow = castShadow;
          didUpdate = true;
        }
        if (!castShadow) {
          pointLightShadowStates.set(pointLight, {
            castShadow,
            shadowMapType,
            shadowMapSize: sanitizePointLightShadowMapSize(options.shadowMapSize),
            shadowCameraFar: getPointLightShadowCameraFar(options.lightDistance),
            shadowCameraNear: pointLightShadowCameraNear,
            bias: pointLight.shadow.bias,
            normalBias: pointLight.shadow.normalBias,
            radius: pointLight.shadow.radius,
          });
          return;
        }

        const shadowMapSize = sanitizePointLightShadowMapSize(options.shadowMapSize);
        const hasShadowMapSizeChanged =
          !previousState ||
          previousState.shadowMapType !== shadowMapType ||
          previousState.shadowMapSize !== shadowMapSize;
        if (hasShadowMapSizeChanged) {
          pointLight.shadow.mapSize.width = shadowMapSize;
          pointLight.shadow.mapSize.height = shadowMapSize;
          pointLight.shadow.map?.dispose();
          pointLight.shadow.map = null;
          didUpdate = true;
        }

        const desiredCameraFar = getPointLightShadowCameraFar(options.lightDistance);
        if (
          !previousState ||
          previousState.shadowCameraNear !== pointLightShadowCameraNear ||
          previousState.shadowCameraFar !== desiredCameraFar
        ) {
          pointLight.shadow.camera.near = pointLightShadowCameraNear;
          pointLight.shadow.camera.far = desiredCameraFar;
          pointLight.shadow.camera.updateProjectionMatrix();
          didUpdate = true;
        }

        const biasMultiplier = getShadowBiasMultiplier(shadowMapSize);
        const baseBias = getEffectiveShadowBaseBias(
          settings.pointLightBaseBias,
          shadowMapType
        );
        const normalBias = getEffectiveShadowNormalBias(
          settings.pointLightNormalBias,
          shadowMapType
        );
        const radius = getEffectivePointLightShadowRadius(
          settings.pointLightRadius,
          shadowMapType
        );
        const bias = baseBias * biasMultiplier;
        if (!previousState || previousState.bias !== bias) {
          pointLight.shadow.bias = bias;
          didUpdate = true;
        }
        if (!previousState || previousState.normalBias !== normalBias) {
          pointLight.shadow.normalBias = normalBias;
          didUpdate = true;
        }
        if (!previousState || previousState.radius !== radius) {
          pointLight.shadow.radius = radius;
          didUpdate = true;
        }

        if (didUpdate) {
          pointLight.shadow.needsUpdate = true;
          requestShadowMapUpdate(shadowLayerState);
        }

        pointLightShadowStates.set(pointLight, {
          castShadow,
          shadowMapType,
          shadowMapSize,
          shadowCameraFar: desiredCameraFar,
          shadowCameraNear: pointLightShadowCameraNear,
          bias,
          normalBias,
          radius,
        });
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
    pb: number;
    pnb: number;
    pr: number;
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
          private _isFirstShadowMapTypeSync = true;

          private _applyShadowTypePreset(
            shadowMapTypeName: gdjs.scene3d.shadows.ShadowMapTypeName
          ): void {
            const recommendedSettings =
              gdjs.scene3d.shadows.getRecommendedSettingsForShadowMapType(
                shadowMapTypeName
              );
            this._settings.pointLightBaseBias =
              recommendedSettings.pointLightBaseBias;
            this._settings.pointLightNormalBias =
              recommendedSettings.pointLightNormalBias;
            this._settings.pointLightRadius = recommendedSettings.pointLightRadius;
          }

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
            if (parameterName === 'pointLightBaseBias') {
              this._settings.pointLightBaseBias = value;
            } else if (parameterName === 'pointLightNormalBias') {
              this._settings.pointLightNormalBias = value;
            } else if (parameterName === 'pointLightRadius') {
              this._settings.pointLightRadius = value;
            }
          }

          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'pointLightBaseBias') {
              return this._settings.pointLightBaseBias;
            }
            if (parameterName === 'pointLightNormalBias') {
              return this._settings.pointLightNormalBias;
            }
            if (parameterName === 'pointLightRadius') {
              return this._settings.pointLightRadius;
            }
            return 0;
          }

          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'shadowMapType') {
              if (
                value === 'basic' ||
                value === 'pcf' ||
                value === 'pcfSoft'
              ) {
                const previousShadowMapType = this._settings.shadowMapType;
                this._settings.shadowMapType = value;
                if (
                  !this._isFirstShadowMapTypeSync &&
                  previousShadowMapType !== value
                ) {
                  this._applyShadowTypePreset(value);
                }
                this._isFirstShadowMapTypeSync = false;
              }
            } else if (parameterName === 'directionalShadowQuality') {
              if (value === 'low' || value === 'medium' || value === 'high') {
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
            } else if (parameterName === 'autoUpdate') {
              this._settings.autoUpdate = value;
            }
          }

          getNetworkSyncData(): ShadowSettingsFilterNetworkSyncData {
            return {
              e: this._settings.enabled,
              t: this._settings.shadowMapType,
              a: this._settings.autoUpdate,
              dq: this._settings.directionalShadowQuality,
              pb: this._settings.pointLightBaseBias,
              pnb: this._settings.pointLightNormalBias,
              pr: this._settings.pointLightRadius,
            };
          }

          updateFromNetworkSyncData(
            syncData: ShadowSettingsFilterNetworkSyncData
          ): void {
            if (syncData.e !== undefined) this._settings.enabled = syncData.e;
            if (syncData.t !== undefined) this._settings.shadowMapType = syncData.t;
            if (syncData.a !== undefined) this._settings.autoUpdate = syncData.a;
            if (syncData.dq !== undefined) {
              this._settings.directionalShadowQuality = syncData.dq;
            }
            if (syncData.pb !== undefined) {
              this._settings.pointLightBaseBias = syncData.pb;
            }
            if (syncData.pnb !== undefined) {
              this._settings.pointLightNormalBias = syncData.pnb;
            }
            if (syncData.pr !== undefined) {
              this._settings.pointLightRadius = syncData.pr;
            }
          }
        })();
      }
    })()
  );
}
