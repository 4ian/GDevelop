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
  onObjectGroupAdded: () => void,
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
    (groupObjectNames: Array<string>) => {
      if (editedObjectGroup) {
        for (const objectName of groupObjectNames) {
          editedObjectGroup.addObject(objectName);
        }
        onApply();
      } else {
        const name = newNameGenerator('Group', name =>
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
        setEditedObjectGroup(newObjectGroup);
        setSelectedTab('variables');
        onObjectGroupAdded();
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
