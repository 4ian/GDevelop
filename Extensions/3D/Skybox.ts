namespace gdjs {
  interface SkyboxFilterNetworkSyncData {}
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::Skybox',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          _cubeTexture: THREE.CubeTexture;
          _oldBackground:
            | THREE.CubeTexture
            | THREE.Texture
            | THREE.Color
            | null = null;
          _oldBackgroundRotation: THREE.Euler | null = null;
          _oldEnvironmentRotation: THREE.Euler | null = null;
          _skyUp: THREE.Vector3;
          _cameraUp: THREE.Vector3;
          _cachedCameraUp: THREE.Vector3;
          _orientationQuat: THREE.Quaternion;
          _orientationEuler: THREE.Euler;
          _isEnabled: boolean = false;

          constructor() {
            this._cubeTexture = target
              .getRuntimeScene()
              .getGame()
              .getImageManager()
              .getThreeCubeTexture(
                // Match the common skybox template:
                // Front = X+, Back = X-, Right = Z+, Left = Z-, Up = Y+, Down = Y-
                effectData.stringParameters.rightFaceResourceName, // Z+ (right)
                effectData.stringParameters.leftFaceResourceName, // Z- (left)
                effectData.stringParameters.topFaceResourceName, // Y+ (up)
                effectData.stringParameters.bottomFaceResourceName, // Y- (down)
                effectData.stringParameters.frontFaceResourceName, // X+ (front)
                effectData.stringParameters.backFaceResourceName // X- (back)
              );
            this._skyUp = new THREE.Vector3(0, 1, 0);
            this._cameraUp = new THREE.Vector3(0, 1, 0);
            this._cachedCameraUp = new THREE.Vector3(0, 1, 0);
            this._orientationQuat = new THREE.Quaternion();
            this._orientationEuler = new THREE.Euler();
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
          _updateOrientation(target: EffectsTarget, scene: THREE.Scene) {
            const layer = target.getRuntimeLayer?.();
            const renderer = layer ? layer.getRenderer?.() : null;
            const camera =
              renderer && (renderer as any).getThreeCamera
                ? (renderer as any).getThreeCamera()
                : null;
            if (!camera) return;

            this._cameraUp.copy(camera.up);
            if (this._cameraUp.lengthSq() === 0) return;
            this._cameraUp.normalize();

            if (
              this._cameraUp.distanceToSquared(this._cachedCameraUp) < 1e-10
            ) {
              return;
            }
            this._cachedCameraUp.copy(this._cameraUp);

            this._orientationQuat.setFromUnitVectors(
              this._skyUp,
              this._cachedCameraUp
            );
            this._orientationEuler.setFromQuaternion(this._orientationQuat);
            scene.backgroundRotation.copy(this._orientationEuler);
            scene.environmentRotation.copy(this._orientationEuler);
          }

          applyEffect(target: EffectsTarget): boolean {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (!scene) {
              return false;
            }
            // TODO Add a background stack in LayerPixiRenderer to allow
            // filters to stack them.
            this._oldBackground = scene.background;
            this._oldBackgroundRotation = scene.backgroundRotation.clone();
            this._oldEnvironmentRotation = scene.environmentRotation.clone();
            scene.background = this._cubeTexture;
            if (!scene.environment) {
              scene.environment = this._cubeTexture;
            }
            this._updateOrientation(target, scene);
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
            scene.background = this._oldBackground;
            scene.environment = null;
            if (this._oldBackgroundRotation) {
              scene.backgroundRotation.copy(this._oldBackgroundRotation);
            }
            if (this._oldEnvironmentRotation) {
              scene.environmentRotation.copy(this._oldEnvironmentRotation);
            }
            this._oldBackgroundRotation = null;
            this._oldEnvironmentRotation = null;
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled) return;
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (!scene) return;
            this._updateOrientation(target, scene);
          }
          updateDoubleParameter(parameterName: string, value: number): void {}
          getDoubleParameter(parameterName: string): number {
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {}
          updateColorParameter(parameterName: string, value: number): void {}
          getColorParameter(parameterName: string): number {
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {}
          getNetworkSyncData(): SkyboxFilterNetworkSyncData {
            return {};
          }
          updateFromNetworkSyncData(
            syncData: SkyboxFilterNetworkSyncData
          ): void {}
        })();
      }
    })()
  );
}
