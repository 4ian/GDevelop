import { mapFor } from '../Utils/MapFor';

export const enumerateObjects = (project, objectsContainer) => {
  const containerObjectsList = mapFor(
    0,
    objectsContainer.getObjectsCount(),
    i => objectsContainer.getObjectAt(i)
  ).map(object => ({ object, global: false }));

  const projectObjectsList = project === objectsContainer
    ? []
    : mapFor(0, project.getObjectsCount(), i =>
        project.getObjectAt(i)).map(object => ({ object, global: true }));

  const allObjectsList = containerObjectsList.concat(projectObjectsList);

  return {
    containerObjectsList,
    projectObjectsList,
    allObjectsList,
  };
};

export const enumerateObjectsAndGroups = (project, objectsContainer, type) => {
  const containerObjectsList = mapFor(
    0,
    objectsContainer.getObjectsCount(),
    i => objectsContainer.getObjectAt(i)
  ).map(object => ({ object, global: false }));

  const containerGroups = objectsContainer.getObjectGroups();
  const containerGroupsList = mapFor(0, containerGroups.size(), i => {
    return containerGroups.at(i);
  }).map(group => ({ group, global: false }));

  const projectObjectsList = project === objectsContainer
    ? []
    : mapFor(0, project.getObjectsCount(), i =>
        project.getObjectAt(i)).map(object => ({ object, global: true }));

  const projectGroups = project.getObjectGroups();
  const projectGroupsList = project === objectsContainer
    ? []
    : mapFor(0, projectGroups.size(), i => {
        return projectGroups.at(i);
      }).map(group => ({ group, global: true }));

  const allObjectsList = containerObjectsList.concat(projectObjectsList);
  const allGroupsList = containerGroupsList.concat(projectGroupsList);

  return {
    containerObjectsList,
    projectObjectsList,
    allObjectsList,
    containerGroupsList,
    projectGroupsList,
    allGroupsList,
  };
};
