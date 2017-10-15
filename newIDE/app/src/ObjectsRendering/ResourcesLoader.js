import optionalRequire from '../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');
const path = optionalRequire('path');

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

  static isURL(filename) {
    return (
      filename.indexOf('http://') === 0 ||
      filename.indexOf('https://') === 0 ||
      filename.indexOf('ftp://') === 0
    );
  }

  /**
   * Get the fully qualified URL/filename for a filename relative to the project.
   */
  static getFullFilename(project, filename) {
    const cachedSystemFilename = ResourceLoader._cache.getSystemFilename(
      project,
      filename
    );
    if (cachedSystemFilename) return cachedSystemFilename;

    if (electron && !ResourceLoader.isURL(filename)) {
      // Support local filesystem with Electron
      const file = project.getProjectFile();
      const projectPath = path.dirname(file);
      const resourceAbsolutePath = path
        .resolve(projectPath, filename)
        .replace(/\\/g, '/');

      console.info('Loading', resourceAbsolutePath);
      return this._cache.cacheSystemFilename(
        project,
        filename,
        'file://' + resourceAbsolutePath
      );
    }

    return this._cache.cacheSystemFilename(project, filename, filename);
  }

  /**
   * Get the fully qualified URL/filename associated with the given resource.
   */
  static getResourceFullFilename(project, resourceName) {
    if (project.getResourcesManager().hasResource(resourceName)) {
      const resourceRelativePath = project
        .getResourcesManager()
        .getResource(resourceName)
        .getFile();
      return ResourceLoader.getFullFilename(project, resourceRelativePath);
    }

    return resourceName;
  }
}
