// @flow
import * as React from 'react';
import { exceptionallyGuardAgainstDeadObject } from '../Utils/IsNullPtr';

const gd: libGDevelop = global.gd;

const REFACTORING_DEBOUNCE_MS = 200;

type Context = {
  project: gdProject,
  initialInstances: gdInitialInstancesContainer | null,
  objectName: string | null,
  eventsBasedObject: gdEventsBasedObject | null,

  // Only for object groups
  objectGroup: gdObjectGroup | null,
  objectsContainer: gdObjectsContainer | null,
  globalObjectsContainer: gdObjectsContainer | null,
};

type Props = {
  ...Context,
  variablesContainer: gdVariablesContainer,
  enabled: boolean,
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
 * When the container identity changes or the component unmounts, any pending
 * refactoring is applied immediately (flushed) rather than dropped, so that
 * an edit made just before a selection change (or a rebuild of a temporary
 * merged container, in the case of object groups) is not lost. The pending
 * refactoring captured the container and context it relates to, and is
 * guarded against the underlying C++ objects being already deleted.
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
  flushPendingRefactoring: () => void,
|} => {
  const snapshotRef = React.useRef<gdSerializerElement | null>(null);
  const timerRef = React.useRef<TimeoutID | null>(null);
  // The refactoring waiting to be applied, if any. It captures the variables
  // container and the context it relates to, so it can safely be flushed
  // even after the props changed (e.g., another object was just selected).
  const pendingApplyRef = React.useRef<(() => void) | null>(null);

  // Use refs for values that should not trigger the effect to re-run,
  // but need to be accessible in the refactoring callback.
  const context = React.useRef<Context>({
    project,
    initialInstances,
    objectName,
    eventsBasedObject,
    objectGroup,
    objectsContainer,
    globalObjectsContainer,
  });
  context.current.project = project;
  context.current.initialInstances = initialInstances;
  context.current.objectName = objectName;
  context.current.eventsBasedObject = eventsBasedObject;
  context.current.objectGroup = objectGroup;
  context.current.objectsContainer = objectsContainer;
  context.current.globalObjectsContainer = globalObjectsContainer;

  // Keep a ref to variablesContainer so a mutation notification always
  // captures the current one without needing it in a dependency array.
  const variablesContainerRef = React.useRef<gdVariablesContainer>(
    variablesContainer
  );
  variablesContainerRef.current = variablesContainer;

  const applyRefactoring = React.useCallback(
    (
      variablesContainerAtScheduling: gdVariablesContainer,
      contextAtScheduling: Context
    ) => {
      const snapshot = snapshotRef.current;
      const variablesContainer = exceptionallyGuardAgainstDeadObject(
        variablesContainerAtScheduling
      );
      if (!snapshot || !variablesContainer) return;

      try {
        const changeset = gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
          snapshot,
          variablesContainer
        );

        const {
          project,
          initialInstances,
          objectName,
          objectGroup,
          eventsBasedObject,
          objectsContainer,
          globalObjectsContainer,
        } = contextAtScheduling;

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
        } else {
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

      // Take a fresh snapshot for the next cycle. Only ensure UUIDs are set
      // (for newly added variables) - existing UUIDs are preserved, as they
      // are persisted in the project file and must stay stable to avoid
      // useless changes in it.
      snapshot.delete();
      variablesContainer.ensurePersistentUuids();
      const newSnapshot = new gd.SerializerElement();
      variablesContainer.serializeTo(newSnapshot);
      snapshotRef.current = newSnapshot;
    },
    []
  );

  const flushPendingRefactoring = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const pendingApply = pendingApplyRef.current;
    pendingApplyRef.current = null;
    if (pendingApply) pendingApply();
  }, []);

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
      snapshotRef.current = snapshot;

      return () => {
        // Apply any pending debounced refactoring now, so that an edit made
        // just before the container changes (or the component unmounts) is
        // not lost. This is notably important for object groups, where the
        // edited container is a temporary merged container: edits only reach
        // the objects of the group when the refactoring is applied.
        flushPendingRefactoring();

        // Free the snapshot C++ memory.
        if (snapshotRef.current) {
          snapshotRef.current.delete();
          snapshotRef.current = null;
        }
      };
    },
    [variablesContainer, enabled, flushPendingRefactoring]
  );

  const onVariablesUpdated = React.useCallback(
    () => {
      if (!snapshotRef.current) return;

      // Capture the container and context now: if another object or group is
      // selected before the debounced refactoring runs, it must still be
      // applied to the container it relates to (see flushPendingRefactoring).
      const variablesContainerAtScheduling = variablesContainerRef.current;
      const contextAtScheduling = { ...context.current };
      pendingApplyRef.current = () =>
        applyRefactoring(variablesContainerAtScheduling, contextAtScheduling);

      // Reset the debounce timer on each mutation.
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const pendingApply = pendingApplyRef.current;
        pendingApplyRef.current = null;
        if (pendingApply) pendingApply();
      }, REFACTORING_DEBOUNCE_MS);
    },
    [applyRefactoring]
  );

  return { onVariablesUpdated, flushPendingRefactoring };
};

export default useVariablesContainerRefactoring;
