// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import ObjectGroupEditor from '.';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import useForceUpdate from '../Utils/UseForceUpdate';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope.flow';

export type ObjectGroupEditorTab = 'objects' | 'variables';

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

const NewObjectGroupEditorDialog = ({
  project,
  projectScopedContainersAccessor,
  group,
  onApply,
  onCancel,
  globalObjectsContainer,
  objectsContainer,
  initialTab,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const {
    onCancelChanges,
    notifyOfChange,
  } = useSerializableObjectCancelableEditor({
    serializableObject: group,
    onCancel,
  });

  return (
    <Dialog
      title={<Trans>Edit {group.getName()}</Trans>}
      key={group.ptr}
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          keyboardFocused
          onClick={onCancelChanges}
        />,
        <DialogPrimaryButton
          key="apply"
          label={<Trans>Apply</Trans>}
          primary
          onClick={onApply}
        />,
      ]}
      onRequestClose={onCancelChanges}
      onApply={onApply}
      open
    >
      <ObjectGroupEditor
        project={project}
        group={group}
        globalObjectsContainer={globalObjectsContainer}
        objectsContainer={objectsContainer}
        onSizeUpdated={
          forceUpdate /*Force update to ensure dialog is properly positioned*/
        }
        onObjectGroupUpdated={notifyOfChange}
      />
    </Dialog>
  );
};

export default NewObjectGroupEditorDialog;
