namespace gdjs {
  interface DepthOfFieldNetworkSyncData {
    fd: number;
    fr: number;
    mb: number;
    s: number;
    e: boolean;
    q?: string;
  }

  const depthOfFieldShader = {
    uniforms: {
      tDiffuse: { value: null },
      tDepth: { value: null },
      resolution: { value: new THREE.Vector2(1, 1) },
      focusDistance: { value: 400.0 },
      focusRange: { value: 250.0 },
      maxBlur: { value: 6.0 },
      sampleCount: { value: 4.0 },
      cameraProjectionMatrixInverse: { value: new THREE.Matrix4() },
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
      uniform sampler2D tDepth;
      uniform vec2 resolution;
      uniform float focusDistance;
      uniform float focusRange;
      uniform float maxBlur;
      uniform float sampleCount;
      uniform mat4 cameraProjectionMatrixInverse;
      varying vec2 vUv;

      const int MAX_DOF_SAMPLES = 8;

      vec3 viewPositionFromDepth(vec2 uv, float depth) {
        vec4 clip = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 view = cameraProjectionMatrixInverse * clip;
        return view.xyz / max(view.w, 0.00001);
      }

      float getPixelDistance(float depth, vec2 uv) {
        if (depth >= 1.0) {
          return focusDistance + focusRange + maxBlur * 100.0;
        }
        return length(viewPositionFromDepth(uv, depth));
      }

      float getPixelDistanceFromUv(vec2 uv) {
        float sampleDepth = texture2D(tDepth, uv).x;
        return getPixelDistance(sampleDepth, uv);
      }

      float getBlurFactor(float distanceToCamera) {
        float safeRange = max(focusRange, 0.0001);
        float distanceFromFocus = abs(distanceToCamera - focusDistance);
        float raw = clamp(distanceFromFocus / safeRange, 0.0, 1.0);
        return raw * raw * (3.0 - 2.0 * raw);
      }

      void main() {
        vec4 baseColor = texture2D(tDiffuse, vUv);
        if (maxBlur <= 0.0) {
          gl_FragColor = baseColor;
          return;
        }

        float depth = texture2D(tDepth, vUv).x;
        float distanceToCamera = getPixelDistance(depth, vUv);
        float blurFactor = getBlurFactor(distanceToCamera);
        if (blurFactor <= 0.001) {
          gl_FragColor = baseColor;
          return;
        }

        float blurRadius = maxBlur * blurFactor;
        vec2 texel = 1.0 / resolution;
        float count = clamp(sampleCount, 2.0, float(MAX_DOF_SAMPLES));
        float adaptiveCount = max(
          2.0,
          floor(mix(2.0, count, blurFactor) + 0.5)
        );
        float bokehRotation = 2.39996322973;

        vec3 accumColor = baseColor.rgb;
        float accumWeight = 1.0;

        for (int i = 0; i < MAX_DOF_SAMPLES; i++) {
          if (float(i) >= adaptiveCount) {
            break;
          }
          float t = (float(i) + 0.5) / adaptiveCount;
          float angle = bokehRotation * float(i);
          float ring = mix(0.45, 1.0, sqrt(t));
          vec2 direction = vec2(cos(angle), sin(angle));
          vec2 sampleUv = clamp(
            vUv + direction * texel * blurRadius * ring,
            vec2(0.0),
            vec2(1.0)
          );
          vec3 sampleColor = texture2D(tDiffuse, sampleUv).rgb;
          float sampleDistance = getPixelDistanceFromUv(sampleUv);
          float sampleBlur = getBlurFactor(sampleDistance);
          float cocDifference = abs(sampleBlur - blurFactor);
          float depthWeight = 1.0 - smoothstep(0.15, 0.9, cocDifference);
          float sampleWeight = max(depthWeight, 0.05);
          accumColor += sampleColor * sampleWeight;
          accumWeight += sampleWeight;
        }

        vec3 blurredColor = accumColor / max(accumWeight, 0.00001);
        vec3 finalColor = mix(baseColor.rgb, blurredColor, blurFactor);
        gl_FragColor = vec4(finalColor, baseColor.a);
      }
    `,
  };

  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::DepthOfField',
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
          _focusDistance: number;
          _focusRange: number;
          _maxBlur: number;
          _samples: number;
          _effectiveSamples: number;
          _effectiveBlurScale: number;
          _qualityMode: string;

          constructor() {
            this.shaderPass = new THREE_ADDONS.ShaderPass(depthOfFieldShader);
            gdjs.markScene3DPostProcessingPass(this.shaderPass, 'DOF');
            this._isEnabled = false;
            this._effectEnabled =
              effectData.booleanParameters.enabled === undefined
                ? true
                : !!effectData.booleanParameters.enabled;
            this._focusDistance =
              effectData.doubleParameters.focusDistance !== undefined
                ? Math.max(0, effectData.doubleParameters.focusDistance)
                : 400;
            this._focusRange =
              effectData.doubleParameters.focusRange !== undefined
                ? Math.max(0.0001, effectData.doubleParameters.focusRange)
                : 250;
            this._maxBlur =
              effectData.doubleParameters.maxBlur !== undefined
                ? Math.max(0, effectData.doubleParameters.maxBlur)
                : 6;
            this._samples =
              effectData.doubleParameters.samples !== undefined
                ? Math.max(
                    2,
                    Math.min(8, Math.round(effectData.doubleParameters.samples))
                  )
                : 4;
            this._effectiveSamples = this._samples;
            this._effectiveBlurScale = 1.0;
            this._qualityMode =
              effectData.stringParameters.qualityMode || 'medium';

            this.shaderPass.uniforms.focusDistance.value = this._focusDistance;
            this.shaderPass.uniforms.focusRange.value = this._focusRange;
            this.shaderPass.uniforms.maxBlur.value = this._maxBlur;
            this.shaderPass.uniforms.sampleCount.value = this._samples;
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
            gdjs.reorderScene3DPostProcessingPasses(target);
            this._isEnabled = true;
            return true;
          }
          removeEffect(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            target.getRenderer().removePostProcessingPass(this.shaderPass);
            gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'DOF');
            this._isEnabled = false;
            return true;
          }

          private _adaptQuality(target: gdjs.EffectsTarget): void {
            if (!(target instanceof gdjs.Layer)) {
              return;
            }
            const quality = gdjs.getScene3DPostProcessingQualityProfileForLayerMode(
              target,
              this._qualityMode
            );
            this._effectiveSamples = Math.max(
              2,
              Math.min(quality.dofSamples, this._samples)
            );
            this._effectiveBlurScale = quality.dofBlurScale;
          }

          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled) {
              return;
            }
            if (!(target instanceof gdjs.Layer)) {
              return;
            }
            if (!this._effectEnabled) {
              this.shaderPass.enabled = false;
              gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'DOF');
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
              gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'DOF');
              return;
            }
            gdjs.setScene3DPostProcessingEffectQualityMode(
              target,
              'DOF',
              this._qualityMode
            );
            this._adaptQuality(target);

            const sharedCapture = gdjs.captureScene3DSharedTextures(
              target,
              threeRenderer,
              threeScene,
              threeCamera
            );
            if (!sharedCapture || !sharedCapture.depthTexture) {
              return;
            }

            threeCamera.updateMatrixWorld();
            threeCamera.updateProjectionMatrix();
            threeCamera.projectionMatrixInverse
              .copy(threeCamera.projectionMatrix)
              .invert();
            this.shaderPass.enabled = true;
            this.shaderPass.uniforms.resolution.value.set(
              sharedCapture.width,
              sharedCapture.height
            );
            this.shaderPass.uniforms.tDepth.value = sharedCapture.depthTexture;
            this.shaderPass.uniforms.cameraProjectionMatrixInverse.value.copy(
              threeCamera.projectionMatrixInverse
            );
            this.shaderPass.uniforms.focusDistance.value = this._focusDistance;
            this.shaderPass.uniforms.focusRange.value = this._focusRange;
            this.shaderPass.uniforms.maxBlur.value =
              this._maxBlur * this._effectiveBlurScale;
            this.shaderPass.uniforms.sampleCount.value = this._effectiveSamples;
          }

          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'focusDistance') {
              this._focusDistance = Math.max(0, value);
              this.shaderPass.uniforms.focusDistance.value =
                this._focusDistance;
            } else if (parameterName === 'focusRange') {
              this._focusRange = Math.max(0.0001, value);
              this.shaderPass.uniforms.focusRange.value = this._focusRange;
            } else if (parameterName === 'maxBlur') {
              this._maxBlur = Math.max(0, value);
              this.shaderPass.uniforms.maxBlur.value = this._maxBlur;
            } else if (parameterName === 'samples') {
              this._samples = Math.max(2, Math.min(8, Math.round(value)));
              this.shaderPass.uniforms.sampleCount.value = this._samples;
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'focusDistance') {
              return this._focusDistance;
            }
            if (parameterName === 'focusRange') {
              return this._focusRange;
            }
            if (parameterName === 'maxBlur') {
              return this._maxBlur;
            }
            if (parameterName === 'samples') {
              return this._samples;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'qualityMode') {
              this._qualityMode = value || 'medium';
            }
          }
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
          getNetworkSyncData(): DepthOfFieldNetworkSyncData {
            return {
              fd: this._focusDistance,
              fr: this._focusRange,
              mb: this._maxBlur,
              s: this._samples,
              e: this._effectEnabled,
              q: this._qualityMode,
            };
          }
          updateFromNetworkSyncData(
            syncData: DepthOfFieldNetworkSyncData
          ): void {
            this._focusDistance = syncData.fd;
            this._focusRange = syncData.fr;
            this._maxBlur = syncData.mb;
            this._samples = Math.max(2, Math.min(8, Math.round(syncData.s)));
            this._effectEnabled = syncData.e;
            this._qualityMode = syncData.q || 'medium';

            this.shaderPass.uniforms.focusDistance.value = this._focusDistance;
            this.shaderPass.uniforms.focusRange.value = this._focusRange;
            this.shaderPass.uniforms.maxBlur.value = this._maxBlur;
            this.shaderPass.uniforms.sampleCount.value = this._samples;
            this.shaderPass.enabled = this._effectEnabled;
          }
        })();
      }
    })()
  );
}
