// @flow
import * as THREE from 'three';
import PixiResourcesLoader from '../../ObjectsRendering/PixiResourcesLoader';

/**
 * The type of the "Environment map" effect (see
 * `Extensions/3D/EnvironmentMapEffect.ts`, which must be kept in sync with
 * this file).
 */
const effectType = 'Scene3D::EnvironmentMap';

const findEnvironmentMapEffect = (layer: gdLayer): gdEffect | null => {
  const effects = layer.getEffects();
  for (let index = 0; index < effects.getEffectsCount(); index++) {
    const effect = effects.getEffectAt(index);
    if (effect.getEffectType() === effectType && effect.isEnabled()) {
      return effect;
    }
  }
  return null;
};

/**
 * Show the "Environment map" effect of a layer in the scene editor: light the
 * 3D scene with the images of the effect (image based lighting) and show them
 * as the background of the layer when it is configured.
 */
export default class LayerEnvironmentMapEffect {
  // The settings of the effect being displayed (to rebuild the textures when
  // they change).
  _key: string | null = null;
  _isApplied: boolean = false;

  // The textures (owned: they must be disposed when unused).
  _sourceTexture: THREE.Texture | null = null;
  _environmentTexture: THREE.Texture | null = null;
  _pmremGenerator: THREE.PMREMGenerator | null = null;

  // The state of the scene before the effect was applied.
  _oldEnvironment: THREE.Texture | null = null;
  _oldBackground: THREE.Texture | THREE.Color | null = null;

  // Avoid applying the result of an outdated texture loading.
  _buildToken: number = 0;

  /**
   * Apply the "Environment map" effect of the layer to its 3D scene, and keep
   * it up to date with the effect settings. Must be called at each frame.
   */
  update(
    project: gdProject,
    layer: gdLayer,
    // $FlowFixMe[value-as-type]
    threeScene: THREE.Scene | null,
    // $FlowFixMe[value-as-type]
    threeRenderer: THREE.WebGLRenderer | null
  ): void {
    if (!threeScene) return;
    const effect = findEnvironmentMapEffect(layer);
    if (!effect) {
      if (this._isApplied) {
        this._restoreScene(threeScene);
        this._disposeTextures();
        this._key = null;
        this._isApplied = false;
      }
      return;
    }

    const key = JSON.stringify([
      effect.getStringParameter('source'),
      effect.getStringParameter('rightFaceResourceName'),
      effect.getStringParameter('leftFaceResourceName'),
      effect.getStringParameter('topFaceResourceName'),
      effect.getStringParameter('bottomFaceResourceName'),
      effect.getStringParameter('frontFaceResourceName'),
      effect.getStringParameter('backFaceResourceName'),
      effect.getStringParameter('equirectangularResourceName'),
    ]);
    if (key !== this._key) {
      this._key = key;
      this._buildTextures(project, effect, threeRenderer);
    }
    this._applyToScene(effect, threeScene);
  }

  /**
   * Restore the scene and dispose the textures of the effect. Must be called
   * when the layer is destroyed.
   */
  // $FlowFixMe[value-as-type]
  dispose(threeScene: THREE.Scene | null): void {
    if (threeScene && this._isApplied) {
      this._restoreScene(threeScene);
    }
    this._disposeTextures();
    if (this._pmremGenerator) {
      this._pmremGenerator.dispose();
      this._pmremGenerator = null;
    }
  }

  // $FlowFixMe[value-as-type]
  _restoreScene(threeScene: THREE.Scene): void {
    threeScene.environment = this._oldEnvironment;
    threeScene.environmentIntensity = 1;
    threeScene.environmentRotation.set(0, 0, 0);
    threeScene.background = this._oldBackground;
    threeScene.backgroundIntensity = 1;
    threeScene.backgroundRotation.set(0, 0, 0);
    this._isApplied = false;
  }

