import optionalRequire from '../Utils/OptionalRequire.js';
import slug from 'slug';
import PIXI from 'pixi.js';
const gd = global.gd;
const electron = optionalRequire('electron');
const path = optionalRequire('path');

const loadedFontFamilies = {};
const loadedTextures = {};
const invalidTexture = PIXI.Texture.fromImage('res/error48.png');

class FilenamesCache {
  constructor() {
    this.projectCache = {};
  }

  _getProjectCache(project) {
    const cache = this.projectCache[project.ptr];
    if (!cache) {
      return (this.projectCache[project.ptr] = {});
    }

    return cache;
  }

  getSystemFilename(project, filename) {
    const cache = this._getProjectCache(project);
    return cache[filename];
  }

  cacheSystemFilename(project, filename, systemFilename) {
    const cache = this._getProjectCache(project);
    return (cache[filename] = systemFilename);
  }
}

export default class ResourceLoader {
  static _cache = new FilenamesCache();

  static _getSystemFullFilename(project, filename) {
    const cachedSystemFilename = ResourceLoader._cache.getSystemFilename(
      project,
      filename
    );
    if (cachedSystemFilename) return cachedSystemFilename;

    if (electron) {
      // Support local filesystem with Electron
      const file = project.getProjectFile();
      const projectPath = path.dirname(file);
      const resourceAbsolutePath = path.resolve(projectPath, filename);

      console.info('Loading', resourceAbsolutePath);
      return this._cache.cacheSystemFilename(
        project,
        filename,
        'file://' + resourceAbsolutePath
      );
    }

    return this._cache.cacheSystemFilename(project, filename, filename);
  }

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
      const filename = ResourceLoader._getSystemFullFilename(
        project,
        resource.getFile()
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
          ResourceLoader._initializeTexture(
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
   * Get the URL/filename associated with the given resource.
   */
  static getFilename(project, resourceName) {
    if (project.getResourcesManager().hasResource(resourceName)) {
      const resourceRelativePath = project
        .getResourcesManager()
        .getResource(resourceName)
        .getFile();
      return ResourceLoader._getSystemFullFilename(
        project,
        resourceRelativePath
      );
    }

    return resourceName;
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

    const resourceRelativePath = resource.getFile();
    loadedTextures[resourceName] = PIXI.Texture.fromImage(
      ResourceLoader._getSystemFullFilename(project, resourceRelativePath)
    );

    ResourceLoader._initializeTexture(resource, loadedTextures[resourceName]);
    return loadedTextures[resourceName];
  }

  /**
   * Load the given font from its url/filename.
   * @returns a Promise that resolves with the font-family to be used
   * to render a text with the font.
   */
  static getFontFamily(project, fontFilename) {
    // Avoid reloading a font if it's already cached
    if (loadedFontFamilies[fontFilename]) {
      return Promise.resolve(loadedFontFamilies[fontFilename]);
    }

    // Load the given font using CSS Font Loading API.
    const fontFamily = slug(fontFilename);
    const fullFilename = ResourceLoader._getSystemFullFilename(
      project,
      fontFilename
    );
    const fontFace = new FontFace(fontFamily, `url(${fullFilename})`, {});
    document.fonts.add(fontFace);
    return fontFace.load().then(
      loadedFace => {
        loadedFontFamilies[fontFilename] = fontFamily;

        return fontFamily;
      }
    );
  }

  static getInvalidPIXITexture() {
    return invalidTexture;
  }
}
