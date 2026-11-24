namespace gdjs {
  interface DepthOfFieldFilterNetworkSyncData {
    fd: number;
    fr: number;
    td: number;
    mb: number;
  }

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
          shaderPass: THREE_ADDONS.DepthOfFieldPass;
          _isEnabled: boolean = false;
          // Distances are in scene units: they are converted to the Three.js
          // world units before each rendering, as the world scale can change.
          _focusDistance: float = 500;
          _focusRange: float = 600;
          _transitionDistance: float = 1500;
          // In pixels of the game resolution.
          _maxBlur: float = 6;

          constructor() {
            this.shaderPass = new THREE_ADDONS.DepthOfFieldPass();
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
            // The depth texture is counted once per enabled effect.
            if (this._isEnabled) {
              return true;
            }
            const layerRenderer = target.getRenderer();
            layerRenderer.setSceneDepthTextureNeeded(true);
            layerRenderer.addPostProcessingPass(
              this.shaderPass,
              effectData.name
            );
            this._isEnabled = true;
            return true;
          }
          removeEffect(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            if (!this._isEnabled) {
              return true;
            }
            const layerRenderer = target.getRenderer();
            layerRenderer.removePostProcessingPass(this.shaderPass);
            layerRenderer.setSceneDepthTextureNeeded(false);
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!(target instanceof gdjs.Layer)) {
              return;
            }
            const layerRenderer = target.getRenderer();
            const camera = layerRenderer.getThreeCamera();
            const depthTexture = layerRenderer.getSceneDepthTexture();
            const uniforms = this.shaderPass.uniforms;
            // Without the depth, the shader would blur everything.
            this.shaderPass.enabled = !!camera && !!depthTexture;
            if (!camera || !depthTexture) {
              return;
            }
            uniforms.tDepth.value = depthTexture;
            uniforms.nearClip.value = camera.near;
            uniforms.farClip.value = camera.far;
            this.shaderPass.setPerspectiveCamera(
              camera instanceof THREE.PerspectiveCamera
            );

            const inverseWorldScale = target
              .getRuntimeScene()
              .getScene()
              .getRenderer3DInverseWorldScale();
            uniforms.focusDistance.value =
              this._focusDistance * inverseWorldScale;
            uniforms.focusRange.value = this._focusRange * inverseWorldScale;
            uniforms.transitionDistance.value = Math.max(
              0.0001,
              this._transitionDistance * inverseWorldScale
            );

            const width = target.getWidth();
            const height = target.getHeight();
            uniforms.aspect.value = height > 0 ? width / height : 1;
            uniforms.maxBlur.value = width > 0 ? this._maxBlur / width : 0;
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'focusDistance') {
              this._focusDistance = value;
            } else if (parameterName === 'focusRange') {
              this._focusRange = Math.max(0, value);
            } else if (parameterName === 'transitionDistance') {
              this._transitionDistance = Math.max(0, value);
            } else if (parameterName === 'maxBlur') {
              this._maxBlur = Math.max(0, value);
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'focusDistance') {
              return this._focusDistance;
            }
            if (parameterName === 'focusRange') {
              return this._focusRange;
            }
            if (parameterName === 'transitionDistance') {
              return this._transitionDistance;
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
          updateBooleanParameter(parameterName: string, value: boolean): void {}
          getNetworkSyncData(): DepthOfFieldFilterNetworkSyncData {
            return {
              fd: this._focusDistance,
              fr: this._focusRange,
              td: this._transitionDistance,
              mb: this._maxBlur,
            };
          }
          updateFromNetworkSyncData(data: DepthOfFieldFilterNetworkSyncData) {
            this._focusDistance = data.fd;
            this._focusRange = data.fr;
            this._transitionDistance = data.td;
            this._maxBlur = data.mb;
          }
        })();
      }
    })()
  );
}
