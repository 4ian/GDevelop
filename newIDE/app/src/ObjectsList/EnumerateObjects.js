import { mapFor } from '../Utils/MapFor';
const gd = global.gd;

export const enumerateObjects = (
  project,
  objectsContainer,
  type = undefined
) => {
  const filterObject = object => {
    return !type || gd.getTypeOfObject(project, objectsContainer, object.getName(), false) === type;
  }

  const containerObjectsList = mapFor(
    0,
    objectsContainer.getObjectsCount(),
    i => objectsContainer.getObjectAt(i)
  )
    .filter(filterObject)
    .map(object => ({ object, global: false }));

  const projectObjectsList = project === objectsContainer
    ? []
    : mapFor(0, project.getObjectsCount(), i => project.getObjectAt(i))
        .filter(filterObject)
        .map(object => ({ object, global: true }));

  const allObjectsList = containerObjectsList.concat(projectObjectsList);

  return {
    containerObjectsList,
    projectObjectsList,
    allObjectsList,
  };
};

export const enumerateObjectsAndGroups = (
  project,
  objectsContainer,
  type = undefined
) => {
  const filterObject = object => {
    return !type || gd.getTypeOfObject(project, objectsContainer, object.getName(), false) === type;
  }
  const filterGroup = group => {
    return !type || gd.getTypeOfObject(project, objectsContainer, group.getName(), true) === type;
  }

  const containerObjectsList = mapFor(
    0,
    objectsContainer.getObjectsCount(),
    i => objectsContainer.getObjectAt(i)
  )
    .filter(filterObject)
    .map(object => ({ object, global: false }));

  const containerGroups = objectsContainer.getObjectGroups();
  const containerGroupsList = mapFor(0, containerGroups.count(), i => {
    return containerGroups.getAt(i);
  })
    .filter(filterGroup)
    .map(group => ({ group, global: false }));

  const projectObjectsList = project === objectsContainer
    ? []
    : mapFor(0, project.getObjectsCount(), i => project.getObjectAt(i))
        .filter(filterObject)
        .map(object => ({ object, global: true }));

  const projectGroups = project.getObjectGroups();
  const projectGroupsList = project === objectsContainer
    ? []
    : mapFor(0, projectGroups.count(), i => {
        return projectGroups.getAt(i);
      })
        .filter(filterGroup)
        .map(group => ({ group, global: true }));

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
