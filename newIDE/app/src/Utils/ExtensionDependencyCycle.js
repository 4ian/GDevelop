// @flow
import { t } from '@lingui/macro';
import { type ShowAlertDialogOptions } from '../UI/Alert/AlertContext';

const gd: libGDevelop = global.gd;

export type DependencyCycle =
  | {|
      kind: 'extension-dependency',
      /**
       * The extension names forming the cycle, starting and ending with the
       * extension of the edited events-based object
       * (e.g: ['GameManager', 'MainMenu', 'GameManager']).
       */
      extensionNames: Array<string>,
    |}
  | {| kind: 'object-containment' |};

/**
 * Check if adding an object of the given type as a child of the given
 * events-based object would create a dependency cycle, either:
 * - between events functions extensions: extensions forming a cycle can't
 *   be ordered at loading - their entire content would be skipped (and
 *   erased for good at the next save).
 * - between events-based objects: an object containing itself (directly or
 *   indirectly) can't be properly instantiated.
 *
 * Returns the found cycle, or null if the object can safely be added.
 */
export const getDependencyCycleCreatedByObject = (
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,
  objectType: string
): DependencyCycle | null => {
  if (!eventsFunctionsExtension || !eventsBasedObject) {
    // Objects added outside of an events-based object (e.g: in a scene)
    // can't create a cycle.
    return null;
  }

  // Note: the returned VectorString is a value owned by the binding layer
  // (it must not be deleted).
  const extensionNames = gd.EventsBasedObjectDependencyFinder.getExtensionDependencyCycleCreatedByObject(
    project,
    eventsFunctionsExtension.getName(),
    objectType
  ).toJSArray();
  if (extensionNames.length > 0) {
    return { kind: 'extension-dependency', extensionNames };
  }

  if (
    project.hasEventsBasedObject(objectType) &&
    gd.EventsBasedObjectDependencyFinder.isDependentFromEventsBasedObject(
      project,
      project.getEventsBasedObject(objectType),
      eventsBasedObject
    )
  ) {
    return { kind: 'object-containment' };
  }

  return null;
};

/**
 * Build the options of the alert dialog to show when an object can't be
 * added because of a dependency cycle.
 */
export const getDependencyCycleAlertOptions = (
  dependencyCycle: DependencyCycle
): ShowAlertDialogOptions => {
  if (dependencyCycle.kind === 'extension-dependency') {
    const cycleAsText = dependencyCycle.extensionNames.join(' → ');
    return {
      title: t`Circular dependency between extensions`,
      message: t`Using this object here would create a circular dependency between extensions (${cycleAsText}) - the project would not be able to load them anymore. To use this object here, move it to this extension, or reorganize your objects so that dependencies between extensions only go one way.`,
    };
  }
  return {
    title: t`An object can't contain itself`,
    message: t`Using this object here would create an object that directly or indirectly contains itself. Reorganize your objects so that they don't contain each other.`,
  };
};
