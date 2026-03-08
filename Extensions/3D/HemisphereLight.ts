namespace gdjs {
  interface HemisphereLightFilterNetworkSyncData {
    i: number;
    sc: number;
    gc: number;
    e: number;
    r: number;
    t: string;
    sm?: number;
  }
  interface LightingPipelineState {
    mode?: string;
    realtimeWeight?: number;
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
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::HemisphereLight',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          _top: string = 'Z+';
          _elevation: float = 90;
          _rotation: float = 0;

          _isEnabled: boolean = false;
          _light: THREE.HemisphereLight;
          _targetIntensity: float;
          _targetSkyColor: THREE.Color;
          _targetGroundColor: THREE.Color;
          _smoothing: float;

          constructor() {
            this._light = new THREE.HemisphereLight();
            this._targetIntensity = Math.max(
              0,
              effectData.doubleParameters.intensity !== undefined
                ? effectData.doubleParameters.intensity
                : this._light.intensity
            );
            this._targetSkyColor = new THREE.Color(
              gdjs.rgbOrHexStringToNumber(
                effectData.stringParameters.skyColor || '255;255;255'
              )
            );
            this._targetGroundColor = new THREE.Color(
              gdjs.rgbOrHexStringToNumber(
                effectData.stringParameters.groundColor || '127;127;127'
              )
            );
            this._smoothing = Math.max(
              0,
              effectData.doubleParameters.smoothing !== undefined
                ? effectData.doubleParameters.smoothing
                : 0
            );
            this._light.intensity = this._targetIntensity;
            this._light.color.copy(this._targetSkyColor);
            this._light.groundColor.copy(this._targetGroundColor);
            this.updateRotation();
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
            scene.add(this._light);
            this._isEnabled = true;
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
            scene.remove(this._light);
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            const realtimeMultiplier = getRealtimeLightingMultiplier(
              getLightingPipelineState(scene)
            );
            const effectiveTargetIntensity =
              this._targetIntensity * realtimeMultiplier;

            if (this._smoothing <= 0) {
              this._light.intensity = effectiveTargetIntensity;
              this._light.color.copy(this._targetSkyColor);
              this._light.groundColor.copy(this._targetGroundColor);
              return;
            }

            const runtimeScene = target.getRuntimeScene
              ? target.getRuntimeScene()
              : null;
            if (!runtimeScene) {
              this._light.intensity = effectiveTargetIntensity;
              this._light.color.copy(this._targetSkyColor);
              this._light.groundColor.copy(this._targetGroundColor);
              return;
            }

            const deltaTime = Math.max(0, runtimeScene.getElapsedTime() / 1000);
            if (deltaTime <= 0) {
              return;
            }
            const alpha = 1 - Math.exp(-this._smoothing * deltaTime);
            this._light.intensity +=
              (effectiveTargetIntensity - this._light.intensity) * alpha;
            this._light.color.lerp(this._targetSkyColor, alpha);
            this._light.groundColor.lerp(this._targetGroundColor, alpha);
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this._targetIntensity = Math.max(0, value);
              if (this._smoothing <= 0) {
                this._light.intensity = this._targetIntensity;
              }
            } else if (parameterName === 'smoothing') {
              this._smoothing = Math.max(0, value);
              if (this._smoothing <= 0) {
                this._light.intensity = this._targetIntensity;
                this._light.color.copy(this._targetSkyColor);
                this._light.groundColor.copy(this._targetGroundColor);
              }
            } else if (parameterName === 'elevation') {
              this._elevation = value;
              this.updateRotation();
            } else if (parameterName === 'rotation') {
              this._rotation = value;
              this.updateRotation();
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._targetIntensity;
            } else if (parameterName === 'smoothing') {
              return this._smoothing;
            } else if (parameterName === 'elevation') {
              return this._elevation;
            } else if (parameterName === 'rotation') {
              return this._rotation;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'skyColor') {
              this._targetSkyColor.setHex(gdjs.rgbOrHexStringToNumber(value));
              if (this._smoothing <= 0) {
                this._light.color.copy(this._targetSkyColor);
              }
            }
            if (parameterName === 'groundColor') {
              this._targetGroundColor.setHex(gdjs.rgbOrHexStringToNumber(value));
              if (this._smoothing <= 0) {
                this._light.groundColor.copy(this._targetGroundColor);
              }
            }
            if (parameterName === 'top') {
              this._top = value;
              this.updateRotation();
            }
          }
          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'skyColor') {
              this._targetSkyColor.setHex(value);
              if (this._smoothing <= 0) {
                this._light.color.copy(this._targetSkyColor);
              }
            }
            if (parameterName === 'groundColor') {
              this._targetGroundColor.setHex(value);
              if (this._smoothing <= 0) {
                this._light.groundColor.copy(this._targetGroundColor);
              }
            }
          }
          getColorParameter(parameterName: string): number {
            if (parameterName === 'skyColor') {
              return this._targetSkyColor.getHex();
            }
            if (parameterName === 'groundColor') {
              return this._targetGroundColor.getHex();
            }
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {}
          updateRotation() {
            if (this._top === 'Y-') {
              // `rotation` at 0° becomes a light from Z+.
              this._light.position.set(
                Math.cos(gdjs.toRad(-this._rotation + 90)) *
                  Math.cos(gdjs.toRad(this._elevation)),
                -Math.sin(gdjs.toRad(this._elevation)),
                Math.sin(gdjs.toRad(-this._rotation + 90)) *
                  Math.cos(gdjs.toRad(this._elevation))
              );
            } else {
              // `rotation` at 0° is a light from the right of the screen.
              this._light.position.set(
                Math.cos(gdjs.toRad(this._rotation)) *
                  Math.cos(gdjs.toRad(this._elevation)),
                Math.sin(gdjs.toRad(this._rotation)) *
                  Math.cos(gdjs.toRad(this._elevation)),
                Math.sin(gdjs.toRad(this._elevation))
              );
            }
          }
          getNetworkSyncData(): HemisphereLightFilterNetworkSyncData {
            return {
              i: this._targetIntensity,
              sc: this._targetSkyColor.getHex(),
              gc: this._targetGroundColor.getHex(),
              e: this._elevation,
              r: this._rotation,
              t: this._top,
              sm: this._smoothing,
            };
          }
          updateFromNetworkSyncData(
            syncData: HemisphereLightFilterNetworkSyncData
          ): void {
            this._targetIntensity = Math.max(0, syncData.i);
            this._targetSkyColor.setHex(syncData.sc);
            this._targetGroundColor.setHex(syncData.gc);
            this._elevation = syncData.e;
            this._rotation = syncData.r;
            this._top = syncData.t;
            this._smoothing = Math.max(0, syncData.sm ?? this._smoothing);
            this.updateRotation();
            if (this._smoothing <= 0) {
              this._light.intensity = this._targetIntensity;
              this._light.color.copy(this._targetSkyColor);
              this._light.groundColor.copy(this._targetGroundColor);
            }
          }
        })();
      }
    })()
  );
}
