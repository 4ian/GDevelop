// @flow

export default function getObjectByName(
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer?: ?gdObjectsContainer,
  objectName: string
): ?gdObject {
  if (objectsContainer && objectsContainer.hasObjectNamed(objectName))
    return objectsContainer.getObject(objectName);
  else if (globalObjectsContainer.hasObjectNamed(objectName))
    return globalObjectsContainer.getObject(objectName);

  return null;
}
