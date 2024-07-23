// @flow
import React from 'react';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope.flow';
import NewObjectGroupEditorDialog from './NewObjectGroupEditorDialog';
import EditedObjectGroupEditorDialog, {
  type ObjectGroupEditorTab,
} from './EditedObjectGroupEditorDialog';
import newNameGenerator from '../Utils/NewNameGenerator';

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  group: gdObjectGroup | null,
  onApply: () => void,
  onCancel: () => void,
  onObjectGroupAdded: (objectGroup: gdObjectGroup) => void,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  initialTab?: ?ObjectGroupEditorTab,
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
  initialTab,
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
      // TODO Handle shouldSpreadAnyVariables
      if (editedObjectGroup) {
        for (const objectName of groupObjectNames) {
          editedObjectGroup.addObject(objectName);
        }
        if (groupObjectNames.length === 0) {
          // An empty group would have shown the same dialog.
          onApply();
        } else {
          setEditedObjectGroup(editedObjectGroup);
          setSelectedTab('variables');
        }
      } else {
        const name = newNameGenerator(objectGroupName || 'Group', name =>
          projectScopedContainersAccessor
            .get()
            .getObjectsContainersList()
            .hasObjectOrGroupNamed(name)
        );

        const objectGroupContainer = objectsContainer.getObjectGroups();
        const newObjectGroup = objectGroupContainer.insertNew(
          name,
          objectGroupContainer.count()
        );
        for (const objectName of groupObjectNames) {
          newObjectGroup.addObject(objectName);
        }
        onObjectGroupAdded(newObjectGroup);
        if (groupObjectNames.length === 0) {
          // An empty group would have shown the same dialog.
          onApply();
        } else {
          setEditedObjectGroup(newObjectGroup);
          setSelectedTab('variables');
        }
      }
    },
    [
      editedObjectGroup,
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
    />
  );
};

export default ObjectGroupEditorDialog;
