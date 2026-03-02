namespace gdjs {
  interface SkyboxFilterNetworkSyncData {
    i: number;
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
          _pmremGenerator: THREE.PMREMGenerator | null = null;
          _pmremRenderTarget: THREE.WebGLRenderTarget | null = null;
          _oldBackground:
            | THREE.Texture
            | THREE.Color
            | null = null;
          _oldEnvironment: THREE.Texture | null = null;
          _oldEnvironmentIntensity: number | null = null;
          _environmentIntensity: number;
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
            this._environmentIntensity = Math.max(
              0,
              effectData.doubleParameters.environmentIntensity || 1
            );
          }

          private _getScene(target: EffectsTarget): THREE.Scene | null {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            return scene || null;
          }

          private _getThreeRenderer(
            target: EffectsTarget
          ): THREE.WebGLRenderer | null {
            if (!(target instanceof gdjs.Layer)) {
              return null;
            }
            return target
              .getRuntimeScene()
              .getGame()
              .getRenderer()
              .getThreeRenderer();
          }

          private _disposePmremResources(): void {
            if (this._pmremRenderTarget) {
              this._pmremRenderTarget.dispose();
              this._pmremRenderTarget = null;
            }
            if (this._pmremGenerator) {
              this._pmremGenerator.dispose();
              this._pmremGenerator = null;
            }
          }

          private _buildEnvironmentTexture(target: EffectsTarget): THREE.Texture {
            const renderer = this._getThreeRenderer(target);
            if (!renderer) {
              return this._cubeTexture;
            }
            if (!this._pmremGenerator) {
              this._pmremGenerator = new THREE.PMREMGenerator(renderer);
            }
            if (this._pmremRenderTarget) {
              this._pmremRenderTarget.dispose();
              this._pmremRenderTarget = null;
            }
            this._pmremRenderTarget = this._pmremGenerator.fromCubemap(
              this._cubeTexture
            );
            return this._pmremRenderTarget.texture;
          }

          private _applyEnvironmentIntensity(scene: THREE.Scene): void {
            const sceneWithEnvironmentIntensity = scene as THREE.Scene & {
              environmentIntensity?: number;
            };
            if (
              typeof sceneWithEnvironmentIntensity.environmentIntensity ===
              'number'
            ) {
              sceneWithEnvironmentIntensity.environmentIntensity = Math.max(
                0,
                this._environmentIntensity
              );
            }
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
            const scene = this._getScene(target);
            if (!scene) {
              return false;
            }
            this._oldBackground = scene.background;
            this._oldEnvironment = scene.environment;
            const sceneWithEnvironmentIntensity = scene as THREE.Scene & {
              environmentIntensity?: number;
            };
            this._oldEnvironmentIntensity =
              typeof sceneWithEnvironmentIntensity.environmentIntensity ===
              'number'
                ? sceneWithEnvironmentIntensity.environmentIntensity
                : null;

            scene.background = this._cubeTexture;
            scene.environment = this._buildEnvironmentTexture(target);
            this._applyEnvironmentIntensity(scene);
            this._isEnabled = true;
            return true;
          }
          removeEffect(target: EffectsTarget): boolean {
            const scene = this._getScene(target);
            if (!scene) {
              return false;
            }
            scene.background = this._oldBackground;
            scene.environment = this._oldEnvironment;
            if (this._oldEnvironmentIntensity !== null) {
              const sceneWithEnvironmentIntensity = scene as THREE.Scene & {
                environmentIntensity?: number;
              };
              if (
                typeof sceneWithEnvironmentIntensity.environmentIntensity ===
                'number'
              ) {
                sceneWithEnvironmentIntensity.environmentIntensity =
                  this._oldEnvironmentIntensity;
              }
            }
            this._disposePmremResources();
            this._isEnabled = false;
            return true;
          }
          updatePreRender(target: gdjs.EffectsTarget): any {
            if (!this._isEnabled) {
              return;
            }
            const scene = this._getScene(target);
            if (!scene) {
              return;
            }
            this._applyEnvironmentIntensity(scene);
          }
          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'environmentIntensity') {
              this._environmentIntensity = Math.max(0, value);
            }
          }
          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'environmentIntensity') {
              return this._environmentIntensity;
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
              i: this._environmentIntensity,
            };
          }
          updateFromNetworkSyncData(
            syncData: SkyboxFilterNetworkSyncData
          ): void {
            this._environmentIntensity = Math.max(0, syncData.i);
          }
        })();
      }
    })()
  );
}
