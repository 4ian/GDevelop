namespace gdjs {
  interface ColorGradingNetworkSyncData {
    t: number;
    ti: number;
    s: number;
    c: number;
    b: number;
    e: boolean;
  }

  const colorGradingShader = {
    uniforms: {
      tDiffuse: { value: null },
      tSceneColor: { value: null },
      temperature: { value: -0.3 },
      tint: { value: -0.1 },
      saturation: { value: 0.8 },
      contrast: { value: 1.2 },
      brightness: { value: 0.95 },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      uniform sampler2D tDiffuse;
      uniform sampler2D tSceneColor;
      uniform float temperature;
      uniform float tint;
      uniform float saturation;
      uniform float contrast;
      uniform float brightness;
      varying vec2 vUv;

      vec3 applyTemperatureAndTint(vec3 color, float temp, float tintShift) {
        // Temperature: negative cools (blue), positive warms (orange).
        color += vec3(temp * 0.12, temp * 0.03, -temp * 0.12);

        // Tint: negative -> green, positive -> magenta.
        color += vec3(tintShift * 0.05, -tintShift * 0.1, tintShift * 0.05);
        return color;
      }

      vec3 applySaturation(vec3 color, float sat) {
        float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
        return mix(vec3(luma), color, sat);
      }

      vec3 applyContrast(vec3 color, float ctr) {
        return (color - 0.5) * ctr + 0.5;
      }

      void main() {
        vec4 inputColor = texture2D(tDiffuse, vUv);
        vec3 sceneColor = texture2D(tSceneColor, vUv).rgb;

        // Keep current stack output as primary source while integrating shared capture.
        vec3 color = mix(sceneColor, inputColor.rgb, 0.85);

        color = applyTemperatureAndTint(color, temperature, tint);
        color = applySaturation(color, saturation);
        color = applyContrast(color, contrast);
        color *= brightness;

        gl_FragColor = vec4(clamp(color, 0.0, 1.0), inputColor.a);
      }
    `,
  };

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::ColorGrading',
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
          _effectEnabled: boolean;
          _temperature: number;
          _tint: number;
          _saturation: number;
          _contrast: number;
          _brightness: number;

          constructor() {
            this.shaderPass = new THREE_ADDONS.ShaderPass(colorGradingShader);
            gdjs.markScene3DPostProcessingPass(this.shaderPass, 'COLORGRADE');
            this._isEnabled = false;
            this._effectEnabled = true;
            this._temperature = -0.3;
            this._tint = -0.1;
            this._saturation = 0.8;
            this._contrast = 1.2;
            this._brightness = 0.95;
            this.shaderPass.enabled = true;
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

          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled || !this._effectEnabled) {
              return;
            }
            if (!(target instanceof gdjs.Layer)) {
              return;
            }

            const runtimeScene = target.getRuntimeScene();
            const threeRenderer = runtimeScene
              .getGame()
              .getRenderer()
              .getThreeRenderer();
            const layerRenderer = target.getRenderer();
            const threeScene = layerRenderer.getThreeScene();
            const threeCamera = layerRenderer.getThreeCamera();

            if (!threeRenderer || !threeScene || !threeCamera) {
              return;
            }

            if (!gdjs.isScene3DPostProcessingEnabled(target)) {
              this.shaderPass.enabled = false;
              return;
            }

            const sharedCapture = gdjs.captureScene3DSharedTextures(
              target,
              threeRenderer,
              threeScene,
              threeCamera
            );
            if (!sharedCapture) {
              return;
            }

            this.shaderPass.enabled = true;
            this.shaderPass.uniforms.tSceneColor.value =
              sharedCapture.colorTexture;
            this.shaderPass.uniforms.temperature.value = this._temperature;
            this.shaderPass.uniforms.tint.value = this._tint;
            this.shaderPass.uniforms.saturation.value = this._saturation;
            this.shaderPass.uniforms.contrast.value = this._contrast;
            this.shaderPass.uniforms.brightness.value = this._brightness;
          }

          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'temperature') {
              this._temperature = gdjs.evtTools.common.clamp(-2, 2, value);
              this.shaderPass.uniforms.temperature.value = this._temperature;
            } else if (parameterName === 'tint') {
              this._tint = gdjs.evtTools.common.clamp(-2, 2, value);
              this.shaderPass.uniforms.tint.value = this._tint;
            } else if (parameterName === 'saturation') {
              this._saturation = Math.max(0, value);
              this.shaderPass.uniforms.saturation.value = this._saturation;
            } else if (parameterName === 'contrast') {
              this._contrast = Math.max(0, value);
              this.shaderPass.uniforms.contrast.value = this._contrast;
            } else if (parameterName === 'brightness') {
              this._brightness = Math.max(0, value);
              this.shaderPass.uniforms.brightness.value = this._brightness;
            }
          }

          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'temperature') {
              return this._temperature;
            }
            if (parameterName === 'tint') {
              return this._tint;
            }
            if (parameterName === 'saturation') {
              return this._saturation;
            }
            if (parameterName === 'contrast') {
              return this._contrast;
            }
            if (parameterName === 'brightness') {
              return this._brightness;
            }
            return 0;
          }

          updateStringParameter(parameterName: string, value: string): void {}
          updateColorParameter(parameterName: string, value: number): void {}
          getColorParameter(parameterName: string): number {
            return 0;
          }

          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'enabled') {
              this._effectEnabled = value;
              this.shaderPass.enabled = value;
            }
          }

          getNetworkSyncData(): ColorGradingNetworkSyncData {
            return {
              t: this._temperature,
              ti: this._tint,
              s: this._saturation,
              c: this._contrast,
              b: this._brightness,
              e: this._effectEnabled,
            };
          }

          updateFromNetworkSyncData(syncData: ColorGradingNetworkSyncData): void {
            this._temperature = gdjs.evtTools.common.clamp(-2, 2, syncData.t);
            this._tint = gdjs.evtTools.common.clamp(-2, 2, syncData.ti);
            this._saturation = Math.max(0, syncData.s);
            this._contrast = Math.max(0, syncData.c);
            this._brightness = Math.max(0, syncData.b);
            this._effectEnabled = !!syncData.e;

            this.shaderPass.uniforms.temperature.value = this._temperature;
            this.shaderPass.uniforms.tint.value = this._tint;
            this.shaderPass.uniforms.saturation.value = this._saturation;
            this.shaderPass.uniforms.contrast.value = this._contrast;
            this.shaderPass.uniforms.brightness.value = this._brightness;
            this.shaderPass.enabled = this._effectEnabled;
          }
        })();
      }
    })()
  );
}
