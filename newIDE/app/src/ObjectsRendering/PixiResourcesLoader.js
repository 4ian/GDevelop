// @flow
import slugs from 'slugs';
import * as PIXI from 'pixi.js';
import ResourcesLoader from '../ResourcesLoader';
import { loadFontFace } from '../Utils/FontFaceLoader';
const gd = global.gd;

const loadedFontFamilies = {};
const loadedTextures = {};
const invalidTexture = PIXI.Texture.fromImage('res/error48.png');

/**
 * Expose functions to load PIXI textures or fonts, given the names of
 * resources and a gd.Project.
 *
 * This internally uses ResourcesLoader to get the URL of the resources.
 */
export default class PixiResourcesLoader {
  static _initializeTexture(resource: gdResource, texture: any) {
    if (resource.getKind() !== 'image') return;

    const imageResource = gd.asImageResource(resource);
    if (!imageResource.isSmooth()) {
      texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    }
  }

  /**
   * (Re)load the PIXI texture represented by the given resources.
   */
  static loadTextures(
    project: gdProject,
    resourceNames: Array<string>,
    onProgress: (number, number) => void,
    onComplete: () => void
  ) {
    const resourcesManager = project.getResourcesManager();
    const loader = PIXI.loader;
    loader.reset();
    loader.removeAllListeners();

    const allResources = {};
    resourceNames.forEach(resourceName => {
      const resource = resourcesManager.getResource(resourceName);
      const filename = ResourcesLoader.getResourceFullUrl(
        project,
        resourceName
      );
      loader.add(resourceName, filename);
      allResources[resourceName] = resource;
    });

    const totalCount = resourceNames.length;
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
   * Return the PIXI texture represented by the given resource.
   * If not loaded, it will load it.
   * @returns The PIXI.Texture to be used. It can be loading, so you
   * should listen to PIXI.Texture `update` event, and refresh your object
   * if this event is triggered.
   */
  static getPIXITexture(project: gdProject, resourceName: string) {
    if (loadedTextures[resourceName]) {
      return loadedTextures[resourceName];
    }

    if (!project.getResourcesManager().hasResource(resourceName))
      return invalidTexture;

    const resource = project.getResourcesManager().getResource(resourceName);
    if (resource.getKind() !== 'image') return invalidTexture;

    loadedTextures[resourceName] = PIXI.Texture.fromImage(
      ResourcesLoader.getResourceFullUrl(project, resourceName),
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
  static loadFontFamily(
    project: gdProject,
    resourceName: string
  ): Promise<string> {
    // Avoid reloading a font if it's already cached
    if (loadedFontFamilies[resourceName]) {
      return Promise.resolve(loadedFontFamilies[resourceName]);
    }

    const fontFamily = slugs(resourceName);
    let fullFilename = null;
    if (project.getResourcesManager().hasResource(resourceName)) {
      const resource = project.getResourcesManager().getResource(resourceName);
      if (resource.getKind() === 'font') {
        fullFilename = ResourcesLoader.getResourceFullUrl(
          project,
          resourceName
        );
      }
    } else {
      // Compatibility with GD <= 5.0-beta56
      // Assume resourceName is just the filename to the font
      fullFilename = ResourcesLoader.getFullUrl(project, resourceName);
      // end of compatibility code
    }

    if (!fullFilename) {
      // If no resource is found/resource is not a font, default to Arial,
      // as done by the game engine too.
      return Promise.resolve('Arial');
    }

    return loadFontFace(fontFamily, `url("${fullFilename}")`, {}).then(
      loadedFace => {
        loadedFontFamilies[resourceName] = fontFamily;

        return fontFamily;
      }
    );
  }

  /**
   * Get the font family name for the given font resource.
   * The font won't be loaded.
   * @returns The font-family to be used to render a text with the font.
   */
  static getFontFamily(project: gdProject, resourceName: string) {
    if (loadedFontFamilies[resourceName]) {
      return loadedFontFamilies[resourceName];
    }

    const fontFamily = slugs(resourceName);
    return fontFamily;
  }

  static getInvalidPIXITexture() {
    return invalidTexture;
  }
}
