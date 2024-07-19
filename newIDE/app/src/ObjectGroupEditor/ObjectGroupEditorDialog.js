// @flow
import React from 'react';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope.flow';
import NewObjectGroupEditorDialog from './NewObjectGroupEditorDialog';
import EditedObjectGroupEditorDialog, {
  type ObjectGroupEditorTab,
} from './EditedObjectGroupEditorDialog';

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  group: gdObjectGroup,
  onApply: () => void,
  onCancel: () => void,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  initialTab: ?ObjectGroupEditorTab,
|};

const ObjectGroupEditorDialog = ({
  project,
  projectScopedContainersAccessor,
  group,
  onApply,
  onCancel,
  globalObjectsContainer,
  objectsContainer,
  initialTab,
}: Props) => {
  const isEmpty = React.useRef<boolean>(
    group.getAllObjectsNames().size() === 0
  );

  return isEmpty.current ? (
    <NewObjectGroupEditorDialog
      project={project}
      projectScopedContainersAccessor={projectScopedContainersAccessor}
      group={group}
      onApply={onApply}
      onCancel={onCancel}
      globalObjectsContainer={globalObjectsContainer}
      objectsContainer={objectsContainer}
      initialTab={initialTab}
    />
  ) : (
    <EditedObjectGroupEditorDialog
      project={project}
      projectScopedContainersAccessor={projectScopedContainersAccessor}
      group={group}
      onApply={onApply}
      onCancel={onCancel}
      globalObjectsContainer={globalObjectsContainer}
      objectsContainer={objectsContainer}
      initialTab={initialTab}
    />
  );
};

export default ObjectGroupEditorDialog;
