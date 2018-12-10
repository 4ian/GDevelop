import ResourcesLoader from '../ResourcesLoader';

export const createOrUpdateResource = (project, gdResource, resourceName) => {
  const resourcesManager = project.getResourcesManager();
  if (resourcesManager.hasResource(resourceName)) {
    resourcesManager.removeResource(resourceName);
  }
  gdResource.setFile(resourceName);
  gdResource.setName(resourceName);
  resourcesManager.addResource(gdResource);
  gdResource.delete();
};

export const getLocalResourceFullPath = (project, resourceName) => {
  let resourcePath = ResourcesLoader.getResourceFullUrl(project, resourceName);
  resourcePath = resourcePath.substring(7, resourcePath.lastIndexOf('?cache='));
  return resourcePath;
};
