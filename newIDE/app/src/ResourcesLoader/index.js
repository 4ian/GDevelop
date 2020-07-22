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
    if(!cache[filename]) return;
    return cache[filename]["systemFilename"];
  }

  cacheUrl(project: gdProject, url: string) {
    const cache = this._getProjectCache(project);
    return (cache[url] = url);
  }

  burstUrl(project: gdProject, url: string) {
    const cache = this._getProjectCache(project);
    delete cache[url];
  }

  cacheLocalFileUrl(
    project: gdProject,
    filename: string,
    systemFilename: string,
    disableCacheBurst: boolean
  ) {
    const cache = this._getProjectCache(project);
    cache[filename] = {};
    if (!disableCacheBurst) {
      // The URL is cached with an extra "cache-bursting" parameter.
      // If the cache is emptied or changed, local files will have another
      // value for this parameter, forcing the browser to reload the images.
      return (cache[filename]["systemFilename"] = `${systemFilename}?cache=${Date.now()}`);
    } else {
      return (cache[filename]["systemFilename"] = systemFilename);
    }
  }

  getStatusCode(project: gdProject, filename: string) {
    const cache = this._getProjectCache(project);
    if(!cache[filename]) return;
    return (cache[filename]["statusCode"] || "");
  }

  setStatusCode(project: gdProject, filename: string, statusCode: string) {
    const cache = this._getProjectCache(project);
    if(!cache[filename]) return;
    return (cache[filename]["statusCode"] = statusCode);
  }
}

/**
 * A class globally used in the whole IDE to get URLs to resources of games
 * (notably images).
 */
export default class ResourcesLoader {
  static _cache = new UrlsCache();

  static _isLocalFile(filename: string): boolean {
    return (
      filename.indexOf('data:') !== 0 &&
      filename.indexOf('http://') !== 0 &&
      filename.indexOf('https://') !== 0 &&
      filename.indexOf('ftp://') !== 0
    );
  }

  /**
   * Remove the specified resources resolved URLs from the cache. Useful if the
   * file represented by these resources has changed. This force these local files to be loaded again.
   */
  static burstUrlsCacheForResources(
    project: gdProject,
    resourcesNames: Array<string>
  ) {
    const resourcesManager = project.getResourcesManager();
    resourcesNames.forEach(resourceName => {
      if (resourcesManager.hasResource(resourceName)) {
        ResourcesLoader._cache.burstUrl(
          project,
          resourcesManager.getResource(resourceName).getFile()
        );
      }
    });
  }

  /**
   * Re-create a new cache for URLs. Call this to force local
   * file to be loaded again.
   */
  static burstAllUrlsCache() {
    ResourcesLoader._cache = new UrlsCache();
  }

  /**
   * Get the fully qualified URL/filename for a URL/filename relative to the project.
   */
  static getFullUrl(
    project: gdProject,
    filename: string,
    disableCacheBurst: boolean = false
  ) {
    const cachedUrl = ResourcesLoader._cache.getCachedUrl(project, filename);
    if (cachedUrl) return cachedUrl;

    if (electron && ResourcesLoader._isLocalFile(filename)) {
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
        'file://' + resourceAbsolutePath,
        disableCacheBurst
      );
    }

    // URLs to non local files are unchanged
    return this._cache.cacheUrl(project, filename);
  }

  /**
   * Get the fully qualified URL/filename associated with the given resource.
   */
  static getResourceFullUrl(
    project: gdProject,
    resourceName: string,
    disableCacheBurst: boolean = false
  ) {
    if (project.getResourcesManager().hasResource(resourceName)) {
      const resourceRelativePath = project
        .getResourcesManager()
        .getResource(resourceName)
        .getFile();
      return ResourcesLoader.getFullUrl(
        project,
        resourceRelativePath,
        disableCacheBurst
      );
    }

    return resourceName;
  }
  /*
    Can be: 
    WARNING_IMAGE_EXCEEDED_2048_PIXELS


  */
  static getStatusCode(project: gdProject, resourceName: string) {
    return this._cache.getStatusCode(project, resourceName);
  }

  static setStatusCode(
    project: gdProject,
    resourceName: string,
    statusCode: string
  ) {
    this._cache.setStatusCode(project, resourceName, statusCode);
  }

  /*
  Remove the file in the cache for refresh the image in the IDE
  */
  static burstUrl(project: gdProject, url: string) {
    this._cache.burstUrl(project, url);
  }
}
