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


