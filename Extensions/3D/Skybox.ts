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
          _isEnabled: boolean = false;

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
            // TODO Decide if scene.environment should be set.
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
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {}
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
