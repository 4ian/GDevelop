// @flow
import * as React from 'react';
import ObjectGroupsList, { type ObjectGroupsListInterface } from '.';
import ObjectGroupEditorDialog from '../ObjectGroupEditor/ObjectGroupEditorDialog';
import { type GroupWithContext } from '../ObjectsList/EnumerateObjects';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  globalObjectGroups: gdObjectGroupsContainer | null,
  objectGroups: gdObjectGroupsContainer,
  getValidatedObjectOrGroupName: (newName: string, global: boolean) => string,
  onDeleteGroup: (
    groupWithScope: GroupWithContext,
    done: (boolean) => void
  ) => void,
  onRenameGroup: (
    groupWithScope: GroupWithContext,
    newName: string,
    done: (boolean) => void
  ) => void,
  onGroupsUpdated?: () => void,
  canSetAsGlobalGroup?: boolean,
  unsavedChanges?: ?UnsavedChanges,
|};

/**
 * Helper showing the list of groups and embedding the editor to edit a group.
 */
const ObjectGroupsListWithObjectGroupEditor = ({
  project,
  projectScopedContainersAccessor,
  globalObjectsContainer,
  objectsContainer,
  globalObjectGroups,
  objectGroups,
  getValidatedObjectOrGroupName,
  onDeleteGroup,
  onRenameGroup,
  onGroupsUpdated,
  canSetAsGlobalGroup,
  unsavedChanges,
}: Props) => {
  const [editedGroup, setEditedGroup] = React.useState<gdObjectGroup | null>(
    null
  );
  const [isCreatingNewGroup, setCreatingNewGroup] = React.useState<boolean>(
    false
  );
  const objectGroupsListInterface = React.useRef<ObjectGroupsListInterface | null>(
    null
  );

  return (
    <React.Fragment>
      <ObjectGroupsList
        ref={objectGroupsListInterface}
        globalObjectGroups={globalObjectGroups}
        projectScopedContainersAccessor={projectScopedContainersAccessor}
        objectGroups={objectGroups}
        onCreateGroup={() => setCreatingNewGroup(true)}
        onEditGroup={setEditedGroup}
        onDeleteGroup={onDeleteGroup}
        onRenameGroup={onRenameGroup}
        getValidatedObjectOrGroupName={getValidatedObjectOrGroupName}
        onGroupRemoved={onGroupsUpdated}
        onGroupRenamed={onGroupsUpdated}
        canSetAsGlobalGroup={canSetAsGlobalGroup}
        unsavedChanges={unsavedChanges}
      />
      {(editedGroup || isCreatingNewGroup) && (
        <ObjectGroupEditorDialog
          project={project}
          projectScopedContainersAccessor={projectScopedContainersAccessor}
          key={
            (globalObjectsContainer ? globalObjectsContainer.ptr : '') +
            ';' +
            objectsContainer.ptr
          }
          group={editedGroup}
          globalObjectsContainer={globalObjectsContainer}
          objectsContainer={objectsContainer}
          bypassedObjectGroupsContainer={objectGroups}
          onCancel={() => {
            setEditedGroup(null);
            setCreatingNewGroup(false);
          }}
          onApply={() => {
            if (onGroupsUpdated) onGroupsUpdated();
            setEditedGroup(null);
          }}
          onObjectGroupAdded={(objectGroup: gdObjectGroup) => {
            if (objectGroupsListInterface.current) {
              objectGroupsListInterface.current.scrollToObjectGroup(
                objectGroup
              );
            }
          }}
          initialTab={'objects'}
        />
      )}
    </React.Fragment>
  );
};

export default ObjectGroupsListWithObjectGroupEditor;
