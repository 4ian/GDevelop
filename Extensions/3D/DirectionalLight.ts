namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::DirectionalLight',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        return new (class implements gdjs.PixiFiltersTools.Filter {
          light: THREE.DirectionalLight;
          _isEnabled: boolean;

          constructor() {
            this.light = new THREE.DirectionalLight();
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
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (!scene) {
              return false;
            }
            scene.add(this.light);
            scene.add(this.light.target);
            this._isEnabled = true;
            return true;
          }
          removeEffect(target: EffectsTarget): boolean {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (!scene) {
              return false;
            }
            scene.remove(this.light);
            scene.remove(this.light.target);
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {}
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this.light.intensity = value;
            } else if (parameterName === 'originX') {
              this.light.position.x = value;
            } else if (parameterName === 'originY') {
              this.light.position.y = value;
            } else if (parameterName === 'originZ') {
              this.light.position.z = value;
            } else if (parameterName === 'targetX') {
              this.light.target.position.x = value;
            } else if (parameterName === 'targetY') {
              this.light.target.position.y = value;
            } else if (parameterName === 'targetZ') {
              this.light.target.position.z = value;
            }
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'color') {
              this.light.color = new THREE.Color(
                gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value)
              );
            }
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {}
        })();
      }
    })()
  );
}
