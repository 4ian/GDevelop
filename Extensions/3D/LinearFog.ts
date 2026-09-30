namespace gdjs {
  interface LinearFogFilterNetworkSyncData {
    n: number;
    f: number;
    c: number;
  }
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::LinearFog',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          fog: THREE.Fog;
          // In scene units: the fog is converted to the Three.js world units
          // before each rendering, as the world scale can change in the editor.
          private _near: float = 200;
          private _far: float = 2000;

          constructor() {
            this.fog = new THREE.Fog(0xffffff);
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
            this._updateFogDistances();
          }
          private _updateFogDistances(): void {
            const scene = target.getRuntimeScene().getScene();
            const inverseWorldScale = scene.getRenderer3DInverseWorldScale();
            this.fog.near = this._near * inverseWorldScale;
            this.fog.far = this._far * inverseWorldScale;
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'near') {
              this._near = value;
            } else if (parameterName === 'far') {
              this._far = value;
            }
            this._updateFogDistances();
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'near') {
              return this._near;
            } else if (parameterName === 'far') {
              return this._far;
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
          getNetworkSyncData(): LinearFogFilterNetworkSyncData {
            return {
              n: this._near,
              f: this._far,
              c: this.fog.color.getHex(),
            };
          }
          updateFromNetworkSyncData(
            data: LinearFogFilterNetworkSyncData
          ): void {
            this._near = data.n;
            this._far = data.f;
            this._updateFogDistances();
            this.fog.color.setHex(data.c);
          }
        })();
      }
    })()
  );
}
