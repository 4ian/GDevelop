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
          private _isShadowFittedToCamera: boolean = false;
          private _shadowDistance: float = 1000;
          private _shadowCenter = new THREE.Vector3();
          private _lightOffset = new THREE.Vector3();
          private _origin = new THREE.Vector3();
          private _cameraFrustumCorner = new THREE.Vector3();
          private _shadowCameraRotation = new THREE.Matrix4();
          private _shadowCameraRight = new THREE.Vector3();
          private _shadowCameraUp = new THREE.Vector3();
          private _shadowCameraForward = new THREE.Vector3();

          private _isEnabled: boolean = false;
          private _light: THREE.DirectionalLight;
          private _shadowMapDirty = true;
          private _shadowCameraFrustumSize: float = 0;
          private _shadowCameraLightDistance: float = 0;
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

          private _updateShadowCamera(
            frustumSize: float,
            lightDistance: float,
            inverseWorldScale: float
          ): void {
            // The world scale can be changed in the editor.
            if (
              this._shadowCameraFrustumSize === frustumSize &&
              this._shadowCameraLightDistance === lightDistance &&
              this._shadowCameraInverseWorldScale === inverseWorldScale
            ) {
              return;
            }
            this._shadowCameraFrustumSize = frustumSize;
            this._shadowCameraLightDistance = lightDistance;
            this._shadowCameraInverseWorldScale = inverseWorldScale;
            const halfFrustumSize = (frustumSize / 2) * inverseWorldScale;

            this._light.shadow.camera.near = 1 * inverseWorldScale;
            this._light.shadow.camera.far =
              (lightDistance + 10000) * inverseWorldScale;
            this._light.shadow.camera.right = halfFrustumSize;
            this._light.shadow.camera.left = -halfFrustumSize;
            this._light.shadow.camera.top = halfFrustumSize;
            this._light.shadow.camera.bottom = -halfFrustumSize;
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
            const threeCamera = layer.getRenderer().getThreeCamera();
            let frustumSize = this._frustumSize;
            let lightDistance = this._distanceFromCamera;
            if (this._isShadowFittedToCamera && threeCamera) {
              const radius = this._fitShadowToCamera(
                threeCamera,
                inverseWorldScale
              );
              // Leave a texel on each side for the snapping to texels.
              frustumSize =
                (2 * radius * this._shadowMapSize) / (this._shadowMapSize - 2);
              // Objects between the light and the visible area must cast
              // shadows too.
              lightDistance = this._distanceFromCamera + radius;
            } else {
              // Contrary to cameras, lights are within the scene so they
              // already take world scale into account.
              this._shadowCenter.set(
                layer.getCameraX(),
                layer.getCameraY(),
                layer.getCameraZ(layer.getInitialCamera3DFieldOfView())
              );
            }
            this._updateShadowCamera(
              frustumSize,
              lightDistance,
              inverseWorldScale
            );
            this._updateLightOffset(lightDistance);
            this._snapShadowCenterToShadowMapTexels(frustumSize);
            this._light.target.position.copy(this._shadowCenter);
            this._light.position
              .copy(this._shadowCenter)
              .add(this._lightOffset);
          }
          /**
           * Center the shadow on the part of the camera frustum closer than
           * the shadow distance, so that the shadow map only covers what can
           * be seen.
           *
           * The shadow covers the bounding sphere of this part of the frustum
           * rather than its bounding box: the sphere size doesn't change when
           * the camera turns, so the shadow map texels keep the same size and
           * the edges of shadows don't flicker.
           *
           * @returns The radius of the sphere, in the scene coordinates.
           */
          private _fitShadowToCamera(
            threeCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
            inverseWorldScale: float
          ): float {
            // The frustum is symmetric, so a corner of the near and far planes
            // gives the distance of every corner to the view axis.
            const near = threeCamera.near;
            const far = threeCamera.far;
            const nearCornerDistanceToAxis = this._cameraFrustumCorner
              .set(1, 1, -1)
              .applyMatrix4(threeCamera.projectionMatrixInverse)
              .setZ(0)
              .length();
            const farCornerDistanceToAxis = this._cameraFrustumCorner
              .set(1, 1, 1)
              .applyMatrix4(threeCamera.projectionMatrixInverse)
              .setZ(0)
              .length();
            const shadowFar = Math.max(
              near,
              Math.min(far, this._shadowDistance * inverseWorldScale)
            );
            const shadowFarCornerDistanceToAxis =
              far > near
                ? nearCornerDistanceToAxis +
                  ((farCornerDistanceToAxis - nearCornerDistanceToAxis) *
                    (shadowFar - near)) /
                    (far - near)
                : farCornerDistanceToAxis;

            // The smallest sphere has its center on the view axis, at the same
            // distance of the near and far corners, unless it's farther than
            // the far corners.
            const centerDepth =
              shadowFar > near
                ? gdjs.evtTools.common.clamp(
                    (shadowFar * shadowFar +
                      shadowFarCornerDistanceToAxis *
                        shadowFarCornerDistanceToAxis -
                      near * near -
                      nearCornerDistanceToAxis * nearCornerDistanceToAxis) /
                      (2 * (shadowFar - near)),
                    near,
                    shadowFar
                  )
                : near;
            const radius = Math.max(
              Math.hypot(centerDepth - near, nearCornerDistanceToAxis),
              Math.hypot(shadowFar - centerDepth, shadowFarCornerDistanceToAxis)
            );

            // The camera is not in the scene: convert the center to the scene
            // coordinates (scaled by the world scale and mirrored on Y).
            threeCamera.updateMatrixWorld();
            this._shadowCenter
              .set(0, 0, -centerDepth)
              .applyMatrix4(threeCamera.matrixWorld);
            this._shadowCenter.set(
              this._shadowCenter.x / inverseWorldScale,
              -this._shadowCenter.y / inverseWorldScale,
              this._shadowCenter.z / inverseWorldScale
            );
            return radius / inverseWorldScale;
          }
          private _updateLightOffset(lightDistance: float): void {
            if (this._top === 'Y-') {
              this._lightOffset.set(
                lightDistance *
                  Math.cos(gdjs.toRad(-this._rotation + 90)) *
                  Math.cos(gdjs.toRad(this._elevation)),
                -lightDistance * Math.sin(gdjs.toRad(this._elevation)),
                lightDistance *
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
                lightDistance *
                  Math.cos(gdjs.toRad(this._rotation)) *
                  Math.cos(gdjs.toRad(this._elevation)),
                lightDistance *
                  Math.sin(gdjs.toRad(this._rotation)) *
                  Math.cos(gdjs.toRad(this._elevation)),
                lightDistance * Math.sin(gdjs.toRad(this._elevation))
              );
              this._light.shadow.camera.up.copy(THREE.Object3D.DEFAULT_UP);
            }
          }
          /**
           * Move the shadow center by less than a texel so that the shadow map
           * texels stay at the same place in the world when the camera moves.
           * Otherwise, the edges of shadows flicker as they are rasterized
           * differently on each frame.
           */
          private _snapShadowCenterToShadowMapTexels(frustumSize: float): void {
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

            const texelSize = frustumSize / this._shadowMapSize;
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
            } else if (parameterName === 'frustumSize') {
              this._frustumSize = value;
            } else if (parameterName === 'shadowDistance') {
              this._shadowDistance = value;
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
            } else if (parameterName === 'shadowDistance') {
              return this._shadowDistance;
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
            } else if (parameterName === 'isShadowFittedToCamera') {
              this._isShadowFittedToCamera = value;
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
