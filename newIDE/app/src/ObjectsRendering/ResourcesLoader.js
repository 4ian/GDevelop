import optionalRequire from '../Utils/OptionalRequire.js';
import slug from 'slug';
const electron = optionalRequire('electron');
const path = optionalRequire('path');

const loadedFontFamilies = {};

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

  static get(project, resourceName) {
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

  static getInvalidImageURL() {
    return 'res/error48.png';
  }
}
