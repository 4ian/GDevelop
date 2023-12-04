namespace gdjs {
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::HemisphereLight',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          light: THREE.HemisphereLight;
          rotationObject: THREE.Group;
          _isEnabled: boolean = false;
          top: string = 'Y-';
          elevation: float = 45;
          rotation: float = 0;

          constructor() {
            this.light = new THREE.HemisphereLight();
            this.light.position.set(1, 0, 0);
            this.rotationObject = new THREE.Group();
            this.rotationObject.add(this.light);
            this.updateRotation();
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
            scene.add(this.rotationObject);
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
            scene.remove(this.rotationObject);
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {}
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this.light.intensity = value;
            } else if (parameterName === 'elevation') {
              this.elevation = value;
              this.updateRotation();
            } else if (parameterName === 'rotation') {
              this.rotation = value;
              this.updateRotation();
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this.light.intensity;
            } else if (parameterName === 'elevation') {
              return this.elevation;
            } else if (parameterName === 'rotation') {
              return this.rotation;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'skyColor') {
              this.light.color = new THREE.Color(
                gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value)
              );
            }
            if (parameterName === 'groundColor') {
              this.light.groundColor = new THREE.Color(
                gdjs.PixiFiltersTools.rgbOrHexToHexNumber(value)
              );
            }
            if (parameterName === 'top') {
              this.top = value;
              this.updateRotation();
            }
          }
          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'skyColor') {
              this.light.color.setHex(value);
            }
            if (parameterName === 'groundColor') {
              this.light.groundColor.setHex(value);
            }
          }
          getColorParameter(parameterName: string): number {
            if (parameterName === 'skyColor') {
              return this.light.color.getHex();
            }
            if (parameterName === 'groundColor') {
              return this.light.groundColor.getHex();
            }
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {}
          updateRotation() {
            if (this.top === 'Z+') {
              // 0° is a light from the right of the screen.
              this.rotationObject.rotation.z = gdjs.toRad(this.rotation);
              this.rotationObject.rotation.y = -gdjs.toRad(this.elevation);
            } else {
              // 0° becomes a light from Z+.
              this.rotationObject.rotation.y = gdjs.toRad(this.rotation - 90);
              this.rotationObject.rotation.z = -gdjs.toRad(this.elevation);
            }
          }
        })();
      }
    })()
  );
}
