namespace gdjs {
  interface LightingPipelineFilterNetworkSyncData {
    m: string;
    rw: number;
    bw: number;
    pe: boolean;
    pi: number;
    ps: number;
    psc: number;
    pgc: number;
    pscn: boolean;
    am: string;
    ads: number;
    acs: number;
    sqs?: number;
    lds?: number;
    rso: boolean;
    pcl: boolean;
  }

  type LightingPipelineMode = 'realtime' | 'baked' | 'hybrid';
  type LightingAttenuationModel =
    | 'physical'
    | 'balanced'
    | 'cinematic'
    | 'stylized';

  interface SceneLightingPipelineState {
    mode: LightingPipelineMode;
    realtimeWeight: number;
    bakedWeight: number;
    probeEnabled: boolean;
    probeIntensity: number;
    probeSmoothing: number;
    probeSkyColorHex: number;
    probeGroundColorHex: number;
    probeUseSceneColors: boolean;
    attenuationModel: LightingAttenuationModel;
    attenuationDistanceScale: number;
    attenuationDecayScale: number;
    shadowQualityScale: number;
    lodDistanceScale: number;
    realtimeShadowsOnly: boolean;
    physicallyCorrectLights: boolean;
    probeLight: THREE.LightProbe | null;
    probeHemisphereLight: THREE.HemisphereLight | null;
    currentProbeSkyColor: THREE.Color;
    currentProbeGroundColor: THREE.Color;
  }

  const lightingPipelineStateKey = '__gdScene3dLightingPipelineState';
  const lightingProbeHelperFlagKey = '__gdScene3dLightingProbeHelper';

  const clamp01 = (value: number): number =>
    gdjs.evtTools.common.clamp(0, 1, value);
  const clampNonNegative = (value: number): number => Math.max(0, value);

  const parseMode = (value: string): LightingPipelineMode => {
    if (value === 'realtime' || value === 'baked' || value === 'hybrid') {
      return value;
    }
    return 'hybrid';
  };

  const parseAttenuationModel = (
    value: string
  ): LightingAttenuationModel => {
    if (
      value === 'physical' ||
      value === 'balanced' ||
      value === 'cinematic' ||
      value === 'stylized'
    ) {
      return value;
    }
    return 'balanced';
  };

  const getOrCreatePipelineState = (
    scene: THREE.Scene
  ): SceneLightingPipelineState => {
    const sceneWithPipeline = scene as THREE.Scene & {
      userData: { [key: string]: any };
    };
    sceneWithPipeline.userData = sceneWithPipeline.userData || {};
    const existingState = sceneWithPipeline.userData[
      lightingPipelineStateKey
    ] as SceneLightingPipelineState | undefined;
    if (existingState) {
      return existingState;
    }

    const defaultState: SceneLightingPipelineState = {
      mode: 'hybrid',
      realtimeWeight: 0.75,
      bakedWeight: 1,
      probeEnabled: true,
      probeIntensity: 0.35,
      probeSmoothing: 2.5,
      probeSkyColorHex: 0xbfd7ff,
      probeGroundColorHex: 0x6d7356,
      probeUseSceneColors: true,
      attenuationModel: 'balanced',
      attenuationDistanceScale: 1,
      attenuationDecayScale: 1,
      shadowQualityScale: 1,
      lodDistanceScale: 1,
      realtimeShadowsOnly: true,
      physicallyCorrectLights: true,
      probeLight: null,
      probeHemisphereLight: null,
      currentProbeSkyColor: new THREE.Color(0xbfd7ff),
      currentProbeGroundColor: new THREE.Color(0x6d7356),
    };
    sceneWithPipeline.userData[lightingPipelineStateKey] = defaultState;
    return defaultState;
  };

  const getProbeMultiplier = (state: SceneLightingPipelineState): number => {
    if (state.mode === 'realtime') {
      return 0.2;
    }
    if (state.mode === 'baked') {
      return 1;
    }
    return 0.6 + 0.4 * (1 - clamp01(state.realtimeWeight));
  };

  const removeProbeObjects = (
    scene: THREE.Scene,
    state: SceneLightingPipelineState
  ): void => {
    if (state.probeLight) {
      scene.remove(state.probeLight);
      state.probeLight = null;
    }
    if (state.probeHemisphereLight) {
      scene.remove(state.probeHemisphereLight);
      state.probeHemisphereLight = null;
    }
  };

