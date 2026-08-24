// @flow
import * as React from 'react';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import useVariablesContainerRefactoring from './useVariablesContainerRefactoring';

const gd: libGDevelop = global.gd;

/**
 * Replace the content of `groupVariablesContainer` by the variables that all
 * the objects of `objectGroup` have in common (with the "mixed types"/"mixed
 * values" markers for the variables that don't have the same type/value on all
 * the objects of the group).
 *
 * ⚠️ `gd.ObjectRefactorer.mergeVariableContainers` returns the container **by
 * value**: the bindings store the returned value in a single instance, which is
 * reused by every call. In other words, the container it returns is shared
 * between all the callers: as soon as anything else computes the variables of a
 * group (another editor, the AI features building a simplified project...), its
 * content is silently replaced.
 * This is why the container is copied here: an editor must own the container it
 * is displaying, otherwise the variables being edited are replaced, without any
 * warning, by the variables of the objects - i.e: the state *before* the changes
 * made by the user (which are then lost, as they were never applied to the
 * objects of the group).
 */
const fillWithGroupVariables = (
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  objectGroup: gdObjectGroup,
  groupVariablesContainer: gdVariablesContainer
) => {
  const sharedGroupVariablesContainer = gd.ObjectRefactorer.mergeVariableContainers(
    projectScopedContainersAccessor.get().getObjectsContainersList(),
    objectGroup
  );

  // Serializing is used to copy the container, as it's the only way to keep
  // *everything* - notably the persistent UUIDs (which are used to track the
  // variables when applying the changes to the objects of the group) and the
  // editor-only "mixed values" markers.
  const serializedElement = new gd.SerializerElement();
  try {
    sharedGroupVariablesContainer.serializeTo(serializedElement);
    groupVariablesContainer.unserializeFrom(serializedElement);
  } finally {
    serializedElement.delete();
  }
};

/**
 * Create a container, owned by the caller, with the variables that all the
 * objects of the group have in common. It must be deleted when not used
 * anymore (which the hooks below take care of).
 */
const createGroupVariablesContainer = (
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  objectGroup: gdObjectGroup
): gdVariablesContainer => {
  const groupVariablesContainer = new gd.VariablesContainer(
    gd.VariablesContainer.Object
  );
  fillWithGroupVariables(
    projectScopedContainersAccessor,
    objectGroup,
    groupVariablesContainer
  );

  return groupVariablesContainer;
};

type OwnedGroupVariablesContainer = {|
  groupVariablesContainerRef: {| current: gdVariablesContainer | null |},
  groupVariablesContainer: gdVariablesContainer,
  refreshGroupVariablesContainer: () => void,
|};

/**
 * Give a container, owned by the component, with the variables common to all
 * the objects of the group.
 *
 * The container is created during the render (it's needed to display the list
 * of variables) and only recreated when another group is edited: it must stay
 * stable while a group is edited, otherwise the changes not applied to the
 * objects of the group yet would be discarded.
 *
 * The deletion of the container is *not* handled here (see
 * `useDeleteGroupVariablesContainerOnUnmount`), because it must happen after
 * the cleanup of the effects declared by the callers (which can still need it).
 */
const useOwnedGroupVariablesContainer = ({
  projectScopedContainersAccessor,
  objectGroup,
}: {|
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  objectGroup: gdObjectGroup,
|}): OwnedGroupVariablesContainer => {
  const groupVariablesContainerRef = React.useRef<gdVariablesContainer | null>(
    null
  );
  const objectGroupPtrRef = React.useRef<number | null>(null);
  const containersToDeleteRef = React.useRef<Array<gdVariablesContainer>>([]);

  // The accessor is recreated at each render of the editors: keep a ref to it
  // so that a refresh always reads the up to date objects.
  const projectScopedContainersAccessorRef = React.useRef(
    projectScopedContainersAccessor
  );
  projectScopedContainersAccessorRef.current = projectScopedContainersAccessor;

  if (
    groupVariablesContainerRef.current === null ||
    objectGroupPtrRef.current !== objectGroup.ptr
  ) {
    const previousGroupVariablesContainer = groupVariablesContainerRef.current;
    if (previousGroupVariablesContainer) {
      // Don't delete it now: it's still needed by the cleanup functions of the
      // effects declared for the previously edited group (they run after this
      // render, before any effect of this render).
      containersToDeleteRef.current.push(previousGroupVariablesContainer);
    }
    groupVariablesContainerRef.current = createGroupVariablesContainer(
      projectScopedContainersAccessor,
      objectGroup
    );
    objectGroupPtrRef.current = objectGroup.ptr;
  }
  const groupVariablesContainer = groupVariablesContainerRef.current;
  if (!groupVariablesContainer) {
    throw new Error(
      'The variables container of the group was just created and should not be null.'
    );
  }

  React.useEffect(() => {
    // Runs after every render, i.e: after the cleanup functions of the effects
    // declared for the previously edited group. The containers of these groups
    // are not used anymore and can be deleted.
    const containersToDelete = containersToDeleteRef.current;
    containersToDeleteRef.current = [];
    containersToDelete.forEach(containerToDelete => containerToDelete.delete());
  });

  const refreshGroupVariablesContainer = React.useCallback(
    () => {
      const groupVariablesContainer = groupVariablesContainerRef.current;
      if (!groupVariablesContainer) return;

      fillWithGroupVariables(
        projectScopedContainersAccessorRef.current,
        objectGroup,
        groupVariablesContainer
      );
    },
    [objectGroup]
  );

  return {
    groupVariablesContainerRef,
    groupVariablesContainer,
    refreshGroupVariablesContainer,
  };
};

