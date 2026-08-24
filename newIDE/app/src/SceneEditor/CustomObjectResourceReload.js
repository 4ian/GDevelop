// @flow

const gd: libGDevelop = global.gd;

/**
 * Options describing a change made to the children of a custom
 * (events-based) object, used to decide which resources must be reloaded and
 * which instance renderers must be reset.
 */
export type EventsBasedObjectChildrenEditedOptions = {|
  // The child object that was actually edited, if any.
  editedObject?: ?gdObject,
  // Whether a resource was actually changed while editing the object.
  hasResourceChanged?: boolean,
|};

/**
 * Return the names of the image resources used by an object.
 */
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

/**
 * When a child of a custom object is edited, the rendered instances of some
 * objects must be reset so they reflect the change:
 * - the edited object itself,
 * - every custom object that (directly or transitively) includes the edited
 *   events-based object, as their rendering embeds it.
 *
 * Objects that are unrelated to the edited events-based object don't need to
 * be reset (and objects directly using a reloaded resource are already handled
 * when reloading the resources).
 */
export const shouldResetObjectRendererForCustomObjectChildrenEdit = ({
  project,
  object,
  editedEventsBasedObject,
  editedObject,
}: {|
  project: gdProject,
  object: gdObject,
  editedEventsBasedObject: gdEventsBasedObject,
  editedObject?: ?gdObject,
|}): boolean => {
  if (editedObject && object === editedObject) {
    return true;
  }
  if (!project.hasEventsBasedObject(object.getType())) {
    return false;
  }
  return gd.EventsBasedObjectDependencyFinder.isDependentFromEventsBasedObject(
    project,
    project.getEventsBasedObject(object.getType()),
    editedEventsBasedObject
  );
};
