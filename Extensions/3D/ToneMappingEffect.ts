namespace gdjs {
  type ToneMappingName =
    | 'none'
    | 'linear'
    | 'reinhard'
    | 'cineon'
    | 'acesFilmic';

  interface ToneMappingFilterNetworkSyncData {
    t: ToneMappingName;
    e: number;
  }

  const minimumToneMappingExposure = 0;
  const maximumToneMappingExposure = 10;
  const defaultToneMappingExposure = 1;
  const defaultToneMappingName: ToneMappingName = 'acesFilmic';

  type ToneMappingSettings = {
    toneMappingName: ToneMappingName;
    exposure: number;
  };

  type ToneMappingSceneState = {
    defaultToneMapping: THREE.ToneMapping | null;
    defaultExposure: number | null;
    controllers: Map<number, ToneMappingSettings>;
  };

  const toneMappingSceneStates = new WeakMap<gdjs.RuntimeScene, ToneMappingSceneState>();
  let nextToneMappingControllerId = 1;

  const getThreeRendererFromTarget = (
    target: EffectsTarget
  ): THREE.WebGLRenderer | null => {
    if (!(target instanceof gdjs.Layer)) {
      return null;
    }
    const runtimeLayer = target.getRuntimeLayer();
    const runtimeScene = runtimeLayer.getRuntimeScene();
    const renderer = runtimeScene.getGame().getRenderer();
    if (!renderer || !renderer.getThreeRenderer) {
      return null;
    }
    return renderer.getThreeRenderer();
  };

  const getRuntimeSceneFromTarget = (
    target: EffectsTarget
  ): gdjs.RuntimeScene | null => {
    if (!(target instanceof gdjs.Layer)) {
      return null;
    }
    const runtimeLayer = target.getRuntimeLayer();
    return runtimeLayer ? runtimeLayer.getRuntimeScene() : null;
  };

  const sanitizeToneMappingName = (value: string): ToneMappingName => {
    if (
      value === 'none' ||
      value === 'linear' ||
      value === 'reinhard' ||
      value === 'cineon' ||
      value === 'acesFilmic'
    ) {
      return value;
    }
    return defaultToneMappingName;
  };

  const sanitizeExposure = (value: number): number => {
    if (!Number.isFinite(value)) {
      return defaultToneMappingExposure;
    }
    return Math.max(
      minimumToneMappingExposure,
      Math.min(maximumToneMappingExposure, value)
    );
  };

  const getToneMappingType = (
    toneMappingName: ToneMappingName
  ): THREE.ToneMapping => {
    if (toneMappingName === 'linear') {
      return THREE.LinearToneMapping;
    }
    if (toneMappingName === 'reinhard') {
      return THREE.ReinhardToneMapping;
    }
    if (toneMappingName === 'cineon') {
      return THREE.CineonToneMapping;
    }
    if (toneMappingName === 'acesFilmic') {
      return THREE.ACESFilmicToneMapping;
    }
    return THREE.NoToneMapping;
  };

  const getToneMappingSceneState = (
    runtimeScene: gdjs.RuntimeScene
  ): ToneMappingSceneState => {
    const existingState = toneMappingSceneStates.get(runtimeScene);
    if (existingState) {
      return existingState;
    }
    const createdState: ToneMappingSceneState = {
      defaultToneMapping: null,
      defaultExposure: null,
      controllers: new Map<number, ToneMappingSettings>(),
    };
    toneMappingSceneStates.set(runtimeScene, createdState);
    return createdState;
  };

  const getLastControllerSettings = (
    sceneState: ToneMappingSceneState
  ): ToneMappingSettings | null => {
    if (sceneState.controllers.size === 0) {
      return null;
    }
    let lastSettings: ToneMappingSettings | null = null;
    sceneState.controllers.forEach((settings) => {
      lastSettings = settings;
    });
    return lastSettings;
  };

  const applySceneToneMappingToRenderer = (
    sceneState: ToneMappingSceneState,
    threeRenderer: THREE.WebGLRenderer | null
  ): boolean => {
    if (!threeRenderer) {
      return false;
    }
    const activeSettings = getLastControllerSettings(sceneState);
    const expectedToneMapping = activeSettings
      ? getToneMappingType(activeSettings.toneMappingName)
      : sceneState.defaultToneMapping !== null
        ? sceneState.defaultToneMapping
        : THREE.NoToneMapping;
    const expectedExposure = activeSettings
      ? activeSettings.exposure
      : sceneState.defaultExposure !== null
        ? sceneState.defaultExposure
        : defaultToneMappingExposure;
    const didToneMappingChange = threeRenderer.toneMapping !== expectedToneMapping;
    const didExposureChange =
      threeRenderer.toneMappingExposure !== expectedExposure;
    if (didToneMappingChange) {
      threeRenderer.toneMapping = expectedToneMapping;
    }
    if (didExposureChange) {
      threeRenderer.toneMappingExposure = expectedExposure;
    }
    return didToneMappingChange || didExposureChange;
  };

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::ToneMapping',
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
          private _toneMapping: ToneMappingName = defaultToneMappingName;
          private _exposure = defaultToneMappingExposure;
          private _controllerId = nextToneMappingControllerId++;

          private _updateSceneState(
            runtimeScene: gdjs.RuntimeScene,
            includeController: boolean
          ): void {
            const sceneState = getToneMappingSceneState(runtimeScene);
            const threeRenderer = getThreeRendererFromTarget(target);

            if (
              sceneState.defaultToneMapping === null ||
              sceneState.defaultExposure === null
            ) {
              sceneState.defaultToneMapping = threeRenderer
                ? threeRenderer.toneMapping
                : THREE.NoToneMapping;
              sceneState.defaultExposure = threeRenderer
                ? threeRenderer.toneMappingExposure
                : defaultToneMappingExposure;
            }

            if (includeController) {
              sceneState.controllers.delete(this._controllerId);
              sceneState.controllers.set(this._controllerId, {
                toneMappingName: this._toneMapping,
                exposure: this._exposure,
              });
            } else {
              sceneState.controllers.delete(this._controllerId);
            }

            applySceneToneMappingToRenderer(sceneState, threeRenderer);
          }

          isEnabled(target: EffectsTarget): boolean {
            return this._isEnabled;
          }
          setEnabled(target: EffectsTarget, enabled: boolean): boolean {
            if (this._isEnabled === enabled) {
              return true;
            }
            return enabled ? this.applyEffect(target) : this.removeEffect(target);
          }
          applyEffect(target: EffectsTarget): boolean {
            const runtimeScene = getRuntimeSceneFromTarget(target);
            if (!runtimeScene) {
              return false;
            }
            this._isEnabled = true;
            this._updateSceneState(runtimeScene, true);
            return true;
          }
          removeEffect(target: EffectsTarget): boolean {
            const runtimeScene = getRuntimeSceneFromTarget(target);
            if (!runtimeScene) {
              this._isEnabled = false;
              return false;
            }
            this._isEnabled = false;
            this._updateSceneState(runtimeScene, false);
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled) {
              return;
            }
            const runtimeScene = getRuntimeSceneFromTarget(target);
            if (!runtimeScene) {
              return;
            }
            this._updateSceneState(runtimeScene, true);
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'exposure') {
              this._exposure = sanitizeExposure(value);
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'exposure') {
              return this._exposure;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName !== 'toneMapping') {
              return;
            }
            this._toneMapping = sanitizeToneMappingName(value);
          }
          updateColorParameter(parameterName: string, value: number): void {}
          getColorParameter(parameterName: string): number {
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {}
          getNetworkSyncData(): ToneMappingFilterNetworkSyncData {
            return {
              t: this._toneMapping,
              e: this._exposure,
            };
          }
          updateFromNetworkSyncData(
            syncData: ToneMappingFilterNetworkSyncData
          ): void {
            this._toneMapping = sanitizeToneMappingName(syncData.t);
            this._exposure = sanitizeExposure(syncData.e);
          }
        })();
      }
    })()
  );
}
