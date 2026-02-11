// @flow
import { mapFor } from '../Utils/MapFor';
import flatten from 'lodash/flatten';

const gd: libGDevelop = global.gd;

export type EnumeratedObjectMetadata = {|
  extension: gdPlatformExtension,
  objectMetadata: gdObjectMetadata,
  type: string,
  name: string,
  fullName: string,
  description: string,
  iconFilename: string,
  category: string,
  isRenderedIn3D: boolean,
  assetStoreTag?: string,
  isDependentWithParent?: boolean,
  tags: Array<string>,
|};

export type ObjectWithContext = {|
  object: gdObject,
  global: boolean,
|};

export type GroupWithContext = {|
  group: gdObjectGroup,
  global: boolean,
|};

export type ObjectWithContextList = Array<ObjectWithContext>;
export type GroupWithContextList = Array<GroupWithContext>;

export const isSameGroupWithContext = (groupWithContext: ?GroupWithContext) => (
  other: ?GroupWithContext
) => {
  return (
    groupWithContext &&
    other &&
    groupWithContext.global === other.global &&
    groupWithContext.group === other.group
  );
};

export const isSameObjectWithContext = (
  objectWithContext: ?ObjectWithContext
) => (other: ?ObjectWithContext) => {
  return (
    objectWithContext &&
    other &&
    objectWithContext.global === other.global &&
    objectWithContext.object === other.object
  );
};

export const enumerateObjects = (
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  filters: ?{| type?: string, names?: Array<string> |}
) => {
  const typeFilter = (filters && filters.type) || null;
  const namesFilter = (filters && filters.names) || null;
  const filterObjectByType = typeFilter
    ? (object: gdObject): boolean => {
        // TODO Use ProjectScopedContainers to get the object type
        return (
          gd.getTypeOfObject(
            globalObjectsContainer || objectsContainer,
            objectsContainer,
            object.getName(),
            false
          ) === typeFilter
        );
      }
    : null;

  const filterObjectByName = namesFilter
    ? (object: gdObject): boolean => {
        return namesFilter.includes(object.getName());
      }
    : null;

  let containerObjectsList: ObjectWithContextList = mapFor(
    0,
    objectsContainer.getObjectsCount(),
    i => {
      const object = objectsContainer.getObjectAt(i);
      if (filterObjectByType && !filterObjectByType(object)) {
        return null;
      }
      if (filterObjectByName && !filterObjectByName(object)) {
        return null;
      }
      return object;
    }
  )
    .filter(Boolean)
    .map((object: gdObject): ObjectWithContext => ({ object, global: false }));

  const projectObjectsList: ObjectWithContextList =
    globalObjectsContainer === objectsContainer || !globalObjectsContainer
      ? []
      : mapFor(0, globalObjectsContainer.getObjectsCount(), i => {
          const object = globalObjectsContainer.getObjectAt(i);
          if (filterObjectByType && !filterObjectByType(object)) {
            return null;
          }
          if (filterObjectByName && !filterObjectByName(object)) {
            return null;
          }
          return object;
        })
          .filter(Boolean)
          .map(
            (object: gdObject): ObjectWithContext => ({
              object,
              global: true,
            })
          );

  const allObjectsList: ObjectWithContextList = containerObjectsList.concat(
    projectObjectsList
  );

  return {
    containerObjectsList,
    projectObjectsList,
    allObjectsList,
  };
};

export const enumerateObjectTypes = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null
): Array<EnumeratedObjectMetadata> => {
  const platform = project.getCurrentPlatform();
  const extensionsList = platform.getAllPlatformExtensions();

  return flatten(
    mapFor(0, extensionsList.size(), i => {
      const extension = extensionsList.at(i);

      return extension
        .getExtensionObjectsTypes()
        .toJSArray()
        .map(objectType => {
          const objectMetadata = extension.getObjectMetadata(objectType);
          return {
            extension,
            objectMetadata,
            type: objectType,
            name: objectMetadata.getName(),
            fullName: objectMetadata.getFullName(),
            description: objectMetadata.getDescription(),
            iconFilename: objectMetadata.getIconFilename(),
            category: objectMetadata.getCategory() || 'General',
            assetStoreTag: objectMetadata.getAssetStoreTag(),
            isRenderedIn3D: objectMetadata.isRenderedIn3D(),
            tags: extension.getTags().toJSArray(),
          };
        })
        .filter(
          ({ objectMetadata }) =>
            !objectMetadata.isHidden() &&
            (!objectMetadata.isPrivate() ||
              (eventsFunctionsExtension &&
                extension.getName() === eventsFunctionsExtension.getName()))
        );
    })
  );
};