  _applyToScene(effect: gdEffect, threeScene: THREE.Scene): void {
    if (!this._environmentTexture) {
      // The textures are still loading.
      return;
    }
    if (!this._isApplied) {
      this._oldEnvironment = threeScene.environment;
      this._oldBackground = threeScene.background;
      this._isApplied = true;
    }
    const rotation = (effect.getDoubleParameter('rotation') * Math.PI) / 180;
    threeScene.environment = this._environmentTexture;
    threeScene.environmentIntensity = effect.getDoubleParameter(
      'environmentIntensity'
    );
    threeScene.environmentRotation.set(0, rotation, 0);
    if (effect.getBooleanParameter('showBackground')) {
      threeScene.background = this._environmentTexture;
      threeScene.backgroundIntensity = effect.getDoubleParameter(
        'backgroundIntensity'
      );
      threeScene.backgroundRotation.set(0, rotation, 0);
    }
  }

  _buildTextures(
    project: gdProject,
    effect: gdEffect,
    // $FlowFixMe[value-as-type]
    threeRenderer: THREE.WebGLRenderer | null
  ): void {
    const buildToken = ++this._buildToken;
    this._disposeTextures();

    const source = effect.getStringParameter('source');
    const loading =
      source === 'equirect'
        ? this._loadEquirectangularTexture(
            project,
            effect.getStringParameter('equirectangularResourceName')
          )
        : this._loadCubeTexture(project, effect);
    loading.then(
      sourceTexture => {
        if (buildToken !== this._buildToken || !sourceTexture) {
          if (sourceTexture) sourceTexture.dispose();
          return;
        }
        this._sourceTexture = sourceTexture;
        if (threeRenderer) {
          if (!this._pmremGenerator) {
            this._pmremGenerator = new THREE.PMREMGenerator(threeRenderer);
          }
          // Prefiltering with PMREM is needed for a smooth roughness on every
          // GPU (like in the game engine).
          this._environmentTexture = (sourceTexture: any).isCubeTexture
            ? this._pmremGenerator.fromCubemap(sourceTexture).texture
            : this._pmremGenerator.fromEquirectangular(sourceTexture).texture;
        } else {
          // No 3D renderer available (yet): use the source texture directly.
          this._environmentTexture = sourceTexture;
          this._sourceTexture = null;
        }
      },
      error => {
        console.warn('Unable to load the environment map images:', error);
      }
    );
  }

  _loadEquirectangularTexture(
    project: gdProject,
    resourceName: string
    // $FlowFixMe[value-as-type]
  ): Promise<THREE.Texture | null> {
    if (!resourceName) return Promise.resolve(null);
    return PixiResourcesLoader.getThreeTexture(project, resourceName).then(
      texture => {
        const equirectangularTexture = texture.clone();
        equirectangularTexture.mapping = THREE.EquirectangularReflectionMapping;
        equirectangularTexture.needsUpdate = true;
        return equirectangularTexture;
      }
    );
  }

  _loadCubeTexture(
    project: gdProject,
    effect: gdEffect
    // $FlowFixMe[value-as-type]
  ): Promise<THREE.Texture | null> {
    const resourceNames = [
      effect.getStringParameter('rightFaceResourceName'),
      effect.getStringParameter('leftFaceResourceName'),
      effect.getStringParameter('topFaceResourceName'),
      effect.getStringParameter('bottomFaceResourceName'),
      effect.getStringParameter('frontFaceResourceName'),
      effect.getStringParameter('backFaceResourceName'),
    ];
    if (!resourceNames.some(resourceName => resourceName)) {
      return Promise.resolve(null);
    }
    return Promise.all(
      resourceNames.map(resourceName =>
        resourceName
          ? PixiResourcesLoader.getThreeTexture(project, resourceName)
          : Promise.resolve(null)
      )
    ).then(textures => {
      const images = textures.map(texture => (texture ? texture.image : null));
      if (!images.some(image => image)) {
        return null;
      }
      // The same face order as `getThreeCubeTexture` in the game engine (the
      // images of the X axis are swapped).
      const cubeTexture = new THREE.CubeTexture(images);
      cubeTexture.colorSpace = THREE.SRGBColorSpace;
      cubeTexture.needsUpdate = true;
      return cubeTexture;
    });
  }

  _disposeTextures(): void {
    this._buildToken++;
    if (this._environmentTexture) {
      this._environmentTexture.dispose();
      this._environmentTexture = null;
    }
    if (this._sourceTexture) {
      this._sourceTexture.dispose();
      this._sourceTexture = null;
    }
  }
}
