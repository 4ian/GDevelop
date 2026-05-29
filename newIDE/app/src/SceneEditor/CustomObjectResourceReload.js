// @flow

const gd: libGDevelop = global.gd;

export const getImageResourceNamesForEditedObject = (
  project: gdProject,
  editedObject: gdObject
): Array<string> => {
  const resourcesInUse = new gd.ResourcesInUseHelper(
    project.getResourcesManager()
  );
  editedObject.getConfiguration().exposeResources(resourcesInUse);
  const resourceNames = resourcesInUse
    .getAllImages() // TODO: should probably check all resources.
    .toNewVectorString()
    .toJSArray();
  resourcesInUse.delete();

  return resourceNames;
};

export const shouldResetObjectRendererForCustomObjectChildrenEdit = ({
  project,
  object,
  editedEventsBasedObject,
  editedObject,
}: {|
  project: gdProject,
  object: gdObject,
  editedEventsBasedObject?: ?gdEventsBasedObject,
  editedObject?: ?gdObject,
|}): boolean => {
  if (editedObject && object === editedObject) {
    return true;
  }
  if (!project.hasEventsBasedObject(object.getType())) {
    return false;
  }
  if (!editedEventsBasedObject) {
    return true;
  }
  return gd.EventsBasedObjectDependencyFinder.isDependentFromEventsBasedObject(
    project,
    project.getEventsBasedObject(object.getType()),
    editedEventsBasedObject
  );
};
