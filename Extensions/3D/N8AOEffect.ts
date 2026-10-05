namespace gdjs {
  interface N8AOFilterNetworkSyncData {
    r: number;
    d: number;
    i: number;
    c: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::N8AO',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          shaderPass: THREE_ADDONS.N8AOPass;
          _isEnabled: boolean;
          // In scene units: converted to the Three.js world units before each
          // rendering, as the world scale can change in the editor.
          _radius: float = 50;

          constructor() {
            const layer = target.getRuntimeLayer!()!;
            const scene = layer.get3DRendererObject()!;
            const camera = layer.getRenderer().getThreeCamera()!;
            this.shaderPass = new THREE_ADDONS.N8AOPass(
              scene,
              camera,
              layer.getWidth(),
              layer.getHeight()
            );
            this.shaderPass.configuration.halfRes = true;
            this.shaderPass.configuration.gammaCorrection = false;
            this.shaderPass.configuration.accumulate = false;
            this.shaderPass.configuration.transparencyAware = false;
            this.shaderPass.autoDetectTransparency = false;
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
            target.getRenderer().setCustomRenderPass(this.shaderPass);
            this._isEnabled = true;
            return true;
          }
          removeEffect(target: EffectsTarget): boolean {
            if (!(target instanceof gdjs.Layer)) {
              return false;
            }
            target.getRenderer().setCustomRenderPass(null);
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            this._updateRadius();
          }
          _updateRadius(): void {
            const aoRadius =
              this._radius *
              target
                .getRuntimeScene()
                .getScene()
                .getRenderer3DInverseWorldScale();
            if (this.shaderPass.configuration.aoRadius !== aoRadius) {
              this.shaderPass.configuration.aoRadius = aoRadius;
            }
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'radius') {
              this._radius = value;
              this._updateRadius();
            }
            if (parameterName === 'distanceFalloff') {
              this.shaderPass.configuration.distanceFalloff = value;
            }
            if (parameterName === 'intensity') {
              this.shaderPass.configuration.intensity = value;
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'radius') {
              return this._radius;
            }
            if (parameterName === 'distanceFalloff') {
              return this.shaderPass.configuration.distanceFalloff;
            }
            if (parameterName === 'intensity') {
              return this.shaderPass.configuration.intensity;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'quality') {
              if (
                value === 'Performance' ||
                value === 'Low' ||
                value === 'Medium' ||
                value === 'High' ||
                value === 'Ultra'
              ) {
                this.shaderPass.setQualityMode(value);
              }
            }
            if (parameterName === 'color') {
              this.shaderPass.configuration.color = new THREE.Color(
                gdjs.rgbOrHexStringToNumber(value)
              );
            }
          }
          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'color') {
              this.shaderPass.configuration.color.setHex(value);
            }
          }
          getColorParameter(parameterName: string): number {
            if (parameterName === 'color') {
              return this.shaderPass.configuration.color.getHex();
            }
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {}
          getNetworkSyncData(): N8AOFilterNetworkSyncData {
            return {
              r: this._radius,
              d: this.shaderPass.configuration.distanceFalloff,
              i: this.shaderPass.configuration.intensity,
              c: this.shaderPass.configuration.color.getHex(),
            };
          }
          updateFromNetworkSyncData(data: N8AOFilterNetworkSyncData) {
            this._radius = data.r;
            this._updateRadius();
            this.shaderPass.configuration.distanceFalloff = data.d;
            this.shaderPass.configuration.intensity = data.i;
            this.shaderPass.configuration.color.setHex(data.c);
          }
        })();
      }
    })()
  );
}
