// @flow
import { mapFor } from './MapFor';
import { getInstancesInLayoutForObject } from './Layout';
import { serializeToJSObject } from './Serializer';
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
 * The events that can refer to the object: the events of its scenes and their
 * external events, or the events of the custom object it is a child of.
 */
const getEventsListsUsingObject = (
  context: ObjectReferencesContext
): Array<gdEventsList> => {
  const { project, eventsBasedObject } = context;
  const scenes = getScenesUsingObject(context);
  if (scenes) {
    const sceneNames = new Set(scenes.map(scene => scene.getName()));
    return [
      ...scenes.map(scene => scene.getEvents()),
      ...mapFor(0, project.getExternalEventsCount(), i =>
        project.getExternalEventsAt(i)
      )
        .filter(externalEvents =>
          sceneNames.has(externalEvents.getAssociatedLayout())
        )
        .map(externalEvents => externalEvents.getEvents()),
    ];
  }
  if (!eventsBasedObject) return [];
  const eventsFunctions = eventsBasedObject.getEventsFunctions();
  return mapFor(0, eventsFunctions.getEventsFunctionsCount(), i =>
    eventsFunctions.getEventsFunctionAt(i).getEvents()
  );
};

/**
 * The names, among the given ones, written as a text in the events that can
 * refer to the object. A name used for another object counts too: when in
 * doubt, a name is considered used.
 */
export const getNamesUsedInObjectEvents = (
  context: ObjectReferencesContext,
  names: Array<string>
): Set<string> => {
  if (names.length === 0) return new Set();
  const eventsTexts = getEventsListsUsingObject(context).map(eventsList =>
    JSON.stringify(serializeToJSObject(eventsList))
  );
  return new Set(
    names.filter(name => {
      // The text "Name", with its quotes, as it appears in the JSON of the
      // events.
      const quotedName = JSON.stringify(JSON.stringify(name)).slice(1, -1);
      return eventsTexts.some(eventsText => eventsText.includes(quotedName));
    })
  );
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

/**
 * The instances placed from the object configuration: in its scenes and the
 * external layouts associated with them (for a global object, also the
 * external layouts associated with no scene), or in the variant of the custom
 * object holding the configuration (each variant has its own children).
 */
const getInstancesOfObject = (
  context: ObjectReferencesContext,
  eventsBasedObjectVariant: ?gdEventsBasedObjectVariant
): Array<gdInitialInstance> => {
  const { project, object } = context;
  const objectName = object.getName();
  const scenes = getScenesUsingObject(context);
  if (!scenes) {
    return eventsBasedObjectVariant
      ? getInstancesInLayoutForObject(
          eventsBasedObjectVariant.getInitialInstances(),
          objectName
        )
      : [];
  }
  const associatedSceneNames = scenes.map(scene => scene.getName());
  if (isGlobalObject(project, object)) associatedSceneNames.push('');
  const externalLayouts = mapFor(0, project.getExternalLayoutsCount(), i =>
    project.getExternalLayoutAt(i)
  ).filter(externalLayout =>
    associatedSceneNames.includes(externalLayout.getAssociatedLayout())
  );
  return [
    ...scenes.map(scene => scene.getInitialInstances()),
    ...externalLayouts.map(externalLayout =>
      externalLayout.getInitialInstances()
    ),
  ].flatMap(initialInstances =>
    getInstancesInLayoutForObject(initialInstances, objectName)
  );
};

/**
 * The instances starting with one of the animations of the object (see
 * `getInstancesOfObject`). Empty for objects whose instances have no starting
 * animation (3D models). To call before changing the animations: a custom
 * object without animations has no starting animation.
 */
export const getInstancesWithStartingAnimation = (
  context: ObjectReferencesContext,
  eventsBasedObjectVariant: ?gdEventsBasedObjectVariant
): Array<gdInitialInstance> => {
  const instances = getInstancesOfObject(context, eventsBasedObjectVariant);
  return instances.length > 0 &&
    context.object
      .getConfiguration()
      .getInitialInstanceProperties(instances[0])
      .has('animation')
    ? instances
    : [];
};

/**
 * Keeps the starting animation of each instance after the object animations
 * were reordered or removed: the instance keeps the animation of the same
 * name, or starts with the first one when its animation was removed. Among
 * unnamed or same-named animations, the n-th of that name stays the n-th.
 */
export const remapStartingAnimations = (
  instances: Array<gdInitialInstance>,
  oldAnimationNames: Array<string>,
  newAnimationNames: Array<string>
): {| remappedInstancesCount: number, resetInstancesCount: number |} => {
  let remappedInstancesCount = 0;
  let resetInstancesCount = 0;
  instances.forEach(instance => {
    // The runtime truncates the index, and an instance without the property
    // starts with the first animation (0).
    const oldIndex = Math.trunc(instance.getRawDoubleProperty('animation'));
    const animationName = oldAnimationNames[oldIndex];
    // An index out of the list was already showing no animation of the list.
    if (animationName === undefined) return;
    const occurrence = oldAnimationNames
      .slice(0, oldIndex)
      .filter(name => name === animationName).length;
    const newIndexesOfName = newAnimationNames
      .map((name, index) => (name === animationName ? index : -1))
      .filter(index => index !== -1);
    const newIndex =
      occurrence < newIndexesOfName.length ? newIndexesOfName[occurrence] : -1;
    if (newIndex === -1) {
      instance.setRawDoubleProperty('animation', 0);
      resetInstancesCount++;
    } else if (newIndex !== oldIndex) {
      instance.setRawDoubleProperty('animation', newIndex);
      remappedInstancesCount++;
    }
  });
  return { remappedInstancesCount, resetInstancesCount };
};
