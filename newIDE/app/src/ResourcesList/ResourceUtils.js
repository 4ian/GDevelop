// @flow
import ResourcesLoader from '../ResourcesLoader';
import optionalRequire from '../Utils/OptionalRequire.js';
const fs = optionalRequire('fs');

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
