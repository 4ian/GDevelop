// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import ObjectGroupEditor from '.';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import useForceUpdate from '../Utils/UseForceUpdate';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope.flow';

export type ObjectGroupEditorTab = 'objects' | 'variables';

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  onApply: (groupObjectNames: Array<string>) => void,
  onCancel: () => void,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
|};

const NewObjectGroupEditorDialog = ({
  project,
  projectScopedContainersAccessor,
  onApply,
  onCancel,
  globalObjectsContainer,
  objectsContainer,
}: Props) => {
  const forceUpdate = useForceUpdate();

  const [groupObjectNames, setGroupObjectNames] = React.useState<Array<string>>(
    []
  );

  const removeObject = React.useCallback(
    (removedObjectName: string) => {
      setGroupObjectNames(groupObjects =>
        groupObjects.filter(objectName => objectName !== removedObjectName)
      );

      // Force update to ensure dialog is properly positioned
      forceUpdate();
    },
    [forceUpdate]
  );

  const addObject = React.useCallback(
    (objectName: string) => {
      setGroupObjectNames(groupObjectNames => [
        ...groupObjectNames,
        objectName,
      ]);

      // Force update to ensure dialog is properly positioned
      forceUpdate();
    },
    [forceUpdate]
  );

  const apply = React.useCallback(
    () => {
      onApply(groupObjectNames);
    },
    [groupObjectNames, onApply]
  );

  return (
    <Dialog
      title={<Trans>Create a new group</Trans>}
      key={'create-group-dialog'}
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          keyboardFocused
          onClick={onCancel}
        />,
        <DialogPrimaryButton
          key="apply"
          label={<Trans>Create</Trans>}
          primary
          onClick={apply}
        />,
      ]}
      onRequestClose={onCancel}
      onApply={apply}
      open
      maxWidth="sm"
    >
      <ObjectGroupEditor
        project={project}
        projectScopedContainersAccessor={projectScopedContainersAccessor}
        globalObjectsContainer={globalObjectsContainer}
        objectsContainer={objectsContainer}
        groupObjectNames={groupObjectNames}
        onObjectAdded={addObject}
        onObjectRemoved={removeObject}
      />
    </Dialog>
  );
};

export default NewObjectGroupEditorDialog;
