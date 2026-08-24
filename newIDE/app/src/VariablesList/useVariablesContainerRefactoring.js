// @flow
import * as React from 'react';
import { exceptionallyGuardAgainstDeadObject } from '../Utils/IsNullPtr';

const gd: libGDevelop = global.gd;

const REFACTORING_DEBOUNCE_MS = 200;

type Context = {
  project: gdProject,
  initialInstances: gdInitialInstancesContainer | null,
  eventsBasedObject: gdEventsBasedObject | null,

  // Only for object groups
  objectsContainer: gdObjectsContainer | null,
  globalObjectsContainer: gdObjectsContainer | null,
};

type Props = {
  ...Context,
  variablesContainer: gdVariablesContainer,
  objectName: string | null,
  objectGroup: gdObjectGroup | null,
  enabled: boolean,
};

/**
 * The variables being edited, and their state the last time they were applied.
 * Everything needed to apply the changes is snapshotted together, so that a
 * change is always applied to what it was made on - even if another object or
 * another group is selected in the meantime.
 */
type TrackedChanges = {|
  variablesContainer: gdVariablesContainer,
  snapshot: gdSerializerElement | null,
  objectName: string | null,
  objectGroupName: string | null,
  timeoutId: TimeoutID | null,
|};

/**
 * Object groups are not tracked in memory, so they can't be checked for being
 * still alive: find the group again from its name instead (it's gone if the
 * group was removed while a change was waiting to be applied).
 */
const findObjectGroup = (
  objectGroupName: string,
  objectsContainer: ?gdObjectsContainer,
  globalObjectsContainer: ?gdObjectsContainer
): gdObjectGroup | null => {
  for (const container of [objectsContainer, globalObjectsContainer]) {
    if (!container) continue;
    const objectGroups = container.getObjectGroups();
    if (objectGroups.has(objectGroupName))
      return objectGroups.get(objectGroupName);
  }

  return null;
};

/**
 * Hook that manages the lifecycle of variable refactoring for a properties
 * panel (where changes are applied immediately, without an Apply/Cancel dialog).
 *
 * It snapshots the variables container when the container identity changes
 * (i.e., a different object is selected) or when the component mounts.
 * After each variable mutation (signaled by `onVariablesUpdated`), it waits
 * 200ms then computes the changeset, applies refactoring, and takes a fresh
 * snapshot for the next cycle.
 *
 * The pending refactoring is also applied when another object/group is selected
 * or when the component is unmounted: for object groups, the variables are
 * edited in a temporary container, so *not* applying the changes would simply
 * lose them.
 */
