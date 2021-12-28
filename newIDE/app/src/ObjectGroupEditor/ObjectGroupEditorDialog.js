// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../UI/FlatButton';
import ObjectGroupEditor from '.';
import Dialog from '../UI/Dialog';
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
  const onCancelChanges = useSerializableObjectCancelableEditor({
    serializableObject: group,
    onCancel,
  });

  return (
    <Dialog
      onApply={onApply}
      key={group.ptr}
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          keyboardFocused
          onClick={onCancelChanges}
        />,
        <FlatButton
          key="apply"
          label={<Trans>Apply</Trans>}
          primary
          keyboardFocused
          onClick={onApply}
        />,
      ]}
      noMargin
      cannotBeDismissed={true}
      onRequestClose={onCancelChanges}
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
      />
    </Dialog>
  );
};

export default ObjectGroupEditorDialog;
