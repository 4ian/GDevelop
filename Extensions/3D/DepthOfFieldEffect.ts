namespace gdjs {
  interface DepthOfFieldNetworkSyncData {
    fd: number;
    fr: number;
    mb: number;
    e: boolean;
  }

  const depthOfFieldShader = {
    uniforms: {
      tDiffuse: { value: null },
      tDepth: { value: null },
      resolution: { value: new THREE.Vector2(1, 1) },
      focusDistance: { value: 400.0 },
      focusRange: { value: 250.0 },
      maxBlur: { value: 6.0 },
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
      uniform mat4 cameraProjectionMatrixInverse;
      varying vec2 vUv;

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
        float sigma = max(blurRadius * 0.75, 0.5);
        float twoSigmaSquared = 2.0 * sigma * sigma;

        vec3 accumColor = vec3(0.0);
        float accumWeight = 0.0;

        for (int x = -3; x <= 3; x++) {
          for (int y = -3; y <= 3; y++) {
            vec2 offset = vec2(float(x), float(y));
            float distanceSquared = dot(offset, offset);
            float weight = exp(-distanceSquared / twoSigmaSquared);
            vec2 sampleUv = vUv + offset * texel * blurRadius;
            vec3 sampleColor = texture2D(tDiffuse, sampleUv).rgb;
            accumColor += sampleColor * weight;
            accumWeight += weight;
          }
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
          _sceneRenderTarget: THREE.WebGLRenderTarget;
          _previousViewport: THREE.Vector4;
          _previousScissor: THREE.Vector4;
          _renderSize: THREE.Vector2;

          constructor() {
            this.shaderPass = new THREE_ADDONS.ShaderPass(depthOfFieldShader);
            gdjs.markScene3DPostProcessingPass(this.shaderPass, 'DOF');
            this._isEnabled = false;
            this._effectEnabled = true;
            this._focusDistance = 400;
            this._focusRange = 250;
            this._maxBlur = 6;

            this._sceneRenderTarget = new THREE.WebGLRenderTarget(1, 1, {
              minFilter: THREE.LinearFilter,
              magFilter: THREE.LinearFilter,
              format: THREE.RGBAFormat,
              depthBuffer: true,
              stencilBuffer: false,
            });
            this._sceneRenderTarget.texture.generateMipmaps = false;
            this._sceneRenderTarget.depthTexture = new THREE.DepthTexture(1, 1);
            this._sceneRenderTarget.depthTexture.format = THREE.DepthFormat;
            this._sceneRenderTarget.depthTexture.type = THREE.UnsignedIntType;
            this._sceneRenderTarget.depthTexture.needsUpdate = true;

            this.shaderPass.uniforms.tDepth.value =
              this._sceneRenderTarget.depthTexture;
            this.shaderPass.uniforms.focusDistance.value = this._focusDistance;
            this.shaderPass.uniforms.focusRange.value = this._focusRange;
            this.shaderPass.uniforms.maxBlur.value = this._maxBlur;
            this.shaderPass.enabled = true;

            this._previousViewport = new THREE.Vector4();
            this._previousScissor = new THREE.Vector4();
            this._renderSize = new THREE.Vector2();
            // Kept for backward compatibility while shared capture is active.
            void this._updateRenderTargetSize;
            void this._captureScene;
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

          private _updateRenderTargetSize(
            threeRenderer: THREE.WebGLRenderer
          ): void {
            threeRenderer.getDrawingBufferSize(this._renderSize);
            const width = Math.max(1, Math.round(this._renderSize.x || 1));
            const height = Math.max(1, Math.round(this._renderSize.y || 1));

            if (
              this._sceneRenderTarget.width !== width ||
              this._sceneRenderTarget.height !== height
            ) {
              this._sceneRenderTarget.setSize(width, height);
              if (this._sceneRenderTarget.depthTexture) {
                this._sceneRenderTarget.depthTexture.needsUpdate = true;
              }
            }

            this.shaderPass.uniforms.resolution.value.set(width, height);
            this.shaderPass.uniforms.tDepth.value =
              this._sceneRenderTarget.depthTexture;
            this._sceneRenderTarget.texture.colorSpace =
              threeRenderer.outputColorSpace;
          }

          private _captureScene(
            threeRenderer: THREE.WebGLRenderer,
            scene: THREE.Scene,
            camera: THREE.Camera
          ): void {
            const previousRenderTarget = threeRenderer.getRenderTarget();
            const previousAutoClear = threeRenderer.autoClear;
            const previousScissorTest = threeRenderer.getScissorTest();
            const previousXrEnabled = threeRenderer.xr.enabled;
            threeRenderer.getViewport(this._previousViewport);
            threeRenderer.getScissor(this._previousScissor);

            threeRenderer.xr.enabled = false;
            threeRenderer.autoClear = true;
            threeRenderer.setRenderTarget(this._sceneRenderTarget);
            threeRenderer.clear(true, true, true);
            threeRenderer.render(scene, camera);

            threeRenderer.setRenderTarget(previousRenderTarget);
            threeRenderer.setViewport(this._previousViewport);
            threeRenderer.setScissor(this._previousScissor);
            threeRenderer.setScissorTest(previousScissorTest);
            threeRenderer.autoClear = previousAutoClear;
            threeRenderer.xr.enabled = previousXrEnabled;
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
            if (!sharedCapture || !sharedCapture.depthTexture) {
              return;
            }

            threeCamera.updateMatrixWorld();
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
              this._maxBlur * sharedCapture.quality.dofBlurScale;
          }

          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'focusDistance') {
              this._focusDistance = Math.max(0, value);
              this.shaderPass.uniforms.focusDistance.value = this._focusDistance;
            } else if (parameterName === 'focusRange') {
              this._focusRange = Math.max(0.0001, value);
              this.shaderPass.uniforms.focusRange.value = this._focusRange;
            } else if (parameterName === 'maxBlur') {
              this._maxBlur = Math.max(0, value);
              this.shaderPass.uniforms.maxBlur.value = this._maxBlur;
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
          getNetworkSyncData(): DepthOfFieldNetworkSyncData {
            return {
              fd: this._focusDistance,
              fr: this._focusRange,
              mb: this._maxBlur,
              e: this._effectEnabled,
            };
          }
          updateFromNetworkSyncData(syncData: DepthOfFieldNetworkSyncData): void {
            this._focusDistance = syncData.fd;
            this._focusRange = syncData.fr;
            this._maxBlur = syncData.mb;
            this._effectEnabled = syncData.e;

            this.shaderPass.uniforms.focusDistance.value = this._focusDistance;
            this.shaderPass.uniforms.focusRange.value = this._focusRange;
            this.shaderPass.uniforms.maxBlur.value = this._maxBlur;
            this.shaderPass.enabled = this._effectEnabled;
          }
        })();
      }
    })()
  );
}
