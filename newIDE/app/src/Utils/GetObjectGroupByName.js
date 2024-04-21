// @flow

export default function getObjectGroupByName(
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer?: ?gdObjectsContainer,
  objectGroupName: string
): ?gdObjectGroup {
  if (
    objectsContainer &&
    objectsContainer.getObjectGroups().has(objectGroupName)
  ) {
    return objectsContainer.getObjectGroups().get(objectGroupName);
  } else if (globalObjectsContainer.getObjectGroups().has(objectGroupName)) {
    return globalObjectsContainer.getObjectGroups().get(objectGroupName);
  }

  return null;
}
