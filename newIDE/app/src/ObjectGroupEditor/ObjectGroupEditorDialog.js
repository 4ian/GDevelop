// @flow
import React from 'react';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import NewObjectGroupEditorDialog from './NewObjectGroupEditorDialog';
import EditedObjectGroupEditorDialog, {
  type ObjectGroupEditorTab,
} from './EditedObjectGroupEditorDialog';
import { type GroupWithContext } from '../ObjectsList/EnumerateObjects';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  group: gdObjectGroup | null,
  onApply: () => void,
  onCancel: () => void,
  onObjectGroupAdded: (objectGroup: gdObjectGroup) => void,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  initialInstances: gdInitialInstancesContainer | null,
  /**
   * Event-based functions have an ObjectGroupContainer containing the groups,
   * but no ObjectsContainer. Instead, the ObjectsContainer is generated from
   * their parameters.
   *
   * This parameter allows to use a different ObjectGroupsContainer than the
   * one found in the ObjectsContainer.
   */
  bypassedObjectGroupsContainer?: ?gdObjectGroupsContainer,
  initialTab?: ?ObjectGroupEditorTab,
  onComputeAllVariableNames?: () => Array<string>,
  isVariableListLocked: boolean,
  isObjectListLocked: boolean,
  isGroupGlobal?: boolean,
  objectNameFilter?: string => boolean,
  onRenameGroup?: (
    groupWithContext: GroupWithContext,
    newName: string,
    done: (boolean) => void
  ) => void,
  getValidatedObjectOrGroupName: (newName: string, global: boolean) => string,
|};

const ObjectGroupEditorDialog = ({
  project,
  projectScopedContainersAccessor,
  group,
  onApply,
  onCancel,
  onObjectGroupAdded,
  globalObjectsContainer,
  objectsContainer,
  bypassedObjectGroupsContainer,
  initialTab,
  isObjectListLocked,
  isGroupGlobal = false,
  objectNameFilter,
  onRenameGroup,
  getValidatedObjectOrGroupName,
}: Props): React.Node => {
  const [
    editedObjectGroup,
    setEditedObjectGroup,
  ] = React.useState<gdObjectGroup | null>(group);
  const [selectedTab, setSelectedTab] = React.useState<ObjectGroupEditorTab>(
    initialTab || 'objects'
  );

  const onApplyToEmptyGroup = React.useCallback(
    (
      objectGroupName: string,
      shouldSpreadAnyVariables: boolean,
      groupObjectNames: Array<string>
    ) => {
      const allowedGroupObjectNames = isGroupGlobal
        ? globalObjectsContainer
          ? groupObjectNames.filter(objectName =>
              globalObjectsContainer.hasObjectNamed(objectName)
            )
          : []
        : groupObjectNames;

      let objectGroup;
      if (editedObjectGroup) {
        objectGroup = editedObjectGroup;
      } else {
        const name = getValidatedObjectOrGroupName(
          objectGroupName || 'Group',
          isGroupGlobal
        );
        const objectGroupContainer =
          bypassedObjectGroupsContainer || objectsContainer.getObjectGroups();
        objectGroup = objectGroupContainer.insertNew(
          name,
          objectGroupContainer.count()
        );
        onObjectGroupAdded(objectGroup);
      }
      if (allowedGroupObjectNames.length === 0) {
        // An empty group would have shown the same dialog.
        onApply();
        return;
      }
      for (const objectName of allowedGroupObjectNames) {
        objectGroup.addObject(objectName);
      }
      if (shouldSpreadAnyVariables) {
        gd.ObjectRefactorer.fillAnyVariableBetweenObjects(
          globalObjectsContainer || objectsContainer,
          objectsContainer,
          objectGroup
        );
      }
      setEditedObjectGroup(objectGroup);
      setSelectedTab('commonFunctions');
    },
    [
      bypassedObjectGroupsContainer,
      editedObjectGroup,
      getValidatedObjectOrGroupName,
      globalObjectsContainer,
      isGroupGlobal,
      objectsContainer,
      onApply,
      onObjectGroupAdded,
    ]
  );

  return !editedObjectGroup ? (
    <NewObjectGroupEditorDialog
      project={project}
      projectScopedContainersAccessor={projectScopedContainersAccessor}
      onApply={onApplyToEmptyGroup}
      onCancel={onCancel}
      globalObjectsContainer={globalObjectsContainer}
      objectsContainer={objectsContainer}
      isGroupAlreadyAdded={!!editedObjectGroup}
      isGlobalGroup={isGroupGlobal}
      objectNameFilter={objectNameFilter}
    />
  ) : (
    <EditedObjectGroupEditorDialog
      project={project}
      projectScopedContainersAccessor={projectScopedContainersAccessor}
      group={editedObjectGroup}
      onApply={onApply}
      onCancel={onCancel}
      globalObjectsContainer={globalObjectsContainer}
      objectsContainer={objectsContainer}
      initialTab={selectedTab}
      isObjectListLocked={isObjectListLocked}
      isGroupGlobal={isGroupGlobal}
      objectNameFilter={objectNameFilter}
      onRenameGroup={onRenameGroup}
      getValidatedObjectOrGroupName={getValidatedObjectOrGroupName}
    />
  );
};

export default ObjectGroupEditorDialog;
