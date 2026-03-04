// @flow
import React from 'react';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import NewObjectGroupEditorDialog from './NewObjectGroupEditorDialog';
import EditedObjectGroupEditorDialog, {
  type ObjectGroupEditorTab,
} from './EditedObjectGroupEditorDialog';

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
  initialInstances,
  bypassedObjectGroupsContainer,
  initialTab,
  onComputeAllVariableNames,
  isVariableListLocked,
  isObjectListLocked,
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
      let objectGroup;
      if (editedObjectGroup) {
        objectGroup = editedObjectGroup;
      } else {
        const name = getValidatedObjectOrGroupName(
          objectGroupName || 'Group',
          false
        );
        const objectGroupContainer =
          bypassedObjectGroupsContainer || objectsContainer.getObjectGroups();
        objectGroup = objectGroupContainer.insertNew(
          name,
          objectGroupContainer.count()
        );
        onObjectGroupAdded(objectGroup);
      }
      if (groupObjectNames.length === 0) {
        // An empty group would have shown the same dialog.
        onApply();
        return;
      }
      for (const objectName of groupObjectNames) {
        objectGroup.addObject(objectName);
      }
      if (shouldSpreadAnyVariables) {
        gd.ObjectVariableHelper.fillAnyVariableBetweenObjects(
          globalObjectsContainer || objectsContainer,
          objectsContainer,
          objectGroup
        );
      }
      setEditedObjectGroup(objectGroup);
      setSelectedTab('variables');
    },
    [
      bypassedObjectGroupsContainer,
      editedObjectGroup,
      getValidatedObjectOrGroupName,
      globalObjectsContainer,
      objectsContainer,
      onApply,
      onObjectGroupAdded,
    ]
  );

  return !editedObjectGroup ||
    (editedObjectGroup.getAllObjectsNames().size() === 0 &&
      !isObjectListLocked) ? (
    <NewObjectGroupEditorDialog
      project={project}
      projectScopedContainersAccessor={projectScopedContainersAccessor}
      onApply={onApplyToEmptyGroup}
      onCancel={onCancel}
      globalObjectsContainer={globalObjectsContainer}
      objectsContainer={objectsContainer}
      isGroupAlreadyAdded={!!editedObjectGroup}
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
      initialInstances={initialInstances}
      initialTab={selectedTab}
      onComputeAllVariableNames={onComputeAllVariableNames}
      isVariableListLocked={isVariableListLocked}
      isObjectListLocked={isObjectListLocked}
    />
  );
};

export default ObjectGroupEditorDialog;
