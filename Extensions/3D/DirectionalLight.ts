namespace gdjs {
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
          private _light: THREE.DirectionalLight;
          private _isEnabled: boolean = false;
          private _top: string = 'Y-';
          private _elevation: float = 45;
          private _rotation: float = 0;

          private _shadowMapDirty = true;
          private _shadowMapSize: float = 1024;

          private _shadowCameraDirty = true;
          private _distanceFromCamera: float = 1500;
          private _frustumSize: float = 4000;
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

          private _updateShadowCamera(): void {
            if (!this._shadowCameraDirty) {
              return;
            }
            this._shadowCameraDirty = false;

            this._light.shadow.camera.near = 1;
            this._light.shadow.camera.far = this._distanceFromCamera + 10000;
            this._light.shadow.camera.right = this._frustumSize / 2;
            this._light.shadow.camera.left = -this._frustumSize / 2;
            this._light.shadow.camera.top = this._frustumSize / 2;
            this._light.shadow.camera.bottom = -this._frustumSize / 2;
          }

          private _updateShadowMapSize(): void {
            if (!this._shadowMapDirty) {
              return;
            }
            this._shadowMapDirty = false;

            // Avoid shadow acne due to depth buffer precision. We choose a value
            // small enough to avoid "peter panning" but not too small to avoid
            // shadow acne on low/medium quality shadow maps.
            // If needed, this could become a parameter of the effect.
            this._light.shadow.bias =
              this._shadowMapSize < 1024
                ? -0.002
                : this._shadowMapSize < 2048
                  ? -0.001
                  : -0.0008;

            this._light.shadow.mapSize.set(
              this._shadowMapSize,
              this._shadowMapSize
            );

            // Force the recreation of the shadow map texture:
            this._light.shadow.map?.dispose();
            this._light.shadow.map = null;
            this._light.shadow.needsUpdate = true;
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
            this._updateShadowCamera();
            this._updateShadowMapSize();

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
                  Math.cos(gdjs.toRad(this._rotation + 90)) *
                  Math.cos(gdjs.toRad(this._elevation));
              const posLightY =
                roundedY -
                this._distanceFromCamera *
                  Math.sin(gdjs.toRad(this._elevation));
              const posLightZ =
                roundedZ +
                this._distanceFromCamera *
                  Math.sin(gdjs.toRad(this._rotation + 90)) *
                  Math.cos(gdjs.toRad(this._elevation));
              this._light.position.set(posLightX, posLightY, posLightZ);
              this._light.target.position.set(roundedX, roundedY, roundedZ);
            } else {
              const posLightX =
                roundedX +
                this._distanceFromCamera *
                  Math.cos(gdjs.toRad(this._rotation + 90)) *
                  Math.cos(gdjs.toRad(this._elevation));
              const posLightY =
                roundedY +
                this._distanceFromCamera *
                  Math.sin(gdjs.toRad(this._rotation + 90)) *
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
            } else if (parameterName === 'frustumSize') {
              this._frustumSize = value;
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
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'color') {
              this._light.color = new THREE.Color(
                gdjs.rgbOrHexStringToNumber(value)
              );
            }
            if (parameterName === 'shadowQuality') {
              if (value === 'low' && this._shadowMapSize !== 512) {
                this._shadowMapSize = 512;
                this._shadowMapDirty = true;
              }
              if (value === 'medium' && this._shadowMapSize !== 1024) {
                this._shadowMapSize = 1024;
                this._shadowMapDirty = true;
              }
              if (value === 'high' && this._shadowMapSize !== 2048) {
                this._shadowMapSize = 2048;
                this._shadowMapDirty = true;
              }
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
              this._light.castShadow = value;
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