  const ensureProbeObjects = (
    scene: THREE.Scene,
    state: SceneLightingPipelineState
  ): void => {
    if (!state.probeLight) {
      state.probeLight = new THREE.LightProbe();
      (
        state.probeLight as THREE.LightProbe & {
          userData: { [key: string]: any };
        }
      ).userData = {
        [lightingProbeHelperFlagKey]: true,
      };
      scene.add(state.probeLight);
    }
    if (!state.probeHemisphereLight) {
      state.probeHemisphereLight = new THREE.HemisphereLight();
      (
        state.probeHemisphereLight as THREE.HemisphereLight & {
          userData: { [key: string]: any };
        }
      ).userData = {
        [lightingProbeHelperFlagKey]: true,
      };
      state.probeHemisphereLight.position.set(0, 0, 1);
      scene.add(state.probeHemisphereLight);
    }
  };

  const sampleProbeTargetColors = (
    scene: THREE.Scene,
    state: SceneLightingPipelineState
  ): { skyColor: THREE.Color; groundColor: THREE.Color } => {
    if (!state.probeUseSceneColors) {
      return {
        skyColor: new THREE.Color(state.probeSkyColorHex),
        groundColor: new THREE.Color(state.probeGroundColorHex),
      };
    }

    const background = scene.background as THREE.Color | null | undefined;
    if (background && (background as any).isColor) {
      const color = (background as THREE.Color).clone();
      return { skyColor: color.clone(), groundColor: color };
    }

    let sampledHemisphere: THREE.HemisphereLight | null = null;
    scene.traverse(object => {
      if (sampledHemisphere) {
        return;
      }
      const hemisphereLight = object as THREE.HemisphereLight & {
        isHemisphereLight?: boolean;
        userData?: { [key: string]: any };
      };
      if (
        !hemisphereLight.isHemisphereLight ||
        !hemisphereLight.visible ||
        (hemisphereLight.userData &&
          hemisphereLight.userData[lightingProbeHelperFlagKey])
      ) {
        return;
      }
      sampledHemisphere = hemisphereLight;
    });

    if (sampledHemisphere) {
      const hemisphere = sampledHemisphere as THREE.HemisphereLight;
      return {
        skyColor: hemisphere.color.clone(),
        groundColor: hemisphere.groundColor.clone(),
      };
    }

    return {
      skyColor: new THREE.Color(state.probeSkyColorHex),
      groundColor: new THREE.Color(state.probeGroundColorHex),
    };
  };

  const updateProbeLighting = (
    scene: THREE.Scene,
    state: SceneLightingPipelineState,
    deltaTime: number
  ): void => {
    if (!state.probeEnabled || state.probeIntensity <= 0) {
      removeProbeObjects(scene, state);
      return;
    }

    ensureProbeObjects(scene, state);
    if (!state.probeLight || !state.probeHemisphereLight) {
      return;
    }

    const { skyColor, groundColor } = sampleProbeTargetColors(scene, state);
    const safeDeltaTime = Math.max(0, deltaTime);
    const smoothing = Math.max(0, state.probeSmoothing);
    const alpha =
      smoothing <= 0 ? 1 : 1 - Math.exp(-smoothing * safeDeltaTime);

    state.currentProbeSkyColor.lerp(skyColor, alpha);
    state.currentProbeGroundColor.lerp(groundColor, alpha);

    const probeMultiplier = getProbeMultiplier(state);
    const effectiveProbeIntensity =
      clampNonNegative(state.probeIntensity) * probeMultiplier;

    const mixedColor = state.currentProbeSkyColor
      .clone()
      .multiplyScalar(0.65)
      .add(state.currentProbeGroundColor.clone().multiplyScalar(0.35));

    // Approximate an irradiance probe from a constant SH term.
    for (let i = 0; i < 9; i++) {
      state.probeLight.sh.coefficients[i].set(0, 0, 0);
    }
    state.probeLight.sh.coefficients[0].set(
      mixedColor.r * Math.PI,
      mixedColor.g * Math.PI,
      mixedColor.b * Math.PI
    );
    state.probeLight.intensity = effectiveProbeIntensity;
    state.probeLight.visible = effectiveProbeIntensity > 0.0001;

    state.probeHemisphereLight.color.copy(state.currentProbeSkyColor);
    state.probeHemisphereLight.groundColor.copy(state.currentProbeGroundColor);
    state.probeHemisphereLight.intensity = effectiveProbeIntensity * 0.35;
    state.probeHemisphereLight.visible =
      state.probeHemisphereLight.intensity > 0.0001;
  };

