// @flow
import ResourcesLoader from '../ResourcesLoader';
import optionalRequire from '../Utils/OptionalRequire.js';
const fs = optionalRequire('fs');
const path = optionalRequire('path');

export const RESOURCE_EXTENSIONS = {
  image: 'png,jpg,jpeg,PNG,JPG,JPEG',
  audio: 'wav,mp3,ogg,WAV,MP3,OGG',
  font: 'ttf,ttc,otf,TTF,TTC,OTF',
  video: 'mp4,MP4',
};

export const createOrUpdateResource = (
  project: gdProject,
  resource: gdResource,
  resourceName: string
) => {
  const resourcesManager = project.getResourcesManager();
  if (resourcesManager.hasResource(resourceName)) {
    resourcesManager.removeResource(resourceName);
  }
  resource.setFile(resourceName);
  resource.setName(resourceName);
  resourcesManager.addResource(resource);
  resource.delete();
};

/**
 * Get the local path of a resource. This works by asking the ResourcesLoader
 * for the resource URL, then stripping anything that is specific to a URL.
 */
export const getLocalResourceFullPath = (
  project: gdProject,
  resourceName: string
) => {
  let resourcePath = ResourcesLoader.getResourceFullUrl(
    project,
    resourceName
  ).substring(7 /* Remove "file://" from the URL to get a local path */);

  if (resourcePath.indexOf('?cache=') !== -1) {
    // Remove, if needed, the cache bursting argument from the URL.
    resourcePath = resourcePath.substring(
      0,
      resourcePath.lastIndexOf('?cache=')
    );
  }
  return resourcePath;
};

export const isResourcePathinProjectFolder = (
  project: gdProject,
  resourcePath: string
) => {
  const projectPath = path.dirname(project.getProjectFile());
  return resourcePath.includes(projectPath);
};

export const userWantsToUseExternalPath = (
  project: gdProject,
  resourcePath: string
) => {
  if (!isResourcePathinProjectFolder(project, resourcePath)) {
    // eslint-disable-next-line
    const answer = confirm(
      resourcePath +
        ' is located outside of the project folder. If the project is moved, the path to the resource can be broken.\nAre you sure you want to proceed?'
    );
    return answer;
  }
  return true;
};

export const getResourceFilePathStatus = (
  project: gdProject,
  resourceName: string
) => {
  if (!fs) return 0;
  const resourcePath = path.normalize(
    getLocalResourceFullPath(project, resourceName)
  );

  // the resource path is outside of the project folder
  if (!isResourcePathinProjectFolder(project, resourcePath)) return 1;
  // the resource path doesnt exist
  if (!fs.existsSync(resourcePath)) return 2;
  // the resource path seems ok
  return 0;
};