export type ObjectFilteringOptions = {|
  searchText: string,
  hideExactMatches?: boolean,
|};

export const filterObjectsList = (
  list: ObjectWithContextList,
  { searchText, hideExactMatches }: ObjectFilteringOptions
): ObjectWithContextList => {
  if (!searchText) return list;

  return list.filter((objectWithContext: ObjectWithContext) => {
    const objectName = objectWithContext.object.getName();

    if (hideExactMatches && searchText === objectName) return undefined;

    return objectName.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
  });
};

export type GroupFilteringOptions = {|
  searchText: string,
  hideExactMatches?: boolean,
|};

export const filterGroupsList = (
  list: GroupWithContextList,
  { searchText, hideExactMatches }: GroupFilteringOptions
): GroupWithContextList => {
  if (!searchText) return list;

  return list.filter((groupWithContext: GroupWithContext) => {
    const groupName = groupWithContext.group.getName();

    if (hideExactMatches && groupName === searchText) return undefined;

    return groupName.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
  });
};

export const enumerateGroups = (
  objectGroups: gdObjectGroupsContainer
): Array<gdObjectGroup> => {
  return mapFor(0, objectGroups.count(), i => {
    return objectGroups.getAt(i);
  });
};

export const enumerateObjectsAndGroups = (
  objectsContainersList: gdObjectsContainersList,
  objectType: ?string = undefined,
  requiredBehaviorTypes?: Array<string> = []
) => {
  // The objects must never be kept in a state as they may be temporary copies.
  // Search for "ProjectScopedContainers wrongly containing temporary objects containers or objects"
  // in the codebase.
  if (objectsContainersList.getObjectsContainersCount() === 0) {
    console.error(
      'Called enumerateObjectsAndGroups without any object container.'
    );
    return {
      allObjectsList: [],
      allGroupsList: [],
    };
  }
  // TODO Use a loop instead of looking for 2 object containers.
  if (objectsContainersList.getObjectsContainersCount() > 2) {
    console.error(
      'Called enumerateObjectsAndGroups with more than 2 object containers.'
    );
  }
  const globalObjectsContainer =
    objectsContainersList.getObjectsContainersCount() > 1
      ? objectsContainersList.getObjectsContainer(0)
      : null;
  const objectsContainer = objectsContainersList.getObjectsContainer(
    objectsContainersList.getObjectsContainersCount() - 1
  );

  const filterObject = (object: gdObject): boolean => {
    return (
      (!objectType ||
        objectsContainersList.getTypeOfObject(object.getName()) ===
          objectType) &&
      requiredBehaviorTypes.every(
        requiredBehaviorType =>
          objectsContainersList
            .getBehaviorNamesInObjectOrGroup(
              object.getName(),
              requiredBehaviorType,
              false
            )
            .size() > 0
      )
    );
  };
  const filterGroup = (group: gdObjectGroup): boolean => {
    return (
      (!objectType ||
        objectsContainersList.getTypeOfObject(group.getName()) ===
          objectType) &&
      requiredBehaviorTypes.every(
        behaviorType =>
          objectsContainersList
            .getBehaviorNamesInObjectOrGroup(
              group.getName(),
              behaviorType,
              true
            )
            .size() > 0
      )
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
  const containerGroupsList: GroupWithContextList = enumerateGroups(
    containerGroups
  )
    .filter(filterGroup)
    .map(group => ({ group, global: false }));

  const projectObjectsList: ObjectWithContextList =
    globalObjectsContainer === objectsContainer || !globalObjectsContainer
      ? []
      : mapFor(0, globalObjectsContainer.getObjectsCount(), i =>
          globalObjectsContainer.getObjectAt(i)
        )
          .filter(filterObject)
          .map(object => ({ object, global: true }));

  const projectGroupsList: GroupWithContextList =
    globalObjectsContainer === objectsContainer || !globalObjectsContainer
      ? []
      : enumerateGroups(globalObjectsContainer.getObjectGroups())
          .filter(filterGroup)
          .map(group => ({ group, global: true }));

  const allObjectsList: ObjectWithContextList = containerObjectsList.concat(
    projectObjectsList
  );
  const allGroupsList: GroupWithContextList = containerGroupsList.concat(
    projectGroupsList
  );

  return {
    allObjectsList,
    allGroupsList,
  };
};
