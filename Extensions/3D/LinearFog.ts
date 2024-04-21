namespace gdjs {
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
          updatePreRender(target: gdjs.EffectsTarget): any {}
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'near') {
              this.fog.near = value;
            } else if (parameterName === 'far') {
              this.fog.far = value;
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'near') {
              return this.fog.near;
            } else if (parameterName === 'far') {
              return this.fog.far;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'color') {
              this.fog.color = new THREE.Color(
                gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value)
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
        })();
      }
    })()
  );
}
