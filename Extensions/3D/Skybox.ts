namespace gdjs {
  interface SkyboxFilterNetworkSyncData {
    ei?: number;
    bi?: number;
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

          constructor() {
            this._cubeTexture = target
              .getRuntimeScene()
              .getGame()
              .getImageManager()
              .getThreeCubeTexture(
                effectData.stringParameters.rightFaceResourceName,
                effectData.stringParameters.leftFaceResourceName,
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
            return true;
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
          updateStringParameter(parameterName: string, value: string): void {}
          updateColorParameter(parameterName: string, value: number): void {}
          getColorParameter(parameterName: string): number {
            return 0;
          }
          updateBooleanParameter(parameterName: string, value: boolean): void {}
          getNetworkSyncData(): SkyboxFilterNetworkSyncData {
            return {
              ei: this._environmentIntensity,
              bi: this._backgroundIntensity,
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
          }
        })();
      }
    })()
  );
}
