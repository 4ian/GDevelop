namespace gdjs {
  interface HemisphereLightFilterNetworkSyncData {
    i?: number;
    intensity?: number;

    sc?: number;
    skyColor?: number;

    gc?: number;
    groundColor?: number;

    e?: number;
    elevation?: number;

    r?: number;
    rotation?: number;

    t?: string;
    top?: string;
  }
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
          _top: string = 'Z+';
          _elevation: float = 90;
          _rotation: float = 0;

          _isEnabled: boolean = false;
          _light: THREE.HemisphereLight;

          constructor() {
            this._light = new THREE.HemisphereLight();
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
            scene.add(this._light);
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
            scene.remove(this._light);
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {}
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this._light.intensity = value;
            } else if (parameterName === 'elevation') {
              this._elevation = value;
              this.updateRotation();
            } else if (parameterName === 'rotation') {
              this._rotation = value;
              this.updateRotation();
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._light.intensity;
            } else if (parameterName === 'elevation') {
              return this._elevation;
            } else if (parameterName === 'rotation') {
              return this._rotation;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'skyColor') {
              this._light.color = new THREE.Color(
                gdjs.rgbOrHexStringToNumber(value)
              );
            }
            if (parameterName === 'groundColor') {
              this._light.groundColor = new THREE.Color(
                gdjs.rgbOrHexStringToNumber(value)
              );
            }
            if (parameterName === 'top') {
              this._top = value;
              this.updateRotation();
            }
          }
          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'skyColor') {
              this._light.color.setHex(value);
            }
            if (parameterName === 'groundColor') {
              this._light.groundColor.setHex(value);
            }
          }
          getColorParameter(parameterName: string): number {
            if (parameterName === 'skyColor') {
              return this._light.color.getHex();
            }
            if (parameterName === 'groundColor') {
              return this._light.groundColor.getHex();
            }
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {}
          updateRotation() {
            if (this._top === 'Y-') {
              // `rotation` at 0° becomes a light from Z+.
              this._light.position.set(
                Math.cos(gdjs.toRad(-this._rotation + 90)) *
                  Math.cos(gdjs.toRad(this._elevation)),
                -Math.sin(gdjs.toRad(this._elevation)),
                Math.sin(gdjs.toRad(-this._rotation + 90)) *
                  Math.cos(gdjs.toRad(this._elevation))
              );
            } else {
              // `rotation` at 0° is a light from the right of the screen.
              this._light.position.set(
                Math.cos(gdjs.toRad(this._rotation)) *
                  Math.cos(gdjs.toRad(this._elevation)),
                Math.sin(gdjs.toRad(this._rotation)) *
                  Math.cos(gdjs.toRad(this._elevation)),
                Math.sin(gdjs.toRad(this._elevation))
              );
            }
          }
          getNetworkSyncData(
            syncOptions: GetNetworkSyncDataOptions
          ): HemisphereLightFilterNetworkSyncData {
            const getKey = (abbrev: string, full: string) =>
              syncOptions.useFullNames ? full : abbrev;
            return {
              [getKey('i', 'intensity')]: this._light.intensity,
              [getKey('sc', 'skyColor')]: this._light.color.getHex(),
              [getKey('gc', 'groundColor')]: this._light.groundColor.getHex(),
              [getKey('e', 'elevation')]: this._elevation,
              [getKey('r', 'rotation')]: this._rotation,
              [getKey('t', 'top')]: this._top,
            } as HemisphereLightFilterNetworkSyncData;
          }
          updateFromNetworkSyncData(
            syncData: HemisphereLightFilterNetworkSyncData
          ): void {
            if (syncData.i !== undefined) this._light.intensity = syncData.i;
            if (syncData.sc !== undefined)
              this._light.color.setHex(syncData.sc);
            if (syncData.gc !== undefined)
              this._light.groundColor.setHex(syncData.gc);
            if (syncData.e !== undefined) this._elevation = syncData.e;
            if (syncData.r !== undefined) this._rotation = syncData.r;
            if (syncData.t !== undefined) this._top = syncData.t;
            this.updateRotation();
          }
        })();
      }
    })()
  );
}
