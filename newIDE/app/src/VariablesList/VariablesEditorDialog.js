// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog from '../UI/Dialog';
import { useSerializableObjectCancelableEditor } from '../Utils/SerializableObjectCancelableEditor';
import VariablesList from './index';
import useForceUpdate from '../Utils/UseForceUpdate';

type Props = {|
  onCancel: () => void,
  onApply: () => void,
  open: boolean,
  onEditObjectVariables?: () => void,
  title: React.Node,
  emptyExplanationMessage?: React.Node,
  emptyExplanationSecondMessage?: React.Node,
  variablesContainer: gdVariablesContainer,
|};

const VariablesEditorDialog = ({
  onCancel,
  onApply,
  open,
  onEditObjectVariables,
  title,
  emptyExplanationMessage,
  emptyExplanationSecondMessage,
  variablesContainer,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const onCancelChanges = useSerializableObjectCancelableEditor({
    serializableObject: variablesContainer,
    onCancel,
  });

  return (
    <Dialog
      noMargin
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          onClick={onCancelChanges}
          key={'Cancel'}
        />,
        <FlatButton
          label={<Trans>Apply</Trans>}
          primary
          keyboardFocused
          onClick={onApply}
          key={'Apply'}
        />,
      ]}
      open={open}
      cannotBeDismissed={true}
      onRequestClose={onCancelChanges}
      secondaryActions={
        onEditObjectVariables ? (
          <FlatButton
            label={<Trans>Edit Object Variables</Trans>}
            primary={false}
            onClick={onEditObjectVariables}
          />
        ) : null
      }
      title={title}
    >
      <VariablesList
        commitVariableValueOnBlur={
          // Reduce the number of re-renders by saving the variable value only when the field is blurred.
          // We don't do that by default because the VariablesList can be used in a component like
          // InstancePropertiesEditor, that can be unmounted at any time, before the text fields get a
          // chance to be blurred.
          true
        }
        variablesContainer={variablesContainer}
        emptyExplanationMessage={emptyExplanationMessage}
        emptyExplanationSecondMessage={emptyExplanationSecondMessage}
        onSizeUpdated={
          forceUpdate /*Force update to ensure dialog is properly positionned*/
        }
      />
    </Dialog>
  );
};

export default VariablesEditorDialog;
