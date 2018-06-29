// @flow
import { mapFor } from '../Utils/MapFor';
const gd = global.gd;

//TODO: Object and Group should be moved to a common type definition file
//for all GDevelop.js
type Object = {
  getName: Function,
  setName: Function,
};
type Group = {
  getName: Function,
  setName: Function,
};

export type ObjectWithContext = {|
  object: Object,
  global: boolean,
|};

export type GroupWithContext = {|
  group: Group,
  global: boolean,
|};

export type ObjectWithContextList = Array<ObjectWithContext>;
export type GroupWithContextList = Array<GroupWithContext>;

export const enumerateObjects = (
  project: any,
  objectsContainer: any,
  type: ?string = undefined
) => {
  const filterObject = (object: Object): boolean => {
    return (
      !type ||
      gd.getTypeOfObject(project, objectsContainer, object.getName(), false) ===
        type
    );
  };

  const containerObjectsList: ObjectWithContextList = mapFor(
    0,
    objectsContainer.getObjectsCount(),
    i => objectsContainer.getObjectAt(i)
  )
    .filter(filterObject)
    .map((object: Object): ObjectWithContext => ({ object, global: false }));

  const projectObjectsList: ObjectWithContextList =
    project === objectsContainer
      ? []
      : mapFor(0, project.getObjectsCount(), i => project.getObjectAt(i))
          .filter(filterObject)
          .map((object: Object): ObjectWithContext => ({
            object,
            global: true,
          }));

  const allObjectsList: ObjectWithContextList = containerObjectsList.concat(
    projectObjectsList
  );

  return {
    containerObjectsList,
    projectObjectsList,
    allObjectsList,
  };
};

export const filterObjectsList = (
  list: ObjectWithContextList,
  searchText: string
): ObjectWithContextList => {
  if (!searchText) return list;

  const lowercaseSearchText = searchText.toLowerCase();

  return list.filter((objectWithContext: ObjectWithContext) => {
    return (
      objectWithContext.object
        .getName()
        .toLowerCase()
        .indexOf(lowercaseSearchText) !== -1
    );
  });
};

export const filterGroupsList = (
  list: GroupWithContextList,
  searchText: string
): GroupWithContextList => {
  if (!searchText) return list;

  const lowercaseSearchText = searchText.toLowerCase();

  return list.filter((groupWithContext: GroupWithContext) => {
    return (
      groupWithContext.group
        .getName()
        .toLowerCase()
        .indexOf(lowercaseSearchText) !== -1
    );
  });
};

export const enumerateObjectsAndGroups = (
  project: any,
  objectsContainer: any,
  type: ?string = undefined
) => {
  const filterObject = (object: Object): boolean => {
    return (
      !type ||
      gd.getTypeOfObject(project, objectsContainer, object.getName(), false) ===
        type
    );
  };
  const filterGroup = (group: Group): boolean => {
    return (
      !type ||
      gd.getTypeOfObject(project, objectsContainer, group.getName(), true) ===
        type
    );
  };

  const containerObjectsList: ObjectWithContextList = mapFor(
    0,
    objectsContainer.getObjectsCount(),
    i => objectsContainer.getObjectAt(i)
  )
    .filter(filterObject)
    .map(object => ({ object, global: false }));

  const containerGroups = objectsContainer.getObjectGroups();
  const containerGroupsList: GroupWithContextList = mapFor(
    0,
    containerGroups.count(),
    i => {
      return containerGroups.getAt(i);
    }
  )
    .filter(filterGroup)
    .map(group => ({ group, global: false }));

  const projectObjectsList: ObjectWithContextList =
    project === objectsContainer
      ? []
      : mapFor(0, project.getObjectsCount(), i => project.getObjectAt(i))
          .filter(filterObject)
          .map(object => ({ object, global: true }));

  const projectGroups = project.getObjectGroups();
  const projectGroupsList: GroupWithContextList =
    project === objectsContainer
      ? []
      : mapFor(0, projectGroups.count(), i => {
          return projectGroups.getAt(i);
        })
          .filter(filterGroup)
          .map(group => ({ group, global: true }));

  const allObjectsList: ObjectWithContextList = containerObjectsList.concat(
    projectObjectsList
  );
  const allGroupsList: GroupWithContextList = containerGroupsList.concat(
    projectGroupsList
  );

  return {
    containerObjectsList,
    projectObjectsList,
    allObjectsList,
    containerGroupsList,
    projectGroupsList,
    allGroupsList,
  };
};
