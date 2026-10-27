namespace gdjs {
  interface BrightnessAndContrastFilterNetworkSyncData {
    b: number;
    c: number;
  }
  // `THREE_ADDONS.BrightnessContrastShader`, applied on the color of each pixel
  // rather than on its color premultiplied by its opacity. Otherwise, the
  // transparent parts of the layer would be changed too, and would be drawn
  // on top of the layers rendered before this one.
  const brightnessAndContrastFragmentShader = /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float brightness;
    uniform float contrast;

    varying vec2 vUv;

    void main() {
      gl_FragColor = texture2D(tDiffuse, vUv);
      float opacity = clamp(gl_FragColor.a, 0.0, 1.0);
      if (opacity <= 0.0) {
        return;
      }

      vec3 color = gl_FragColor.rgb / opacity + brightness;
      if (contrast > 0.0) {
        color = (color - 0.5) / (1.0 - contrast) + 0.5;
      } else {
        color = (color - 0.5) * (1.0 + contrast) + 0.5;
      }
      gl_FragColor.rgb = max(color, 0.0) * opacity;
    }`;

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::BrightnessAndContrast',
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
            this.shaderPass = new THREE_ADDONS.ShaderPass({
              ...THREE_ADDONS.BrightnessContrastShader,
              fragmentShader: brightnessAndContrastFragmentShader,
            });
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
            target
              .getRenderer()
              .addPostProcessingPass(this.shaderPass, effectData.name);
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
            if (parameterName === 'brightness') {
              this.shaderPass.uniforms[parameterName].value = value;
            }
            if (parameterName === 'contrast') {
              this.shaderPass.uniforms[parameterName].value = value;
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'brightness') {
              return this.shaderPass.uniforms[parameterName].value;
            }
            if (parameterName === 'contrast') {
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
          getNetworkSyncData(): BrightnessAndContrastFilterNetworkSyncData {
            return {
              b: this.shaderPass.uniforms.brightness.value,
              c: this.shaderPass.uniforms.contrast.value,
            };
          }
          updateFromNetworkSyncData(
            data: BrightnessAndContrastFilterNetworkSyncData
          ) {
            this.shaderPass.uniforms.brightness.value = data.b;
            this.shaderPass.uniforms.contrast.value = data.c;
          }
        })();
      }
    })()
  );
}
