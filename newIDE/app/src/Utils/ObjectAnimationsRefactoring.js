// @flow
import { mapFor } from './MapFor';
const gd: libGDevelop = global.gd;

/**
 * Where an object lives, as known by its editors: its scene (or the scene a
 * global object is edited from), or the custom object it is a child of.
 */
export type ObjectReferencesContext = {|
  project: gdProject,
  object: gdObject,
  layout: ?gdLayout,
  eventsFunctionsExtension: ?gdEventsFunctionsExtension,
  eventsBasedObject: ?gdEventsBasedObject,
|};

const isGlobalObject = (project: gdProject, object: gdObject): boolean => {
  const globalObjects = project.getObjects();
  const objectName = object.getName();
  return (
    globalObjects.hasObjectNamed(objectName) &&
    globalObjects.getObject(objectName).ptr === object.ptr
  );
};

/**
 * The scenes whose events can refer to the object: its own scene, or, for a
 * global object, every scene without a local object of the same name (which
 * would shadow it). Null for a child of a custom object.
 */
const getScenesUsingObject = ({
  project,
  object,
  layout,
}: ObjectReferencesContext): Array<gdLayout> | null => {
  if (isGlobalObject(project, object)) {
    return mapFor(0, project.getLayoutsCount(), i =>
      project.getLayoutAt(i)
    ).filter(scene => !scene.getObjects().hasObjectNamed(object.getName()));
  }
  return layout ? [layout] : null;
};

/**
 * Updates the events referring to an animation of the object after it was
 * renamed: the events of its scenes and their external events, or the events
 * of the custom object it is a child of.
 */
export const renameObjectAnimationReferences = (
  context: ObjectReferencesContext,
  oldName: string,
  newName: string
) => {
  const {
    project,
    object,
    eventsFunctionsExtension,
    eventsBasedObject,
  } = context;
  const scenes = getScenesUsingObject(context);
  if (scenes) {
    scenes.forEach(scene =>
      gd.WholeProjectRefactorer.renameObjectAnimationInScene(
        project,
        scene,
        object,
        oldName,
        newName
      )
    );
  } else if (eventsFunctionsExtension && eventsBasedObject) {
    gd.WholeProjectRefactorer.renameObjectAnimationInEventsBasedObject(
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      object,
      oldName,
      newName
    );
  }
};

/**
 * Updates the events referring to a point of the object after it was renamed,
 * in the same events as `renameObjectAnimationReferences`.
 */
export const renameObjectPointReferences = (
  context: ObjectReferencesContext,
  oldName: string,
  newName: string
) => {
  const {
    project,
    object,
    eventsFunctionsExtension,
    eventsBasedObject,
  } = context;
  const scenes = getScenesUsingObject(context);
  if (scenes) {
    scenes.forEach(scene =>
      gd.WholeProjectRefactorer.renameObjectPointInScene(
        project,
        scene,
        object,
        oldName,
        newName
      )
    );
  } else if (eventsFunctionsExtension && eventsBasedObject) {
    gd.WholeProjectRefactorer.renameObjectPointInEventsBasedObject(
      project,
      eventsFunctionsExtension,
      eventsBasedObject,
      object,
      oldName,
      newName
    );
  }
};
