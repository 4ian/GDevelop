// @flow
import React from 'react';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import NewObjectGroupEditorDialog from './NewObjectGroupEditorDialog';
import EditedObjectGroupEditorDialog, {
  type ObjectGroupEditorTab,
} from './EditedObjectGroupEditorDialog';
import newNameGenerator from '../Utils/NewNameGenerator';

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
  onComputeAllVariableNames,
}: Props) => {
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
        const name = newNameGenerator(objectGroupName || 'Group', name =>
          projectScopedContainersAccessor
            .get()
            .getObjectsContainersList()
            .hasObjectOrGroupNamed(name)
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
        gd.GroupVariableHelper.fillAnyVariableBetweenObjects(
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
      globalObjectsContainer,
      objectsContainer,
      onApply,
      onObjectGroupAdded,
      projectScopedContainersAccessor,
    ]
  );

  return !editedObjectGroup ||
    editedObjectGroup.getAllObjectsNames().size() === 0 ? (
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
      initialTab={selectedTab}
      onComputeAllVariableNames={onComputeAllVariableNames}
    />
  );
};

export default ObjectGroupEditorDialog;
