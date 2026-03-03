namespace gdjs {
  interface BloomFilterNetworkSyncData {
    s: number;
    r: number;
    t: number;
    q?: string;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::Bloom',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          shaderPass: THREE_ADDONS.UnrealBloomPass;
          _isEnabled: boolean;
          _qualityMode: string;
          _renderSize: THREE.Vector2;

          constructor() {
            this.shaderPass = new THREE_ADDONS.UnrealBloomPass(
              new THREE.Vector2(256, 256),
              1,
              0,
              0
            );
            gdjs.markScene3DPostProcessingPass(this.shaderPass, 'BLOOM');
            this._isEnabled = false;
            this._qualityMode =
              effectData.stringParameters.qualityMode || 'medium';
            this._renderSize = new THREE.Vector2();
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
            gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'BLOOM');
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!(target instanceof gdjs.Layer)) {
              return;
            }
            const runtimeScene = target.getRuntimeScene();
            const threeRenderer = runtimeScene
              .getGame()
              .getRenderer()
              .getThreeRenderer();
            if (!threeRenderer) {
              return;
            }
            if (!gdjs.isScene3DPostProcessingEnabled(target)) {
              this.shaderPass.enabled = false;
              gdjs.clearScene3DPostProcessingEffectQualityMode(target, 'BLOOM');
              return;
            }

            gdjs.setScene3DPostProcessingEffectQualityMode(
              target,
              'BLOOM',
              this._qualityMode
            );

            const quality = gdjs.getScene3DPostProcessingQualityProfileForMode(
              this._qualityMode
            );
            threeRenderer.getDrawingBufferSize(this._renderSize);
            const width = Math.max(
              1,
              Math.round(
                (this._renderSize.x || target.getWidth()) * quality.captureScale
              )
            );
            const height = Math.max(
              1,
              Math.round(
                (this._renderSize.y || target.getHeight()) * quality.captureScale
              )
            );
            this.shaderPass.setSize(width, height);
            this.shaderPass.enabled = true;
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'strength') {
              this.shaderPass.strength = value;
            }
            if (parameterName === 'radius') {
              this.shaderPass.radius = value;
            }
            if (parameterName === 'threshold') {
              this.shaderPass.threshold = value;
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'strength') {
              return this.shaderPass.strength;
            }
            if (parameterName === 'radius') {
              return this.shaderPass.radius;
            }
            if (parameterName === 'threshold') {
              return this.shaderPass.threshold;
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
          updateBooleanParameter(parameterName: string, value: boolean): void {}
          getNetworkSyncData(): BloomFilterNetworkSyncData {
            return {
              s: this.shaderPass.strength,
              r: this.shaderPass.radius,
              t: this.shaderPass.threshold,
              q: this._qualityMode,
            };
          }
          updateFromNetworkSyncData(data: BloomFilterNetworkSyncData) {
            this.shaderPass.strength = data.s;
            this.shaderPass.radius = data.r;
            this.shaderPass.threshold = data.t;
            this._qualityMode = data.q || 'medium';
          }
        })();
      }
    })()
  );
}
