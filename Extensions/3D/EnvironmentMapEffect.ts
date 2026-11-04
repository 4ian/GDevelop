namespace gdjs {
  interface EnvironmentMapFilterNetworkSyncData {
    /** The environment light intensity. */
    ei?: number;
    /** The background brightness. */
    bi?: number;
    /** The rotation of the environment (in degrees). */
    r?: number;
    /** The source ('cube' or 'equirect'). */
    s?: string;
    /** Whether the images are shown as the background. */
    sb?: boolean;
    /** The image resources. */
    rs?: Array<string>;
  }

  /**
   * The "Environment map" effect lights a 3D scene with images (image based
   * lighting) and can show them as the background of the layer.
   *
   * The images are prefiltered with PMREM to get a smooth roughness on every
   * GPU (see https://threejs.org/docs/#api/en/materials/MeshStandardMaterial).
   */
  gdjs.PixiFiltersTools.registerFilterCreator(
    'Scene3D::EnvironmentMap',
    new (class implements gdjs.PixiFiltersTools.FilterCreator {
      makeFilter(
        target: EffectsTarget,
        effectData: EffectData
      ): gdjs.PixiFiltersTools.Filter {
        if (typeof THREE === 'undefined') {
          return new gdjs.PixiFiltersTools.EmptyFilter();
        }
        return new (class implements gdjs.PixiFiltersTools.Filter {
          // The settings of the effect.
          private _source: string = effectData.stringParameters.source || 'cube';
          private _resourceNames: Array<string> = [
            effectData.stringParameters.rightFaceResourceName || '',
            effectData.stringParameters.leftFaceResourceName || '',
            effectData.stringParameters.topFaceResourceName || '',
            effectData.stringParameters.bottomFaceResourceName || '',
            effectData.stringParameters.frontFaceResourceName || '',
            effectData.stringParameters.backFaceResourceName || '',
            effectData.stringParameters.equirectangularResourceName || '',
          ];
          private _environmentIntensity: float =
            effectData.doubleParameters.environmentIntensity !== undefined
              ? effectData.doubleParameters.environmentIntensity
              : 1;
          private _showBackground: boolean =
            effectData.booleanParameters.showBackground || false;
          private _backgroundIntensity: float =
            effectData.doubleParameters.backgroundIntensity !== undefined
              ? effectData.doubleParameters.backgroundIntensity
              : 1;
          private _rotation: float =
            effectData.doubleParameters.rotation || 0;

          // The state of the effect.
          private _isEnabled: boolean = false;
          /** The prefiltered texture applied to the scene (owned). */
          private _environmentTexture: THREE.Texture | null = null;
          /** The state of the scene before the effect was applied. */
          private _oldEnvironment: THREE.Texture | null = null;
          private _oldBackground:
            | THREE.CubeTexture
            | THREE.Texture
            | THREE.Color
            | null = null;

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
            this._oldEnvironment = scene.environment;
            this._oldBackground = scene.background;
            this._isEnabled = true;
            if (!this._environmentTexture) {
              this._rebuildEnvironmentTexture(target);
            }
            this._applyToScene(scene);
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
            scene.environment = this._oldEnvironment;
            scene.environmentIntensity = 1;
            scene.environmentRotation.set(0, 0, 0);
            scene.background = this._oldBackground;
            scene.backgroundIntensity = 1;
            scene.backgroundRotation.set(0, 0, 0);
            this._isEnabled = false;
            this._disposeEnvironmentTexture(target);
            return true;
          }

          private _applyToScene(scene: THREE.Scene): void {
            if (!this._environmentTexture) {
              return;
            }
            scene.environment = this._environmentTexture;
            scene.environmentIntensity = this._environmentIntensity;
            scene.environmentRotation.set(0, gdjs.toRad(this._rotation), 0);
            if (this._showBackground) {
              scene.background = this._environmentTexture;
              scene.backgroundIntensity = this._backgroundIntensity;
              scene.backgroundRotation.set(0, gdjs.toRad(this._rotation), 0);
            }
          }

          /**
           * Build the source texture of the environment (a cube texture or an
           * equirectangular one) and prefilter it with PMREM.
           */
          private _rebuildEnvironmentTexture(target: EffectsTarget): void {
            this._disposeEnvironmentTexture(target);
            const imageManager = target
              .getRuntimeScene()
              .getGame()
              .getImageManager();
            let sourceTexture: THREE.Texture | null = null;
            if (this._source === 'equirect') {
              const resourceName = this._resourceNames[6];
              if (!resourceName) {
                return;
              }
              sourceTexture = imageManager.getThreeTexture(resourceName, {
                isColorData: true,
              });
              sourceTexture.mapping = THREE.EquirectangularReflectionMapping;
            } else {
              const [
                rightResourceName,
                leftResourceName,
                topResourceName,
                bottomResourceName,
                frontResourceName,
                backResourceName,
              ] = this._resourceNames;
              if (
                !rightResourceName &&
                !leftResourceName &&
                !topResourceName &&
                !bottomResourceName &&
                !frontResourceName &&
                !backResourceName
              ) {
                return;
              }
              // The images for the X axis need to be swapped (see
              // `getThreeCubeTexture`).
              sourceTexture = imageManager.getThreeCubeTexture(
                leftResourceName,
                rightResourceName,
                topResourceName,
                bottomResourceName,
                frontResourceName,
                backResourceName
              );
            }
            this._environmentTexture = target
              .getRuntimeScene()
              .getGame()
              .getPBRMaterialManager()
              .prefilterEnvironmentTexture(sourceTexture);
          }

          private _disposeEnvironmentTexture(target: EffectsTarget): void {
            if (!this._environmentTexture) {
              return;
            }
            target
              .getRuntimeScene()
              .getGame()
              .getPBRMaterialManager()
              .disposeEnvironmentTexture(this._environmentTexture);
            this._environmentTexture = null;
          }

          updatePreRender(target: gdjs.EffectsTarget): any {}

          updateDoubleParameter(parameterName: string, value: number): void {
            if (parameterName === 'environmentIntensity') {
              this._environmentIntensity = value;
            } else if (parameterName === 'backgroundIntensity') {
              this._backgroundIntensity = value;
            } else if (parameterName === 'rotation') {
              this._rotation = value;
            } else {
              return;
            }
            this._applyToCurrentScene(target);
          }

          getDoubleParameter(parameterName: string): number {
            if (parameterName === 'environmentIntensity') {
              return this._environmentIntensity;
            }
            if (parameterName === 'backgroundIntensity') {
              return this._backgroundIntensity;
            }
            if (parameterName === 'rotation') {
              return this._rotation;
            }
            return 0;
          }

          updateStringParameter(parameterName: string, value: string): void {
            if (parameterName === 'source') {
              this._source = value;
            } else if (parameterName === 'rightFaceResourceName') {
              this._resourceNames[0] = value;
            } else if (parameterName === 'leftFaceResourceName') {
              this._resourceNames[1] = value;
            } else if (parameterName === 'topFaceResourceName') {
              this._resourceNames[2] = value;
            } else if (parameterName === 'bottomFaceResourceName') {
              this._resourceNames[3] = value;
            } else if (parameterName === 'frontFaceResourceName') {
              this._resourceNames[4] = value;
            } else if (parameterName === 'backFaceResourceName') {
              this._resourceNames[5] = value;
            } else if (parameterName === 'equirectangularResourceName') {
              this._resourceNames[6] = value;
            } else {
              return;
            }
            this._rebuildEnvironmentTextureForCurrentScene(target);
          }

          updateColorParameter(parameterName: string, value: number): void {}
          getColorParameter(parameterName: string): number {
            return 0;
          }

          updateBooleanParameter(parameterName: string, value: boolean): void {
            if (parameterName === 'showBackground') {
              this._showBackground = value;
              this._applyToCurrentScene(target);
            }
          }

          getNetworkSyncData(): EnvironmentMapFilterNetworkSyncData {
            return {
              ei: this._environmentIntensity,
              bi: this._backgroundIntensity,
              r: this._rotation,
              s: this._source,
              sb: this._showBackground,
              rs: this._resourceNames.slice(),
            };
          }

          updateFromNetworkSyncData(
            syncData: EnvironmentMapFilterNetworkSyncData
          ): void {
            if (syncData.ei !== undefined) this._environmentIntensity = syncData.ei;
            if (syncData.bi !== undefined) this._backgroundIntensity = syncData.bi;
            if (syncData.r !== undefined) this._rotation = syncData.r;
            if (syncData.sb !== undefined) this._showBackground = syncData.sb;
            if (syncData.s !== undefined) this._source = syncData.s;
            if (syncData.rs !== undefined) this._resourceNames = syncData.rs;
            this._rebuildEnvironmentTextureForCurrentScene(target);
          }

          private _applyToCurrentScene(target: EffectsTarget): void {
            const scene = target.get3DRendererObject() as
              | THREE.Scene
              | null
              | undefined;
            if (scene && this._isEnabled) {
              this._applyToScene(scene);
            }
          }

          private _rebuildEnvironmentTextureForCurrentScene(
            target: EffectsTarget
          ): void {
            this._rebuildEnvironmentTexture(target);
            this._applyToCurrentScene(target);
          }
        })();
      }
    })()
  );
}
