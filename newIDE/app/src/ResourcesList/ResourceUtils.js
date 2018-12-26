// @flow
import ResourcesLoader from '../ResourcesLoader';
import optionalRequire from '../Utils/OptionalRequire.js';
const fs = optionalRequire('fs');

export const RESOURCE_EXTENSIONS = {
  image: 'png,jpg,jpeg,PNG,JPG,JPEG',
  audio: 'wav,mp3,ogg,WAV,MP3,OGG',
  font: 'ttf,ttc,TTF,TTC',
};

export const createOrUpdateResource = (
  project: gdProject,
  gdResource: gdResource,
  resourceName: string
) => {
  const resourcesManager = project.getResourcesManager();
  if (resourcesManager.hasResource(resourceName)) {
    resourcesManager.removeResource(resourceName);
  }
  gdResource.setFile(resourceName);
  gdResource.setName(resourceName);
  resourcesManager.addResource(gdResource);
  gdResource.delete();
};

export const getLocalResourceFullPath = (
  project: gdProject,
  resourceName: string
) => {
  let resourcePath = ResourcesLoader.getResourceFullUrl(project, resourceName);
  resourcePath = resourcePath.substring(7, resourcePath.lastIndexOf('?cache='));
  return resourcePath;
};

export const resourceHasValidPath = (
  project: gdProject,
  resourceName: string
) => {
  const resourcePath = getLocalResourceFullPath(project, resourceName);
  return fs.existsSync(resourcePath);
};
