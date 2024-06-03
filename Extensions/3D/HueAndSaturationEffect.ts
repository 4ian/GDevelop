namespace gdjs {
  interface HueAndSaturationFilterExtra {
    h: number;
    s: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::HueAndSaturation',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          shaderPass: THREE_ADDONS.ShaderPass;
          _isEnabled: boolean;

          constructor() {
            this.shaderPass = new THREE_ADDONS.ShaderPass(
              THREE_ADDONS.HueSaturationShader
            );
            this._isEnabled = false;
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
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            target.getRenderer().addPostProcessingPass(this.shaderPass);
            this._isEnabled = true;
            return true;
          }
          removeEffect(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            target.getRenderer().removePostProcessingPass(this.shaderPass);
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {}
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'hue') {
              this.shaderPass.uniforms[parameterName].value = value / 180;
            }
            if (parameterName === 'saturation') {
              this.shaderPass.uniforms[parameterName].value = value;
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'hue') {
              return this.shaderPass.uniforms[parameterName].value * 180;
            }
            if (parameterName === 'saturation') {
              return this.shaderPass.uniforms[parameterName].value;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {}
          updateColorParameter(parameterName: string, value: number): void {}
          getColorParameter(parameterName: string): number {
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {}
          getNetworkSyncData(): HueAndSaturationFilterExtra {
            return {
              h: this.shaderPass.uniforms.hue.value,
              s: this.shaderPass.uniforms.saturation.value,
            };
          }
          updateFromNetworkSyncData(
            syncData: HueAndSaturationFilterExtra
          ): void {
            this.shaderPass.uniforms.hue.value = syncData.h;
            this.shaderPass.uniforms.saturation.value = syncData.s;
          }
        })();
      }
    })()
  );
}
