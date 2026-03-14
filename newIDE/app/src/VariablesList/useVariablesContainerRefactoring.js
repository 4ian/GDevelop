// @flow
import * as React from 'react';

const gd: libGDevelop = global.gd;

const REFACTORING_DEBOUNCE_MS = 200;

type Props = {|
  project: gdProject,
  variablesContainer: gdVariablesContainer,
  initialInstances: ?gdInitialInstancesContainer,
  objectName: ?string,
  eventsBasedObject: ?gdEventsBasedObject,
  enabled: boolean,
|};

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
}: Props): {|
  onVariablesUpdated: () => void,
|} => {
  const snapshotRef = React.useRef<gdSerializerElement | null>(null);
  const timerRef = React.useRef<TimeoutID | null>(null);

  // Use refs for values that should not trigger the effect to re-run,
  // but need to be accessible in the refactoring callback.
  const projectRef = React.useRef<gdProject>(project);
  projectRef.current = project;

  const initialInstancesRef = React.useRef<?gdInitialInstancesContainer>(
    initialInstances
  );
  initialInstancesRef.current = initialInstances;

  const objectNameRef = React.useRef<?string>(objectName);
  objectNameRef.current = objectName;

  const eventsBasedObjectRef = React.useRef<?gdEventsBasedObject>(
    eventsBasedObject
  );
  eventsBasedObjectRef.current = eventsBasedObject;

  // Keep a ref to variablesContainer so the debounced callback always
  // accesses the current one without needing it in its dependency array.
  const variablesContainerRef = React.useRef<gdVariablesContainer>(
    variablesContainer
  );
  variablesContainerRef.current = variablesContainer;

  const applyPendingRefactoring = React.useCallback(() => {
    const snapshot = snapshotRef.current;
    const container = variablesContainerRef.current;
    if (!snapshot) return;

    try {
      const changeset = gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
        snapshot,
        container
      );

      const currentObjectName = objectNameRef.current;
      const currentInitialInstances = initialInstancesRef.current;
      const currentProject = projectRef.current;

      if (currentObjectName && currentInitialInstances) {
        gd.WholeProjectRefactorer.applyRefactoringForObjectVariablesContainer(
          currentProject,
          container,
          currentInitialInstances,
          currentObjectName,
          changeset,
          snapshot
        );
        const currentEventsBasedObject = eventsBasedObjectRef.current;
        if (currentEventsBasedObject) {
          gd.ObjectVariableHelper.applyChangesToVariants(
            currentEventsBasedObject,
            currentObjectName,
            changeset
          );
        }
      } else {
        gd.WholeProjectRefactorer.applyRefactoringForVariablesContainer(
          currentProject,
          container,
          changeset,
          snapshot
        );
      }
    } catch (error) {
      console.error(
        'Error applying variable refactoring:',
        error
      );
    }

    // Take a fresh snapshot for the next cycle.
    snapshot.delete();
    container.clearPersistentUuid();
    container.resetPersistentUuid();
    const newSnapshot = new gd.SerializerElement();
    container.serializeTo(newSnapshot);
    snapshotRef.current = newSnapshot;
  }, []);

  React.useEffect(
    () => {
      if (!enabled) return;

      // Setup: snapshot the current state of the variables container.
      variablesContainer.resetPersistentUuid();
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

        // Try to clear persistent UUIDs so they are not persisted in the
        // project file. This may fail if the object was already deleted.
        try {
          variablesContainer.clearPersistentUuid();
        } catch (error) {
          // The container might already be deleted.
        }

        // Free the snapshot C++ memory.
        if (snapshotRef.current) {
          snapshotRef.current.delete();
          snapshotRef.current = null;
        }
      };
    },
    [variablesContainer, enabled]
  );

  const onVariablesUpdated = React.useCallback(
    () => {
      if (!snapshotRef.current) return;

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

  return { onVariablesUpdated };
};

export default useVariablesContainerRefactoring;
