// @flow

export default function getObjectByName(
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer?: ?gdObjectsContainer,
  objectName: string
): ?gdObject {
  if (objectsContainer && objectsContainer.hasObjectNamed(objectName))
    return objectsContainer.getObject(objectName);
  else if (
    globalObjectsContainer &&
    globalObjectsContainer.hasObjectNamed(objectName)
  )
    return globalObjectsContainer.getObject(objectName);

  return null;
}
