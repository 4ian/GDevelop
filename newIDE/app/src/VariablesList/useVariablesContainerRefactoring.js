// @flow
import * as React from 'react';

const gd: libGDevelop = global.gd;

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
 * (i.e., a different object is selected) or when the component mounts, and
 * applies refactoring when the container identity changes again or the
 * component unmounts.
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
  const hasChangesRef = React.useRef<boolean>(false);

  // Use refs for values that should not trigger the effect to re-run,
  // but need to be accessible in the cleanup function.
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

  React.useEffect(
    () => {
      if (!enabled) return;

      // Setup: snapshot the current state of the variables container.
      variablesContainer.resetPersistentUuid();
      const snapshotElement = new gd.SerializerElement();
      variablesContainer.serializeTo(snapshotElement);
      hasChangesRef.current = false;

      return () => {
        // Cleanup: apply refactoring if changes were made.
        try {
          if (hasChangesRef.current) {
            const changeset = gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
              snapshotElement,
              variablesContainer
            );

            const currentObjectName = objectNameRef.current;
            const currentInitialInstances = initialInstancesRef.current;
            const currentProject = projectRef.current;

            if (currentObjectName && currentInitialInstances) {
              gd.WholeProjectRefactorer.applyRefactoringForObjectVariablesContainer(
                currentProject,
                variablesContainer,
                currentInitialInstances,
                currentObjectName,
                changeset,
                snapshotElement
              );
              const currentEventsBasedObject =
                eventsBasedObjectRef.current;
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
                variablesContainer,
                changeset,
                snapshotElement
              );
            }

          }
        } catch (error) {
          console.error(
            'Error applying variable refactoring on cleanup:',
            error
          );
        }

        // Always clear persistent UUIDs and free the snapshot.
        try {
          variablesContainer.clearPersistentUuid();
        } catch (error) {
          // The container might already be deleted if the scene was closed.
        }
        snapshotElement.delete();
      };
    },
    // variablesContainer identity changes when a different object is selected.
    // enabled is included so that disabling/enabling properly resets the cycle.
    [variablesContainer, enabled]
  );

  const onVariablesUpdated = React.useCallback(() => {
    hasChangesRef.current = true;
  }, []);

  return { onVariablesUpdated };
};

export default useVariablesContainerRefactoring;
