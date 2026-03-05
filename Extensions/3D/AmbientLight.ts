namespace gdjs {
  interface AmbientLightFilterNetworkSyncData {
    i: number;
    c: number;
    sm?: number;
  }
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
          _targetIntensity: float;
          _targetColor: THREE.Color;
          _smoothing: float;

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
            this.light.intensity = this._targetIntensity;
            this.light.color.copy(this._targetColor);
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
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            if (this._smoothing <= 0) {
              this.light.intensity = this._targetIntensity;
              this.light.color.copy(this._targetColor);
              return;
            }

            const runtimeScene = target.getRuntimeScene
              ? target.getRuntimeScene()
              : null;
            if (!runtimeScene) {
              this.light.intensity = this._targetIntensity;
              this.light.color.copy(this._targetColor);
              return;
            }

            const deltaTime = Math.max(0, runtimeScene.getElapsedTime() / 1000);
            if (deltaTime <= 0) {
              return;
            }
            const alpha = 1 - Math.exp(-this._smoothing * deltaTime);

            this.light.intensity +=
              (this._targetIntensity - this.light.intensity) * alpha;
            this.light.color.lerp(this._targetColor, alpha);
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
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._targetIntensity;
            }
            if (parameterName === 'smoothing') {
              return this._smoothing;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'color') {
              this._targetColor.setHex(gdjs.rgbOrHexStringToNumber(value));
              if (this._smoothing <= 0) {
                this.light.color.copy(this._targetColor);
              }
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
          updateBooleanParameter(parameterName: string, value: boolean): void {}
          getNetworkSyncData(): AmbientLightFilterNetworkSyncData {
            return {
              i: this._targetIntensity,
              c: this._targetColor.getHex(),
              sm: this._smoothing,
            };
          }
          updateFromNetworkSyncData(data: AmbientLightFilterNetworkSyncData) {
            this._targetIntensity = Math.max(0, data.i);
            this._targetColor.setHex(data.c);
            this._smoothing = Math.max(0, data.sm ?? this._smoothing);
            if (this._smoothing <= 0) {
              this.light.intensity = this._targetIntensity;
              this.light.color.copy(this._targetColor);
            }
          }
        })();
      }
    })()
  );
}
