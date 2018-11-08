export const createOrUpdateResource = (project, gdResource, resourceName) => {
    const resourcesManager = project.getResourcesManager();
    if (resourcesManager.hasResource(resourceName)) {
        resourcesManager.removeResource(resourceName)
    };
    gdResource.setFile(resourceName);
    gdResource.setName(resourceName);
    resourcesManager.addResource(gdResource);
    gdResource.delete();
};