namespace gdjs {
  const getShadowManager = (): any => {
    const scene3dAny = (gdjs as any).scene3d;
    if (!scene3dAny || !scene3dAny.shadows) {
      return null;
    }
    return scene3dAny.shadows;
  };

  interface DirectionalLightFilterNetworkSyncData {
    i: number;
    c: number;
    e: number;
    r: number;
    t: string;
  }
  const shadowHelper = false;
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::DirectionalLight',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          private _top: string = 'Z+';
          private _elevation: float = 45;
          private _rotation: float = 0;
          private _isCastingShadow: boolean = false;
          private _distanceFromCamera: float = 1500;
          private _frustumSize: float = 4000;
          private _directionalLightBaseBias: float = -0.0002;
          private _directionalLightNormalBias: float = 0.02;

          private _isEnabled: boolean = false;
          private _light: THREE.DirectionalLight;
          private _shadowCameraDirty = true;
          private _shadowCameraHelper: THREE.CameraHelper | null;

          constructor() {
            this._light = new THREE.DirectionalLight();

            if (shadowHelper) {
              this._shadowCameraHelper = new THREE.CameraHelper(
                this._light.shadow.camera
              );
            } else {
              this._shadowCameraHelper = null;
            }

            this._light.shadow.camera.updateProjectionMatrix();
          }

          private _applyShadowSettings(target: EffectsTarget): void {
            const shadowManager = getShadowManager();
            const runtimeLayer =
              target.getRuntimeLayer && target.getRuntimeLayer
                ? target.getRuntimeLayer()
                : null;
            if (
              shadowManager &&
              typeof shadowManager.applyDirectionalLightShadow === 'function'
            ) {
              shadowManager.applyDirectionalLightShadow(
                runtimeLayer,
                this._light,
                {
                  castShadow: this._isCastingShadow,
                  frustumSize: this._frustumSize,
                  distanceFromCamera: this._distanceFromCamera,
                  forceUpdate: this._shadowCameraDirty,
                  baseBias: this._directionalLightBaseBias,
                  normalBias: this._directionalLightNormalBias,
                }
              );
              this._shadowCameraDirty = false;
              return;
            }
            this._light.castShadow = false;
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
            scene.add(this._light.target);
            if (this._shadowCameraHelper) {
              scene.add(this._shadowCameraHelper);
            }

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
            scene.remove(this._light.target);
            if (this._shadowCameraHelper) {
              scene.remove(this._shadowCameraHelper);
            }
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled) {
              return;
            }
            this._applyShadowSettings(target);

            // Apply update to the light position and its target.
            // By doing this, the shadows are "following" the GDevelop camera.
            if (!target.getRuntimeLayer) {
              return;
            }
            const layer = target.getRuntimeLayer();
            const x = layer.getCameraX();
            const y = layer.getCameraY();
            const z = layer.getCameraZ(layer.getInitialCamera3DFieldOfView());

            const roundedX = Math.floor(x / 100) * 100;
            const roundedY = Math.floor(y / 100) * 100;
            const roundedZ = Math.floor(z / 100) * 100;
            if (this._top === 'Y-') {
              const posLightX =
                roundedX +
                this._distanceFromCamera *
                  Math.cos(gdjs.toRad(-this._rotation + 90)) *
                  Math.cos(gdjs.toRad(this._elevation));
              const posLightY =
                roundedY -
                this._distanceFromCamera *
                  Math.sin(gdjs.toRad(this._elevation));
              const posLightZ =
                roundedZ +
                this._distanceFromCamera *
                  Math.sin(gdjs.toRad(-this._rotation + 90)) *
                  Math.cos(gdjs.toRad(this._elevation));
              this._light.position.set(posLightX, posLightY, posLightZ);
              this._light.target.position.set(roundedX, roundedY, roundedZ);
            } else {
              const posLightX =
                roundedX +
                this._distanceFromCamera *
                  Math.cos(gdjs.toRad(this._rotation)) *
                  Math.cos(gdjs.toRad(this._elevation));
              const posLightY =
                roundedY +
                this._distanceFromCamera *
                  Math.sin(gdjs.toRad(this._rotation)) *
                  Math.cos(gdjs.toRad(this._elevation));
              const posLightZ =
                roundedZ +
                this._distanceFromCamera *
                  Math.sin(gdjs.toRad(this._elevation));

              this._light.position.set(posLightX, posLightY, posLightZ);
              this._light.target.position.set(roundedX, roundedY, roundedZ);
            }
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this._light.intensity = value;
            } else if (parameterName === 'elevation') {
              this._elevation = value;
            } else if (parameterName === 'rotation') {
              this._rotation = value;
            } else if (parameterName === 'distanceFromCamera') {
              this._distanceFromCamera = value;
              this._shadowCameraDirty = true;
            } else if (parameterName === 'frustumSize') {
              this._frustumSize = value;
              this._shadowCameraDirty = true;
            } else if (parameterName === 'directionalLightBaseBias') {
              this._directionalLightBaseBias = value;
            } else if (parameterName === 'directionalLightNormalBias') {
              this._directionalLightNormalBias = value;
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._light.intensity;
            } else if (parameterName === 'elevation') {
              return this._elevation;
            } else if (parameterName === 'rotation') {
              return this._rotation;
            } else if (parameterName === 'distanceFromCamera') {
              return this._distanceFromCamera;
            } else if (parameterName === 'frustumSize') {
              return this._frustumSize;
            } else if (parameterName === 'directionalLightBaseBias') {
              return this._directionalLightBaseBias;
            } else if (parameterName === 'directionalLightNormalBias') {
              return this._directionalLightNormalBias;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'color') {
              this._light.color = new THREE.Color(
                gdjs.rgbOrHexStringToNumber(value)
              );
            }
            if (parameterName === 'top') {
              this._top = value;
              this._shadowCameraDirty = true;
            }
          }
          updateColorParameter(parameterName: string, value: number): void {
            if (parameterName === 'color') {
              this._light.color.setHex(value);
            }
          }
          getColorParameter(parameterName: string): number {
            if (parameterName === 'color') {
              return this._light.color.getHex();
            }
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'isCastingShadow') {
              this._isCastingShadow = value;
              this._shadowCameraDirty = true;
            }
          }
          getNetworkSyncData(): DirectionalLightFilterNetworkSyncData {
            return {
              i: this._light.intensity,
              c: this._light.color.getHex(),
              e: this._elevation,
              r: this._rotation,
              t: this._top,
            };
          }
          updateFromNetworkSyncData(syncData: any): void {
            this._light.intensity = syncData.i;
            this._light.color.setHex(syncData.c);
            this._elevation = syncData.e;
            this._rotation = syncData.r;
            this._top = syncData.t;
          }
        })();
      }
    })()
  );
}
