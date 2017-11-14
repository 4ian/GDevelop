import slugs from 'slugs';
import PIXI from 'pixi.js';
import ResourcesLoader from './ResourcesLoader';
import { loadFontFace } from '../Utils/FontFaceLoader';
const gd = global.gd;

const loadedFontFamilies = {};
const loadedTextures = {};
const invalidTexture = PIXI.Texture.fromImage('res/error48.png');

export default class PixiResourcesLoader {
  static _initializeTexture(resource, texture) {
    if (resource.getKind() !== 'image') return;

    const imageResource = gd.asImageResource(resource);
    if (!imageResource.isSmooth()) {
      texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    }
  }

  static loadTextures(project, onProgress, onComplete) {
    const resourcesManager = project.getResourcesManager();
    const loader = PIXI.loader;

    const resourcesList = resourcesManager.getAllResourcesList().toJSArray();
    const allResources = {};
    resourcesList.forEach(resourceName => {
      const resource = resourcesManager.getResource(resourceName);
      const filename = ResourcesLoader.getResourceFullFilename(
        project,
        resourceName
      );
      loader.add(resourceName, filename);
      allResources[resourceName] = resource;
    });

    const totalCount = resourcesList.length;
    if (!totalCount) {
      onComplete();
      return;
    }

    let loadingCount = 0;
    loader.once('complete', function(loader, loadedResources) {
      //Store the loaded textures so that they are ready to use.
      for (const resourceName in loadedResources) {
        if (loadedResources.hasOwnProperty(resourceName)) {
          const resource = resourcesManager.getResource(resourceName);
          if (resource.getKind() !== 'image') continue;

          loadedTextures[resourceName] = loadedResources[resourceName].texture;
          PixiResourcesLoader._initializeTexture(
            resource,
            loadedTextures[resourceName]
          );
        }
      }

      onComplete();
    });
    loader.on('progress', function() {
      loadingCount++;
      onProgress(loadingCount, totalCount);
    });

    loader.load();
  }

  /**
   * Load the PIXI texture represented by the given resource.
   * @returns The PIXI.Texture to be used. It can be loading, so you
   * should listen to PIXI.Texture `update` event, and refresh your object
   * if this event is triggered.
   */
  static getPIXITexture(project, resourceName) {
    if (loadedTextures[resourceName]) {
      return loadedTextures[resourceName];
    }

    if (!project.getResourcesManager().hasResource(resourceName))
      return invalidTexture;

    const resource = project.getResourcesManager().getResource(resourceName);
    if (resource.getKind() !== 'image') return invalidTexture;

    loadedTextures[resourceName] = PIXI.Texture.fromImage(
      ResourcesLoader.getResourceFullFilename(project, resourceName),
      true /* Treats request as cross-origin */
    );

    PixiResourcesLoader._initializeTexture(
      resource,
      loadedTextures[resourceName]
    );
    return loadedTextures[resourceName];
  }

  /**
   * Load the given font from its url/filename.
   * @returns a Promise that resolves with the font-family to be used
   * to render a text with the font.
   */
  static loadFontFamily(project, fontFilename) {
    // Avoid reloading a font if it's already cached
    if (loadedFontFamilies[fontFilename]) {
      return Promise.resolve(loadedFontFamilies[fontFilename]);
    }

    const fontFamily = slugs(fontFilename);
    const fullFilename = ResourcesLoader.getFullFilename(project, fontFilename);
    return loadFontFace(
      fontFamily,
      `url("${fullFilename}")`,
      {}
    ).then(loadedFace => {
      loadedFontFamilies[fontFilename] = fontFamily;

      return fontFamily;
    });
  }

  /**
   * Get the font family name for the given font from its url/filename.
   * The font won't be loaded.
   * @returns The font-family to be used to render a text with the font.
   */
  static getFontFamily(project, fontFilename) {
    if (loadedFontFamilies[fontFilename]) {
      return loadedFontFamilies[fontFilename];
    }

    const fontFamily = slugs(fontFilename);
    return fontFamily;
  }

  static getInvalidPIXITexture() {
    return invalidTexture;
  }
}
