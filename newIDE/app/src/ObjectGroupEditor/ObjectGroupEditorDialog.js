// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import ObjectGroupEditor from '.';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import useForceUpdate from '../Utils/UseForceUpdate';

type Props = {|
  project: gdProject,
  group: gdObjectGroup,
  onApply: () => void,
  onCancel: () => void,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
|};

const ObjectGroupEditorDialog = ({
  project,
  group,
  onApply,
  onCancel,
  globalObjectsContainer,
  objectsContainer,
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
      noMargin
      onRequestClose={onCancelChanges}
      onApply={onApply}
      open
      title={`Edit ${group.getName()} group`}
    >
      <ObjectGroupEditor
        project={project}
        group={group}
        globalObjectsContainer={globalObjectsContainer}
        objectsContainer={objectsContainer}
        onSizeUpdated={
          forceUpdate /*Force update to ensure dialog is properly positionned*/
        }
        onObjectGroupUpdated={notifyOfChange}
      />
    </Dialog>
  );
};

export default ObjectGroupEditorDialog;
