// @flow
import { mapFor } from '../Utils/MapFor';
import flatten from 'lodash/flatten';
import { type SelectedTags, hasStringAllTags } from '../Utils/TagsHelper';
const gd: libGDevelop = global.gd;

export type EnumeratedObjectMetadata = {|
  extension: gdPlatformExtension,
  objectMetadata: gdObjectMetadata,
  name: string,
  fullName: string,
  description: string,
  iconFilename: string,
  categoryFullName: string,
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
  project: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  type: ?string = undefined
) => {
  const filterObject = (object: gdObject): boolean => {
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
    .map((object: gdObject): ObjectWithContext => ({ object, global: false }));

  const projectObjectsList: ObjectWithContextList =
    project === objectsContainer
      ? []
      : mapFor(0, project.getObjectsCount(), i => project.getObjectAt(i))
          .filter(filterObject)
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
  project: gdProject
): Array<EnumeratedObjectMetadata> => {
  const platform = project.getCurrentPlatform();
  const extensionsList = platform.getAllPlatformExtensions();

  return flatten(
    mapFor(0, extensionsList.size(), i => {
      const extension = extensionsList.at(i);

      return extension
        .getExtensionObjectsTypes()
        .toJSArray()
        .map(objectType => extension.getObjectMetadata(objectType))
        .map(objectMetadata => ({
          extension,
          objectMetadata,
          name: objectMetadata.getName(),
          fullName: objectMetadata.getFullName(),
          description: objectMetadata.getDescription(),
          iconFilename: objectMetadata.getIconFilename(),
          categoryFullName: objectMetadata.getCategoryFullName(),
        }));
    })
  );
};

export type ObjectFilteringOptions = {|
  searchText: string,
  selectedTags: SelectedTags,
  hideExactMatches?: boolean,
|};

export const filterObjectByTags = (
  objectWithContext: ObjectWithContext,
  selectedTags: SelectedTags
): boolean => {
  if (!selectedTags.length) return true;

  const objectTags = objectWithContext.object.getTags();
  return hasStringAllTags(objectTags, selectedTags);
};

export const filterObjectsList = (
  list: ObjectWithContextList,
  { searchText, selectedTags, hideExactMatches }: ObjectFilteringOptions
): ObjectWithContextList => {
  if (!searchText && !selectedTags.length) return list;

  return list
    .filter(objectWithContext =>
      filterObjectByTags(objectWithContext, selectedTags)
    )
    .filter((objectWithContext: ObjectWithContext) => {
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
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  type: ?string = undefined
) => {
  const filterObject = (object: gdObject): boolean => {
    return (
      !type ||
      gd.getTypeOfObject(
        globalObjectsContainer,
        objectsContainer,
        object.getName(),
        false
      ) === type
    );
  };
  const filterGroup = (group: gdObjectGroup): boolean => {
    return (
      !type ||
      gd.getTypeOfObject(
        globalObjectsContainer,
        objectsContainer,
        group.getName(),
        true
      ) === type
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
    globalObjectsContainer === objectsContainer
      ? []
      : mapFor(0, globalObjectsContainer.getObjectsCount(), i =>
          globalObjectsContainer.getObjectAt(i)
        )
          .filter(filterObject)
          .map(object => ({ object, global: true }));

  const projectGroups = globalObjectsContainer.getObjectGroups();
  const projectGroupsList: GroupWithContextList =
    globalObjectsContainer === objectsContainer
      ? []
      : enumerateGroups(projectGroups)
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
