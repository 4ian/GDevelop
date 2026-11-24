namespace gdjs {
  interface ExponentialFogFilterNetworkSyncData {
    d: number;
    c: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::ExponentialFog',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          fog: THREE.FogExp2;
          // In scene units: the fog is converted to the Three.js world units
          // before each rendering, as the world scale can change in the editor.
          private _density: float = 0.0012;

          constructor() {
            this.fog = new THREE.FogExp2(0xffffff);
          }

          isEnabled(target: EffectsTarget): boolean {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            return scene ? scene.fog === this.fog : false;
          }
          setEnabled(target: EffectsTarget, enabled: boolean): boolean {
            if (enabled) {
              return this.applyEffect(target);
            } else {
              return this.removeEffect(target);
            }
          }
          applyEffect(target: EffectsTarget): boolean {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (!scene || scene.fog === undefined) {
              return false;
            }
            scene.fog = this.fog;
            return true;
          }
          removeEffect(target: EffectsTarget): boolean {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (!scene || scene.fog === undefined) {
              return false;
            }
            scene.fog = null;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            this._updateFogDensity();
          }
          private _updateFogDensity(): void {
            const scene = target.getRuntimeScene().getScene();
            const worldScale = scene.getRenderer3DWorldScale();
            this.fog.density = this._density * worldScale;
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'density') {
              this._density = value;
              this._updateFogDensity();
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'density') {
              return this._density;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'color') {
              this.fog.color = new THREE.Color(
                gdjs.rgbOrHexStringToNumber(value)
              );
            }
          }
          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'color') {
              this.fog.color.setHex(value);
            }
          }
          getColorParameter(parameterName: string): number {
            if (parameterName === 'color') {
              return this.fog.color.getHex();
            }
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {}
          getNetworkSyncData(): ExponentialFogFilterNetworkSyncData {
            return {
              d: this._density,
              c: this.fog.color.getHex(),
            };
          }
          updateFromNetworkSyncData(
            syncData: ExponentialFogFilterNetworkSyncData
          ): void {
            this._density = syncData.d;
            this._updateFogDensity();
            this.fog.color.setHex(syncData.c);
          }
        })();
      }
    })()
  );
}
