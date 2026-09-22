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
  // Called once the changes made to the variables container were applied
  // to the project.
  onRefactoringApplied?: () => void,
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
 * On unmount, pending refactoring is cancelled (not applied) because the
 * underlying C++ object may already be deleted.
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
  onRefactoringApplied,
}: Props): {|
  onVariablesUpdated: () => void,
  // Apply now the refactoring of the changes made *before the last one*,
  // if it is still pending - so that two changes that must stay separate
  // (like for the history) are not applied as a single one.
  applyPendingRefactoringOfPreviousChanges: () => void,
|} => {
  const snapshotRef = React.useRef<gdSerializerElement | null>(null);
  // The state of the variables container after the last change.
  const lastChangeSnapshotRef = React.useRef<gdSerializerElement | null>(null);
  const timerRef = React.useRef<TimeoutID | null>(null);

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

  // Keep a ref to variablesContainer so the debounced callback always
  // accesses the current one without needing it in its dependency array.
  const variablesContainerRef = React.useRef<gdVariablesContainer>(
    variablesContainer
  );
  variablesContainerRef.current = variablesContainer;
  const onRefactoringAppliedRef = React.useRef<?() => void>(
    onRefactoringApplied
  );
  onRefactoringAppliedRef.current = onRefactoringApplied;

  // `changedVariablesContainer` is the variables container with the changes
  // to apply (by default, the edited one in its current state).
  const applyPendingRefactoring = React.useCallback(
    (changedVariablesContainer?: gdVariablesContainer) => {
      const snapshot = snapshotRef.current;
      const variablesContainer = exceptionallyGuardAgainstDeadObject(
        changedVariablesContainer || variablesContainerRef.current
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
        } = context.current;

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

      if (onRefactoringAppliedRef.current) onRefactoringAppliedRef.current();
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
      snapshotRef.current = snapshot;

      return () => {
        // Cancel any pending debounced refactoring — the C++ object may
        // already be deleted (e.g., the object was removed), so we must
        // not attempt to access it.
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        // Free the snapshots C++ memory.
        if (snapshotRef.current) {
          snapshotRef.current.delete();
          snapshotRef.current = null;
        }
        if (lastChangeSnapshotRef.current) {
          lastChangeSnapshotRef.current.delete();
          lastChangeSnapshotRef.current = null;
        }
      };
    },
    [variablesContainer, enabled]
  );

  const applyPendingRefactoringOfPreviousChanges = React.useCallback(
    () => {
      const lastChangeSnapshot = lastChangeSnapshotRef.current;
      if (!timerRef.current || !lastChangeSnapshot) return;

      // The edited container already has the last change: rebuild the
      // container as it was just before.
      const previousVariablesContainer = new gd.VariablesContainer(
        variablesContainerRef.current.getSourceType()
      );
      previousVariablesContainer.unserializeFrom(lastChangeSnapshot);
      applyPendingRefactoring(previousVariablesContainer);
      previousVariablesContainer.delete();
    },
    [applyPendingRefactoring]
  );

  const onVariablesUpdated = React.useCallback(
    () => {
      if (!snapshotRef.current) return;

      const variablesContainer = exceptionallyGuardAgainstDeadObject(
        variablesContainerRef.current
      );
      if (variablesContainer) {
        if (lastChangeSnapshotRef.current)
          lastChangeSnapshotRef.current.delete();
        variablesContainer.ensurePersistentUuids();
        const lastChangeSnapshot = new gd.SerializerElement();
        variablesContainer.serializeTo(lastChangeSnapshot);
        lastChangeSnapshotRef.current = lastChangeSnapshot;
      }

      // Reset the debounce timer on each mutation.
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        applyPendingRefactoring();
      }, REFACTORING_DEBOUNCE_MS);
    },
    [applyPendingRefactoring]
  );

  return { onVariablesUpdated, applyPendingRefactoringOfPreviousChanges };
};

export default useVariablesContainerRefactoring;
