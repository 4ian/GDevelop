namespace gdjs {
  interface SkyboxFilterNetworkSyncData {
    ei?: number;
    bi?: number;
    t?: string;
  }
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
          _isEnabled: boolean = false;
          _environmentIntensity: float = 1;
          _backgroundIntensity: float = 1;
          // Skyboxes made before `top` existed have no value for it.
          _top: string = effectData.stringParameters.top || 'Legacy';

          constructor() {
            this._cubeTexture = this._getCubeTexture();
          }

          private _isLegacy(): boolean {
            return this._top !== 'Z+' && this._top !== 'Y-';
          }
          private _getCubeTexture(): THREE.CubeTexture {
            // Legacy faces follow the axes of the scene: they need the swap on
            // X done by `getThreeCubeTexture`, which standard faces must not get.
            const isLegacy = this._isLegacy();
            return target
              .getRuntimeScene()
              .getGame()
              .getImageManager()
              .getThreeCubeTexture(
                isLegacy
                  ? effectData.stringParameters.rightFaceResourceName
                  : effectData.stringParameters.leftFaceResourceName,
                isLegacy
                  ? effectData.stringParameters.leftFaceResourceName
                  : effectData.stringParameters.rightFaceResourceName,
                effectData.stringParameters.topFaceResourceName,
                effectData.stringParameters.bottomFaceResourceName,
                effectData.stringParameters.frontFaceResourceName,
                effectData.stringParameters.backFaceResourceName
              );
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
            // TODO Add a background stack in LayerPixiRenderer to allow
            // filters to stack them.
            this._oldBackground = scene.background;
            scene.background = this._cubeTexture;
            if (!scene.environment) {
              scene.environment = this._cubeTexture;
            }
            this._isEnabled = true;
            this._updateEnvironmentIntensity();
            this._updateBackgroundIntensity();
            this._updateRotation();
            return true;
          }
          private _setTop(top: string): void {
            if (this._top === top) {
              return;
            }
            const wasLegacy = this._isLegacy();
            this._top = top;
            if (wasLegacy !== this._isLegacy()) {
              const oldCubeTexture = this._cubeTexture;
              this._cubeTexture = this._getCubeTexture();
              const scene = target.get3DRendererObject() as
                | THREE.Scene
                | null
                | undefined;
              if (scene && this._isEnabled) {
                scene.background = this._cubeTexture;
                if (scene.environment === oldCubeTexture) {
                  scene.environment = this._cubeTexture;
                }
              }
            }
            this._updateRotation();
          }
          private _updateRotation(): void {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (!scene || !this._isEnabled) {
              return;
            }
            if (this._isLegacy()) {
              scene.backgroundRotation.set(0, 0, 0);
            } else {
              // Standard faces have their top on Y+ of Three.js (Y- of the
              // scene) and their front on Z+: they are turned to have the
              // front where a camera with no rotation looks at.
              scene.backgroundRotation.set(
                this._top === 'Y-' ? 0 : Math.PI / 2,
                Math.PI,
                0
              );
            }
            // Another effect may have set the environment of the scene.
            if (scene.environment === this._cubeTexture) {
              scene.environmentRotation.copy(scene.backgroundRotation);
            }
          }
          private _updateEnvironmentIntensity(): void {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            // Another effect may have set the environment of the scene.
            if (!scene || scene.environment !== this._cubeTexture) {
              return;
            }
            scene.environmentIntensity = this._environmentIntensity;
          }
          private _updateBackgroundIntensity(): void {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (!scene || !this._isEnabled) {
              return;
            }
            scene.backgroundIntensity = this._backgroundIntensity;
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
            scene.environmentIntensity = 1;
            scene.backgroundIntensity = 1;
            scene.backgroundRotation.set(0, 0, 0);
            scene.environmentRotation.set(0, 0, 0);
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {}
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'environmentIntensity') {
              this._environmentIntensity = value;
              this._updateEnvironmentIntensity();
            } else if (parameterName === 'backgroundIntensity') {
              this._backgroundIntensity = value;
              this._updateBackgroundIntensity();
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'environmentIntensity') {
              return this._environmentIntensity;
            } else if (parameterName === 'backgroundIntensity') {
              return this._backgroundIntensity;
            }
            return 0;
          }
          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'top') {
              this._setTop(value);
            }
          }
          updateColorParameter(parameterName: string, value: number): void {}
          getColorParameter(parameterName: string): number {
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {}
          getNetworkSyncData(): SkyboxFilterNetworkSyncData {
            return {
              ei: this._environmentIntensity,
              bi: this._backgroundIntensity,
              t: this._top,
            };
          }
          updateFromNetworkSyncData(
            syncData: SkyboxFilterNetworkSyncData
          ): void {
            if (syncData.ei !== undefined) {
              this._environmentIntensity = syncData.ei;
              this._updateEnvironmentIntensity();
            }
            if (syncData.bi !== undefined) {
              this._backgroundIntensity = syncData.bi;
              this._updateBackgroundIntensity();
            }
            if (syncData.t !== undefined) {
              this._setTop(syncData.t);
            }
          }
        })();
      }
    })()
  );
}