const useVariablesContainerRefactoring = ({
  project,
  variablesContainer,
  initialInstances,
  objectName,
  eventsBasedObject,
  enabled,
  objectGroup,
  objectsContainer,
  globalObjectsContainer,
}: Props): {|
  onVariablesUpdated: () => void,
  applyPendingChanges: () => void,
  resetChangesTracking: () => void,
  isTrackingChangesOf: (variablesContainer: gdVariablesContainer) => boolean,
  hasPendingChanges: () => boolean,
|} => {
  const trackedChangesRef = React.useRef<TrackedChanges | null>(null);

  // Use refs for values that should not trigger the effect to re-run,
  // but need to be accessible in the refactoring callback.
  const context = React.useRef<Context>({
    project,
    initialInstances,
    eventsBasedObject,
    objectsContainer,
    globalObjectsContainer,
  });
  context.current.project = project;
  context.current.initialInstances = initialInstances;
  context.current.eventsBasedObject = eventsBasedObject;
  context.current.objectsContainer = objectsContainer;
  context.current.globalObjectsContainer = globalObjectsContainer;

  // The same object/group is still being edited (the container identity is what
  // identifies it): keep its name up to date, as it changes when it's renamed.
  // The name of *another* object/group must not be picked up here: the changes
  // waiting to be applied were made on this one.
  if (
    trackedChangesRef.current &&
    trackedChangesRef.current.variablesContainer === variablesContainer
  ) {
    trackedChangesRef.current.objectName = objectName;
    trackedChangesRef.current.objectGroupName = objectGroup
      ? objectGroup.getName()
      : null;
  }

  /**
   * Apply the changes made to the variables since the last snapshot, then take
   * a fresh snapshot for the next cycle (unless the variables are not edited
   * anymore, in which case there is no next cycle).
   */
  const applyChanges = React.useCallback(
    (
      trackedChanges: TrackedChanges,
      { keepTracking }: {| keepTracking: boolean |}
    ) => {
      const { snapshot, objectGroupName } = trackedChanges;
      if (!snapshot) return;

      const variablesContainer = exceptionallyGuardAgainstDeadObject(
        trackedChanges.variablesContainer
      );
      const project = exceptionallyGuardAgainstDeadObject(
        context.current.project
      );

      if (variablesContainer && project) {
        try {
          const changeset = gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
            snapshot,
            variablesContainer
          );

          const { eventsBasedObject } = context.current;
          const initialInstances = exceptionallyGuardAgainstDeadObject(
            context.current.initialInstances
          );
          const objectsContainer = exceptionallyGuardAgainstDeadObject(
            context.current.objectsContainer
          );
          const globalObjectsContainer = exceptionallyGuardAgainstDeadObject(
            context.current.globalObjectsContainer
          );
          const objectGroup = objectGroupName
            ? findObjectGroup(
                objectGroupName,
                objectsContainer,
                globalObjectsContainer
              )
            : null;
          const { objectName } = trackedChanges;

          if (objectGroup && initialInstances && objectsContainer) {
            gd.WholeProjectRefactorer.applyRefactoringForGroupVariablesContainer(
              project,
              globalObjectsContainer || objectsContainer,
              objectsContainer,
              initialInstances,
              variablesContainer,
              objectGroup,
              changeset,
              snapshot
            );
            if (eventsBasedObject) {
              for (const objectName of objectGroup
                .getAllObjectsNames()
                .toJSArray()) {
                gd.ObjectRefactorer.applyChangesToVariants(
                  eventsBasedObject,
                  objectName,
                  changeset
                );
              }
            }
          } else if (objectName && initialInstances) {
            gd.WholeProjectRefactorer.applyRefactoringForObjectVariablesContainer(
              project,
              variablesContainer,
              initialInstances,
              objectName,
              changeset,
              snapshot
            );
            if (eventsBasedObject) {
              gd.ObjectRefactorer.applyChangesToVariants(
                eventsBasedObject,
                objectName,
                changeset
              );
            }
          } else if (!objectName && !objectGroupName) {
            gd.WholeProjectRefactorer.applyRefactoringForVariablesContainer(
              project,
              variablesContainer,
              changeset,
              snapshot
            );
          }
        } catch (error) {
          console.error('Error applying variable refactoring:', error);
        }
      }

      snapshot.delete();
      if (!keepTracking || !variablesContainer) {
        trackedChanges.snapshot = null;
        return;
      }

      // Take a fresh snapshot for the next cycle. Only ensure UUIDs are set
      // (for newly added variables) - existing UUIDs are preserved, as they
      // are persisted in the project file and must stay stable to avoid
      // useless changes in it.
      variablesContainer.ensurePersistentUuids();
      const newSnapshot = new gd.SerializerElement();
      variablesContainer.serializeTo(newSnapshot);
      trackedChanges.snapshot = newSnapshot;
    },
    []
  );

  React.useEffect(
    () => {
      if (!enabled) return;

      // Setup: snapshot the current state of the variables container.
      // Only ensure UUIDs are set (for variables that don't have one yet) -
      // existing UUIDs are preserved, as they are persisted in the project
      // file and must stay stable to avoid useless changes in it.
      variablesContainer.ensurePersistentUuids();
      const snapshot = new gd.SerializerElement();
      variablesContainer.serializeTo(snapshot);

      const trackedChanges: TrackedChanges = {
        variablesContainer,
        snapshot,
        objectName,
        // Read the name now, while the group is known to be alive.
        objectGroupName: objectGroup ? objectGroup.getName() : null,
        timeoutId: null,
      };
      trackedChangesRef.current = trackedChanges;

      return () => {
        trackedChangesRef.current = null;

        if (trackedChanges.timeoutId) {
          clearTimeout(trackedChanges.timeoutId);
          trackedChanges.timeoutId = null;

          // Don't lose the changes waiting to be applied: for object groups,
          // they only exist in the (temporary) container of the group until
          // they are applied to its objects.
          applyChanges(trackedChanges, { keepTracking: false });
          return;
        }

        // Free the snapshot C++ memory.
        if (trackedChanges.snapshot) {
          trackedChanges.snapshot.delete();
          trackedChanges.snapshot = null;
        }
      };
    },
    // The container identity is what identifies the object/group being edited:
    // a rename must *not* restart the tracking (see the name sync above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [variablesContainer, enabled, applyChanges]
  );

  const onVariablesUpdated = React.useCallback(
    () => {
      const trackedChanges = trackedChangesRef.current;
      if (!trackedChanges) return;

      // Reset the debounce timer on each mutation.
      if (trackedChanges.timeoutId) {
        clearTimeout(trackedChanges.timeoutId);
      }
      trackedChanges.timeoutId = setTimeout(() => {
        trackedChanges.timeoutId = null;
        applyChanges(trackedChanges, { keepTracking: true });
      }, REFACTORING_DEBOUNCE_MS);
    },
    [applyChanges]
  );

  const applyPendingChanges = React.useCallback(
    () => {
      const trackedChanges = trackedChangesRef.current;
      if (!trackedChanges || !trackedChanges.timeoutId) return;

      clearTimeout(trackedChanges.timeoutId);
      trackedChanges.timeoutId = null;
      applyChanges(trackedChanges, { keepTracking: true });
    },
    [applyChanges]
  );

  const resetChangesTracking = React.useCallback(() => {
    const trackedChanges = trackedChangesRef.current;
    if (!trackedChanges) return;

    if (trackedChanges.timeoutId) {
      clearTimeout(trackedChanges.timeoutId);
      trackedChanges.timeoutId = null;
    }
    if (trackedChanges.snapshot) {
      trackedChanges.snapshot.delete();
      trackedChanges.snapshot = null;
    }

    const variablesContainer = exceptionallyGuardAgainstDeadObject(
      trackedChanges.variablesContainer
    );
    if (!variablesContainer) return;

    variablesContainer.ensurePersistentUuids();
    const snapshot = new gd.SerializerElement();
    variablesContainer.serializeTo(snapshot);
    trackedChanges.snapshot = snapshot;
  }, []);

  const isTrackingChangesOf = React.useCallback(
    (variablesContainer: gdVariablesContainer) => {
      const trackedChanges = trackedChangesRef.current;

      return (
        !!trackedChanges &&
        trackedChanges.variablesContainer === variablesContainer
      );
    },
    []
  );

  const hasPendingChanges = React.useCallback(() => {
    const trackedChanges = trackedChangesRef.current;

    return !!trackedChanges && !!trackedChanges.timeoutId;
  }, []);

  return {
    onVariablesUpdated,
    applyPendingChanges,
    resetChangesTracking,
    isTrackingChangesOf,
    hasPendingChanges,
  };
};

export default useVariablesContainerRefactoring;
