// @flow
import optionalRequire from '../Utils/OptionalRequire.js';
const electron = optionalRequire('electron');
const path = optionalRequire('path');

class UrlsCache {
  projectCache = {};

  _getProjectCache(project: gdProject) {
    const cache = this.projectCache[project.ptr];
    if (!cache) {
      return (this.projectCache[project.ptr] = {});
    }

    return cache;
  }

  getCachedUrl(project: gdProject, filename: string) {
    const cache = this._getProjectCache(project);
    return cache[filename];
  }

  cacheUrl(project: gdProject, url: string) {
    const cache = this._getProjectCache(project);
    return (cache[url] = url);
  }

  cacheLocalFileUrl(
    project: gdProject,
    filename: string,
    systemFilename: string
  ) {
    const cache = this._getProjectCache(project);

    // The URL is cached with an extra "cache-bursting" parameter.
    // If the cache is emptied or changed, local files will have another
    // value for this parameter, forcing the browser to reload the images.
    return (cache[filename] = `${systemFilename}?cache=${Date.now()}`);
  }
}

/**
 * A class globally used in the whole IDE to get URLs to resources of games
 * (notably images).
 */
export default class ResourcesLoader {
  static _cache = new UrlsCache();

  static isLocalFile(filename: string): boolean {
    return (
      filename.indexOf('data:') !== 0 &&
      filename.indexOf('http://') !== 0 &&
      filename.indexOf('https://') !== 0 &&
      filename.indexOf('ftp://') !== 0
    );
  }

  /**
   * Re-create a new cache for URLs. Call this to force local
   * file to be loaded again.
   */
  static burstUrlsCache() {
    ResourcesLoader._cache = new UrlsCache();
  }

  /**
   * Get the fully qualified URL/filename for a filename relative to the project.
   */
  static getFullUrl(project: gdProject, filename: string) {
    const cachedUrl = ResourcesLoader._cache.getCachedUrl(project, filename);
    if (cachedUrl) return cachedUrl;

    if (electron && ResourcesLoader.isLocalFile(filename)) {
      // Support local filesystem with Electron
      const file = project.getProjectFile();
      const projectPath = path.dirname(file);
      const resourceAbsolutePath = path
        .resolve(projectPath, filename)
        .replace(/\\/g, '/');

      console.info('Caching resolved local filename:', resourceAbsolutePath);
      return this._cache.cacheLocalFileUrl(
        project,
        filename,
        'file://' + resourceAbsolutePath
      );
    }

    // URLs to non local files are unchanged
    return this._cache.cacheUrl(project, filename);
  }

  /**
   * Get the fully qualified URL/filename associated with the given resource.
   */
  static getResourceFullUrl(project: gdProject, resourceName: string) {
    if (project.getResourcesManager().hasResource(resourceName)) {
      const resourceRelativePath = project
        .getResourcesManager()
        .getResource(resourceName)
        .getFile();
      return ResourcesLoader.getFullUrl(project, resourceRelativePath);
    }

    return resourceName;
  }
}