/**
 * Delete the container owned by `useOwnedGroupVariablesContainer` when the
 * component is unmounted. This must be the **last** effect declared by the
 * component using the container, so that the cleanup functions needing the
 * container (like the one applying the pending variable changes to the objects
 * of the group) run before it's deleted.
 */
const useDeleteGroupVariablesContainerOnUnmount = (groupVariablesContainerRef: {|
  current: gdVariablesContainer | null,
|}) => {
  React.useEffect(
    () => {
      return () => {
        const containerToDelete = groupVariablesContainerRef.current;
        groupVariablesContainerRef.current = null;
        if (containerToDelete) containerToDelete.delete();
      };
    },
    [groupVariablesContainerRef]
  );
};

export type GroupVariablesContainerHandler = {|
  /**
   * The variables common to all the objects of the group, in a container owned
   * by the component. It stays the same as long as the same group is edited,
   * and its content is only changed by the user: an editor with "Apply"/"Cancel"
   * buttons must show the variables as they were when it was opened.
   */
  groupVariablesContainer: gdVariablesContainer,
|};

/**
 * Hook to be used by an editor applying the changes made to the variables of a
 * group only when they are validated (a dialog with "Apply"/"Cancel" buttons).
 */
export const useGroupVariablesContainer = ({
  projectScopedContainersAccessor,
  objectGroup,
}: {|
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  objectGroup: gdObjectGroup,
|}): GroupVariablesContainerHandler => {
  const {
    groupVariablesContainerRef,
    groupVariablesContainer,
  } = useOwnedGroupVariablesContainer({
    projectScopedContainersAccessor,
    objectGroup,
  });
  useDeleteGroupVariablesContainerOnUnmount(groupVariablesContainerRef);

  return { groupVariablesContainer };
};

export type GroupVariablesEditingHandler = {|
  /**
   * The variables common to all the objects of the group, in a container owned
   * by the component.
   */
  groupVariablesContainer: gdVariablesContainer,

  /**
   * To be given to the list of variables, so that the changes are applied to
   * the objects of the group (shortly) after each of them.
   */
  onVariablesUpdated: () => void,

  /**
   * Apply the changes waiting to be applied to the objects of the group, if
   * any. Call this before changing the objects of the group, as it changes the
   * variables they have in common.
   */
  applyPendingVariablesChanges: () => void,
|};

/**
 * Hook to be used by an editor applying the changes made to the variables of a
 * group immediately (a properties panel, without "Apply"/"Cancel" buttons).
 */
export const useGroupVariablesEditing = ({
  project,
  projectScopedContainersAccessor,
  objectGroup,
  objectsContainer,
  globalObjectsContainer,
  initialInstances,
  eventsBasedObject,
}: {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  objectGroup: gdObjectGroup,
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  initialInstances: gdInitialInstancesContainer | null,
  eventsBasedObject: gdEventsBasedObject | null,
|}): GroupVariablesEditingHandler => {
  const {
    groupVariablesContainerRef,
    groupVariablesContainer,
    refreshGroupVariablesContainer,
  } = useOwnedGroupVariablesContainer({
    projectScopedContainersAccessor,
    objectGroup,
  });

  const {
    onVariablesUpdated,
    applyPendingChanges,
    resetChangesTracking,
    isTrackingChangesOf,
    hasPendingChanges,
  } = useVariablesContainerRefactoring({
    project,
    variablesContainer: groupVariablesContainer,
    initialInstances,
    eventsBasedObject,
    enabled: true,
    objectGroup,
    objectsContainer,
    globalObjectsContainer,
    objectName: null,
  });

  // The variables of a group are not stored anywhere: they are the variables
  // that all its objects have in common. So they must be recomputed to display
  // the changes made elsewhere (in the group editor dialog, by an undo, by an
  // object added to or removed from the group...).
  //
  // This must *not* be done while some changes are waiting to be applied to the
  // objects of the group: these changes only exist in this container, so they
  // would be silently replaced by the variables of the objects - i.e: lost.
  if (isTrackingChangesOf(groupVariablesContainer) && !hasPendingChanges()) {
    refreshGroupVariablesContainer();
    // The variables were just read from the objects of the group: there is
    // nothing to apply back to them.
    resetChangesTracking();
  }

  // Must stay the last effect declared by this hook: the container is needed
  // by the cleanup of `useVariablesContainerRefactoring` (which applies the
  // pending changes to the objects of the group).
  useDeleteGroupVariablesContainerOnUnmount(groupVariablesContainerRef);

  return {
    groupVariablesContainer,
    onVariablesUpdated,
    applyPendingVariablesChanges: applyPendingChanges,
  };
};
