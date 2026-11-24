namespace gdjs {
  interface ToneMappingFilterNetworkSyncData {
    m: string;
    e: number;
  }

  const toneMappingFunctions = {
    Neutral: 'NeutralToneMapping',
    ACESFilmic: 'ACESFilmicToneMapping',
    AgX: 'AgXToneMapping',
    Reinhard: 'ReinhardToneMapping',
    Cineon: 'CineonToneMapping',
  };
  type ToneMappingMode = keyof typeof toneMappingFunctions;
  const isToneMappingMode = (mode: string): mode is ToneMappingMode =>
    toneMappingFunctions.hasOwnProperty(mode);

  const toneMappingShader = {
    defines: {
      TONE_MAPPING_FUNCTION: toneMappingFunctions.Neutral,
    },
    uniforms: {
      tDiffuse: { value: null },
      exposure: { value: 1.0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <tonemapping_pars_fragment>

      uniform sampler2D tDiffuse;
      uniform float exposure;

      varying vec2 vUv;

      void main() {
        vec4 color = texture2D(tDiffuse, vUv);
        gl_FragColor = vec4(TONE_MAPPING_FUNCTION(color.rgb * exposure), color.a);
      }`,
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
          shaderPass: THREE_ADDONS.ShaderPass;
          _isEnabled: boolean = false;
          _mode: ToneMappingMode = 'Neutral';

          constructor() {
            this.shaderPass = new THREE_ADDONS.ShaderPass(toneMappingShader);
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
            if (parameterName === 'exposure') {
              this.shaderPass.uniforms.exposure.value = Math.max(0, value);
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'exposure') {
              return this.shaderPass.uniforms.exposure.value;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'mode') {
              this._setMode(value);
            }
          }
          _setMode(mode: string): void {
            if (!isToneMappingMode(mode) || mode === this._mode) {
              return;
            }
            this._mode = mode;
            this.shaderPass.material.defines.TONE_MAPPING_FUNCTION =
              toneMappingFunctions[this._mode];
            this.shaderPass.material.needsUpdate = true;
          }
          updateColorParameter(parameterName: string, value: number): void {}
          getColorParameter(parameterName: string): number {
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {}
          getNetworkSyncData(): ToneMappingFilterNetworkSyncData {
            return {
              m: this._mode,
              e: this.shaderPass.uniforms.exposure.value,
            };
          }
          updateFromNetworkSyncData(data: ToneMappingFilterNetworkSyncData) {
            this._setMode(data.m);
            this.shaderPass.uniforms.exposure.value = data.e;
          }
        })();
      }
    })()
  );
}
