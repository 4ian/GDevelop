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

      console.log('Loading', resourceAbsolutePath);
      return this._cache.cacheSystemFilename(
        project,
        filename,
        'file://' + resourceAbsolutePath
      );
    }

    return this._cache.cacheSystemFilename(project, filename, filename);
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
          if (resource.getKind() !== 'image') return;

          const imageResource = gd.asImageResource(resource);
          loadedTextures[resourceName] = loadedResources[resourceName].texture;
          if (!imageResource.isSmooth()) {
            loadedTextures[
              resourceName
            ].baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
          }
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

  static getFilename(project, resourceName) {
    if (project.getResourcesManager().hasResource(resourceName)) {
      const resourceRelativePath = project
        .getResourcesManager()
        .getResource(resourceName)
        .getFile();
      return ResourceLoader._getSystemFullFilename(project, resourceRelativePath)
    }

    return resourceName;
  }

  static getPIXITexture(project, resourceName) {
    if (loadedTextures[resourceName]) {
      return loadedTextures[resourceName];
    }

    console.warn(
      "Trying to get a texture that wasn't preloaded: ",
      resourceName
    );

    if (project.getResourcesManager().hasResource(resourceName)) {
      const resourceRelativePath = project
        .getResourcesManager()
        .getResource(resourceName)
        .getFile();
      loadedTextures[resourceName] = PIXI.Texture.fromImage(
        ResourceLoader._getSystemFullFilename(project, resourceRelativePath)
      );
      //TODO: smooth handling
      return loadedTextures[resourceName];
    }

    return invalidTexture;
  }

  static getFontFamily(project, fontFilename) {
    if (!fontFilename) return '';

    if (loadedFontFamilies[fontFilename]) {
      return loadedFontFamilies[fontFilename];
    }

    const fontFamily = slug(fontFilename);
    const fontFaceDeclaration = "@font-face { font-family: '" +
      fontFamily +
      "';" +
      'src: url(' +
      ResourceLoader._getSystemFullFilename(project, fontFilename) +
      '); }';
    const declaration = "<style type='text/css'>" +
      fontFaceDeclaration +
      '</style>';

    document.querySelector('head').innerHTML += declaration;
    return (loadedFontFamilies[fontFilename] = fontFamily);
  }

  static getInvalidPIXITexture() {
    return invalidTexture;
  }
}
