namespace gdjs {
  interface ChromaticAberrationNetworkSyncData {
    i: number;
    rs: number;
    e: boolean;
  }

  const chromaticAberrationShader = {
    uniforms: {
      tDiffuse: { value: null },
      tSceneColor: { value: null },
      intensity: { value: 0.005 },
      radialScale: { value: 1.0 },
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
      uniform float intensity;
      uniform float radialScale;
      varying vec2 vUv;

      vec2 clampUv(vec2 uv) {
        return clamp(uv, vec2(0.0), vec2(1.0));
      }

      void main() {
        vec4 baseColor = texture2D(tDiffuse, vUv);
        if (intensity <= 0.0) {
          gl_FragColor = baseColor;
          return;
        }

        vec2 centered = vUv - vec2(0.5);
        float distanceFromCenter = length(centered);
        vec2 direction =
          distanceFromCenter > 0.00001
            ? centered / distanceFromCenter
            : vec2(0.0);

        float edgeFactor = clamp(distanceFromCenter * 1.41421356237, 0.0, 1.0);
        edgeFactor = pow(edgeFactor, max(0.0001, radialScale));
        vec2 channelOffset = direction * intensity * edgeFactor;

        vec2 uvRed = clampUv(vUv + channelOffset);
        vec2 uvBlue = clampUv(vUv - channelOffset);

        vec3 diffuseRed = texture2D(tDiffuse, uvRed).rgb;
        vec3 diffuseCenter = texture2D(tDiffuse, vUv).rgb;
        vec3 diffuseBlue = texture2D(tDiffuse, uvBlue).rgb;

        // Blend in a bit of shared scene capture to keep this pass coherent
        // with the centralized PostProcessingStack capture flow.
        vec3 sceneRed = texture2D(tSceneColor, uvRed).rgb;
        vec3 sceneBlue = texture2D(tSceneColor, uvBlue).rgb;
        float captureMix = 0.18;

        float red = mix(diffuseRed.r, sceneRed.r, captureMix);
        float green = diffuseCenter.g;
        float blue = mix(diffuseBlue.b, sceneBlue.b, captureMix);

        gl_FragColor = vec4(red, green, blue, baseColor.a);
      }
    `,
  };

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::ChromaticAberration',
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
          _intensity: number;
          _radialScale: number;

          constructor() {
            this.shaderPass = new THREE_ADDONS.ShaderPass(
              chromaticAberrationShader
            );
            gdjs.markScene3DPostProcessingPass(this.shaderPass, 'CHROMA');
            this._isEnabled = false;
            this._effectEnabled = true;
            this._intensity = 0.005;
            this._radialScale = 1.0;
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
            this.shaderPass.uniforms.intensity.value = this._intensity;
            this.shaderPass.uniforms.radialScale.value = this._radialScale;
          }

          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this._intensity = Math.max(0, value);
              this.shaderPass.uniforms.intensity.value = this._intensity;
            } else if (parameterName === 'radialScale') {
              this._radialScale = Math.max(0, value);
              this.shaderPass.uniforms.radialScale.value = this._radialScale;
            }
          }

          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._intensity;
            }
            if (parameterName === 'radialScale') {
              return this._radialScale;
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

          getNetworkSyncData(): ChromaticAberrationNetworkSyncData {
            return {
              i: this._intensity,
              rs: this._radialScale,
              e: this._effectEnabled,
            };
          }

          updateFromNetworkSyncData(
            syncData: ChromaticAberrationNetworkSyncData
          ): void {
            this._intensity = Math.max(0, syncData.i);
            this._radialScale = Math.max(0, syncData.rs);
            this._effectEnabled = !!syncData.e;

            this.shaderPass.uniforms.intensity.value = this._intensity;
            this.shaderPass.uniforms.radialScale.value = this._radialScale;
            this.shaderPass.enabled = this._effectEnabled;
          }
        })();
      }
    })()
  );
}
