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
          private _top: string = 'Z+';
          private _elevation: float = 45;
          private _rotation: float = 0;
          private _shadowMapSize: float = 1024;
          private _minimumShadowBias: float = 0;
          private _distanceFromCamera: float = 1500;
          private _frustumSize: float = 4000;
          private _shadowCenter = new THREE.Vector3();
          private _lightOffset = new THREE.Vector3();
          private _origin = new THREE.Vector3();
          private _shadowCameraRotation = new THREE.Matrix4();
          private _shadowCameraRight = new THREE.Vector3();
          private _shadowCameraUp = new THREE.Vector3();
          private _shadowCameraForward = new THREE.Vector3();

          private _isEnabled: boolean = false;
          private _light: THREE.DirectionalLight;
          private _shadowMapDirty = true;
          private _shadowCameraDirty = true;
          private _shadowCameraInverseWorldScale: float = 0;
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

          private _updateShadowCamera(scene: gdjs.RuntimeScene): void {
            const inverseWorldScale = scene.getRenderer3DInverseWorldScale();
            // The world scale can be changed in the editor.
            if (
              !this._shadowCameraDirty &&
              this._shadowCameraInverseWorldScale === inverseWorldScale
            ) {
              return;
            }
            this._shadowCameraDirty = false;
            this._shadowCameraInverseWorldScale = inverseWorldScale;
            const frustumSize = this._frustumSize * inverseWorldScale;

            this._light.shadow.camera.near = 1 * inverseWorldScale;
            this._light.shadow.camera.far =
              (this._distanceFromCamera + 10000) * inverseWorldScale;
            this._light.shadow.camera.right = frustumSize / 2;
            this._light.shadow.camera.left = -frustumSize / 2;
            this._light.shadow.camera.top = frustumSize / 2;
            this._light.shadow.camera.bottom = -frustumSize / 2;
            // Three.js only updates it when the shadow map is created.
            this._light.shadow.camera.updateProjectionMatrix();
          }

          private _updateShadowMapSize(): void {
            if (!this._shadowMapDirty) {
              return;
            }
            this._shadowMapDirty = false;

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
            const scene = target.getRuntimeScene().getScene();
            const inverseWorldScale = scene.getRenderer3DInverseWorldScale();

            // Apply any update to the camera or shadow map size.
            this._updateShadowCamera(scene);
            this._updateShadowMapSize();

            // Avoid shadow acne due to depth buffer precision.
            const biasMultiplier =
              this._shadowMapSize < 1024
                ? 2
                : this._shadowMapSize < 2048
                  ? 1.25
                  : 1;
            this._light.shadow.bias =
              -this._minimumShadowBias * biasMultiplier * inverseWorldScale;

            // Apply update to the light position and its target.
            // By doing this, the shadows are "following" the GDevelop camera.
            if (!target.getRuntimeLayer) {
              return;
            }
            const layer = target.getRuntimeLayer();
            // Contrary to cameras, lights are within the scene so they already
            // take world scale into account.
            this._shadowCenter.set(
              layer.getCameraX(),
              layer.getCameraY(),
              layer.getCameraZ(layer.getInitialCamera3DFieldOfView())
            );
            if (this._top === 'Y-') {
              this._lightOffset.set(
                this._distanceFromCamera *
                  Math.cos(gdjs.toRad(-this._rotation + 90)) *
                  Math.cos(gdjs.toRad(this._elevation)),
                -this._distanceFromCamera *
                  Math.sin(gdjs.toRad(this._elevation)),
                this._distanceFromCamera *
                  Math.sin(gdjs.toRad(-this._rotation + 90)) *
                  Math.cos(gdjs.toRad(this._elevation))
              );
              // The default up vector (Y+ in world coordinates) is parallel to
              // the light when the elevation is 90°, which makes the shadow
              // camera orientation unstable. This horizontal axis is always
              // orthogonal to the light and gives the same shadow frustum,
              // turned by 90°.
              this._light.shadow.camera.up.set(
                Math.cos(gdjs.toRad(this._rotation)),
                0,
                -Math.sin(gdjs.toRad(this._rotation))
              );
            } else {
              this._lightOffset.set(
                this._distanceFromCamera *
                  Math.cos(gdjs.toRad(this._rotation)) *
                  Math.cos(gdjs.toRad(this._elevation)),
                this._distanceFromCamera *
                  Math.sin(gdjs.toRad(this._rotation)) *
                  Math.cos(gdjs.toRad(this._elevation)),
                this._distanceFromCamera * Math.sin(gdjs.toRad(this._elevation))
              );
              this._light.shadow.camera.up.copy(THREE.Object3D.DEFAULT_UP);
            }
            this._snapShadowCenterToShadowMapTexels();
            this._light.target.position.copy(this._shadowCenter);
            this._light.position
              .copy(this._shadowCenter)
              .add(this._lightOffset);
          }
          /**
           * Move the shadow center by less than a texel so that the shadow map
           * texels stay at the same place in the world when the camera moves.
           * Otherwise, the edges of shadows flicker as they are rasterized
           * differently on each frame.
           */
          private _snapShadowCenterToShadowMapTexels(): void {
            // The shadow camera axes are computed like Three.js does in
            // `LightShadow.updateMatrices`, in world coordinates, where the Y
            // axis is the opposite of the scene one (the scene is mirrored on Y).
            this._shadowCameraForward.set(
              this._lightOffset.x,
              -this._lightOffset.y,
              this._lightOffset.z
            );
            this._shadowCameraRotation.lookAt(
              this._shadowCameraForward,
              this._origin,
              this._light.shadow.camera.up
            );
            this._shadowCameraRotation.extractBasis(
              this._shadowCameraRight,
              this._shadowCameraUp,
              this._shadowCameraForward
            );
            this._shadowCameraRight.y = -this._shadowCameraRight.y;
            this._shadowCameraUp.y = -this._shadowCameraUp.y;

            const texelSize = this._frustumSize / this._shadowMapSize;
            const right = this._shadowCenter.dot(this._shadowCameraRight);
            const up = this._shadowCenter.dot(this._shadowCameraUp);
            this._shadowCenter
              .addScaledVector(
                this._shadowCameraRight,
                Math.round(right / texelSize) * texelSize - right
              )
              .addScaledVector(
                this._shadowCameraUp,
                Math.round(up / texelSize) * texelSize - up
              );
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'intensity') {
              this._light.intensity = value * Math.PI;
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
            } else if (parameterName === 'minimumShadowBias') {
              this._minimumShadowBias = value;
            } else if (parameterName === 'shadowIntensity') {
              this._light.shadow.intensity = gdjs.evtTools.common.clamp(
                value,
                0,
                1
              );
            } else if (parameterName === 'shadowSoftness') {
              this._light.shadow.radius = Math.max(0, value);
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'intensity') {
              return this._light.intensity / Math.PI;
            } else if (parameterName === 'elevation') {
              return this._elevation;
            } else if (parameterName === 'rotation') {
              return this._rotation;
            } else if (parameterName === 'distanceFromCamera') {
              return this._distanceFromCamera;
            } else if (parameterName === 'frustumSize') {
              return this._frustumSize;
            } else if (parameterName === 'minimumShadowBias') {
              return this._minimumShadowBias;
            } else if (parameterName === 'shadowIntensity') {
              return this._light.shadow.intensity;
            } else if (parameterName === 'shadowSoftness') {
              return this._light.shadow.radius;
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