  const applyRendererLightingMode = (
    target: EffectsTarget,
    state: SceneLightingPipelineState
  ): void => {
    const runtimeScene = target.getRuntimeScene ? target.getRuntimeScene() : null;
    if (!runtimeScene || !runtimeScene.getGame) {
      return;
    }
    const gameRenderer = runtimeScene.getGame().getRenderer();
    if (!gameRenderer || !(gameRenderer as any).getThreeRenderer) {
      return;
    }
    const threeRenderer = (gameRenderer as any).getThreeRenderer() as
      | THREE.WebGLRenderer
      | null;
    if (!threeRenderer) {
      return;
    }
    const rendererWithLightingMode = threeRenderer as THREE.WebGLRenderer & {
      physicallyCorrectLights?: boolean;
    };
    if (
      typeof rendererWithLightingMode.physicallyCorrectLights === 'boolean' &&
      rendererWithLightingMode.physicallyCorrectLights !==
        state.physicallyCorrectLights
    ) {
      rendererWithLightingMode.physicallyCorrectLights =
        state.physicallyCorrectLights;
    }
  };

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::LightingPipeline',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }

        return new (class implements gdjs.PixiFiltersTools.Filter {
          private _isEnabled: boolean = false;
          private _mode: LightingPipelineMode;
          private _realtimeWeight: number;
          private _bakedWeight: number;
          private _probeEnabled: boolean;
          private _probeIntensity: number;
          private _probeSmoothing: number;
          private _probeSkyColorHex: number;
          private _probeGroundColorHex: number;
          private _probeUseSceneColors: boolean;
          private _attenuationModel: LightingAttenuationModel;
          private _attenuationDistanceScale: number;
          private _attenuationDecayScale: number;
          private _shadowQualityScale: number;
          private _lodDistanceScale: number;
          private _realtimeShadowsOnly: boolean;
          private _physicallyCorrectLights: boolean;

          constructor() {
            this._mode = parseMode(effectData.stringParameters.mode || 'hybrid');
            this._realtimeWeight = clamp01(
              effectData.doubleParameters.realtimeWeight !== undefined
                ? effectData.doubleParameters.realtimeWeight
                : 0.75
            );
            this._bakedWeight = clampNonNegative(
              effectData.doubleParameters.bakedWeight !== undefined
                ? effectData.doubleParameters.bakedWeight
                : 1
            );
            this._probeEnabled =
              effectData.booleanParameters.probeEnabled === undefined
                ? true
                : !!effectData.booleanParameters.probeEnabled;
            this._probeIntensity = clampNonNegative(
              effectData.doubleParameters.probeIntensity !== undefined
                ? effectData.doubleParameters.probeIntensity
                : 0.35
            );
            this._probeSmoothing = clampNonNegative(
              effectData.doubleParameters.probeSmoothing !== undefined
                ? effectData.doubleParameters.probeSmoothing
                : 2.5
            );
            this._probeSkyColorHex = gdjs.rgbOrHexStringToNumber(
              effectData.stringParameters.probeSkyColor || '191;215;255'
            );
            this._probeGroundColorHex = gdjs.rgbOrHexStringToNumber(
              effectData.stringParameters.probeGroundColor || '109;115;86'
            );
            this._probeUseSceneColors =
              effectData.booleanParameters.probeUseSceneColors === undefined
                ? true
                : !!effectData.booleanParameters.probeUseSceneColors;
            this._attenuationModel = parseAttenuationModel(
              effectData.stringParameters.attenuationModel || 'balanced'
            );
            this._attenuationDistanceScale = clampNonNegative(
              effectData.doubleParameters.attenuationDistanceScale !== undefined
                ? effectData.doubleParameters.attenuationDistanceScale
                : 1
            );
            this._attenuationDecayScale = clampNonNegative(
              effectData.doubleParameters.attenuationDecayScale !== undefined
                ? effectData.doubleParameters.attenuationDecayScale
                : 1
            );
            this._shadowQualityScale = gdjs.evtTools.common.clamp(
              0.35,
              2,
              effectData.doubleParameters.shadowQualityScale !== undefined
                ? effectData.doubleParameters.shadowQualityScale
                : 1
            );
            this._lodDistanceScale = gdjs.evtTools.common.clamp(
              0.25,
              4,
              effectData.doubleParameters.lodDistanceScale !== undefined
                ? effectData.doubleParameters.lodDistanceScale
                : 1
            );
            this._realtimeShadowsOnly =
              effectData.booleanParameters.realtimeShadowsOnly === undefined
                ? true
                : !!effectData.booleanParameters.realtimeShadowsOnly;
            this._physicallyCorrectLights =
              effectData.booleanParameters.physicallyCorrectLights === undefined
                ? true
                : !!effectData.booleanParameters.physicallyCorrectLights;

            void target;
          }

          private _getScene(target: EffectsTarget): THREE.Scene | null {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            return scene || null;
          }

          private _applyToScene(target: EffectsTarget, scene: THREE.Scene): void {
            const state = getOrCreatePipelineState(scene);
            state.mode = this._mode;
            state.realtimeWeight = this._realtimeWeight;
            state.bakedWeight = this._bakedWeight;
            state.probeEnabled = this._probeEnabled;
            state.probeIntensity = this._probeIntensity;
            state.probeSmoothing = this._probeSmoothing;
            state.probeSkyColorHex = this._probeSkyColorHex;
            state.probeGroundColorHex = this._probeGroundColorHex;
            state.probeUseSceneColors = this._probeUseSceneColors;
            state.attenuationModel = this._attenuationModel;
            state.attenuationDistanceScale = this._attenuationDistanceScale;
            state.attenuationDecayScale = this._attenuationDecayScale;
            state.shadowQualityScale = this._shadowQualityScale;
            state.lodDistanceScale = this._lodDistanceScale;
            state.realtimeShadowsOnly = this._realtimeShadowsOnly;
            state.physicallyCorrectLights = this._physicallyCorrectLights;

            applyRendererLightingMode(target, state);
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
            const scene = this._getScene(target);
            if (!scene) {
              return false;
            }
            this._isEnabled = true;
            this._applyToScene(target, scene);
            return true;
          }

          removeEffect(target: EffectsTarget): boolean {
            const scene = this._getScene(target);
            if (!scene) {
              this._isEnabled = false;
              return false;
            }
            const state = getOrCreatePipelineState(scene);
            removeProbeObjects(scene, state);
            const sceneWithPipeline = scene as THREE.Scene & {
              userData: { [key: string]: any };
            };
            if (sceneWithPipeline.userData) {
              delete sceneWithPipeline.userData[lightingPipelineStateKey];
            }
            this._isEnabled = false;
            return true;
          }

          updatePreRender(target: EffectsTarget): any {
            if (!this._isEnabled) {
              return;
            }
            const scene = this._getScene(target);
            if (!scene) {
              return;
            }

            this._applyToScene(target, scene);
            const state = getOrCreatePipelineState(scene);
            const runtimeScene = target.getRuntimeScene
              ? target.getRuntimeScene()
              : null;
            const deltaTime = runtimeScene
              ? Math.max(0, runtimeScene.getElapsedTime() / 1000)
              : 1 / 60;
            updateProbeLighting(scene, state, deltaTime);
          }

          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'realtimeWeight') {
              this._realtimeWeight = clamp01(value);
            } else if (parameterName === 'bakedWeight') {
              this._bakedWeight = clampNonNegative(value);
            } else if (parameterName === 'probeIntensity') {
              this._probeIntensity = clampNonNegative(value);
            } else if (parameterName === 'probeSmoothing') {
              this._probeSmoothing = clampNonNegative(value);
            } else if (parameterName === 'attenuationDistanceScale') {
              this._attenuationDistanceScale = clampNonNegative(value);
            } else if (parameterName === 'attenuationDecayScale') {
              this._attenuationDecayScale = clampNonNegative(value);
            } else if (parameterName === 'shadowQualityScale') {
              this._shadowQualityScale = gdjs.evtTools.common.clamp(
                0.35,
                2,
                value
              );
            } else if (parameterName === 'lodDistanceScale') {
              this._lodDistanceScale = gdjs.evtTools.common.clamp(
                0.25,
                4,
                value
              );
            }
          }

          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'realtimeWeight') {
              return this._realtimeWeight;
            }
            if (parameterName === 'bakedWeight') {
              return this._bakedWeight;
            }
            if (parameterName === 'probeIntensity') {
              return this._probeIntensity;
            }
            if (parameterName === 'probeSmoothing') {
              return this._probeSmoothing;
            }
            if (parameterName === 'attenuationDistanceScale') {
              return this._attenuationDistanceScale;
            }
            if (parameterName === 'attenuationDecayScale') {
              return this._attenuationDecayScale;
            }
            if (parameterName === 'shadowQualityScale') {
              return this._shadowQualityScale;
            }
            if (parameterName === 'lodDistanceScale') {
              return this._lodDistanceScale;
            }
            return 0;
          }

          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'mode') {
              this._mode = parseMode(value);
            } else if (parameterName === 'attenuationModel') {
              this._attenuationModel = parseAttenuationModel(value);
            } else if (parameterName === 'probeSkyColor') {
              this._probeSkyColorHex = gdjs.rgbOrHexStringToNumber(value);
            } else if (parameterName === 'probeGroundColor') {
              this._probeGroundColorHex = gdjs.rgbOrHexStringToNumber(value);
            }
          }

          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'probeSkyColor') {
              this._probeSkyColorHex = value;
            } else if (parameterName === 'probeGroundColor') {
              this._probeGroundColorHex = value;
            }
          }

          getColorParameter(parameterName: string): number {
            if (parameterName === 'probeSkyColor') {
              return this._probeSkyColorHex;
            }
            if (parameterName === 'probeGroundColor') {
              return this._probeGroundColorHex;
            }
            return 0;
          }

          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'probeEnabled') {
              this._probeEnabled = value;
            } else if (parameterName === 'probeUseSceneColors') {
              this._probeUseSceneColors = value;
            } else if (parameterName === 'realtimeShadowsOnly') {
              this._realtimeShadowsOnly = value;
            } else if (parameterName === 'physicallyCorrectLights') {
              this._physicallyCorrectLights = value;
            }
          }

          getNetworkSyncData(): LightingPipelineFilterNetworkSyncData {
            return {
              m: this._mode,
              rw: this._realtimeWeight,
              bw: this._bakedWeight,
              pe: this._probeEnabled,
              pi: this._probeIntensity,
              ps: this._probeSmoothing,
              psc: this._probeSkyColorHex,
              pgc: this._probeGroundColorHex,
              pscn: this._probeUseSceneColors,
              am: this._attenuationModel,
              ads: this._attenuationDistanceScale,
              acs: this._attenuationDecayScale,
              sqs: this._shadowQualityScale,
              lds: this._lodDistanceScale,
              rso: this._realtimeShadowsOnly,
              pcl: this._physicallyCorrectLights,
            };
          }

          updateFromNetworkSyncData(
            syncData: LightingPipelineFilterNetworkSyncData
          ): void {
            this._mode = parseMode(syncData.m);
            this._realtimeWeight = clamp01(syncData.rw);
            this._bakedWeight = clampNonNegative(syncData.bw);
            this._probeEnabled = !!syncData.pe;
            this._probeIntensity = clampNonNegative(syncData.pi);
            this._probeSmoothing = clampNonNegative(syncData.ps);
            this._probeSkyColorHex = syncData.psc;
            this._probeGroundColorHex = syncData.pgc;
            this._probeUseSceneColors = !!syncData.pscn;
            this._attenuationModel = parseAttenuationModel(syncData.am);
            this._attenuationDistanceScale = clampNonNegative(syncData.ads);
            this._attenuationDecayScale = clampNonNegative(syncData.acs);
            this._shadowQualityScale = gdjs.evtTools.common.clamp(
              0.35,
              2,
              syncData.sqs !== undefined ? syncData.sqs : 1
            );
            this._lodDistanceScale = gdjs.evtTools.common.clamp(
              0.25,
              4,
              syncData.lds !== undefined ? syncData.lds : 1
            );
            this._realtimeShadowsOnly = !!syncData.rso;
            this._physicallyCorrectLights = !!syncData.pcl;
          }
        })();
      }
    })()
  );
}
