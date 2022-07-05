// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from './Dialog';
import FlatButton from './FlatButton';
import { LargeSpacer } from './Grid';
import Text from './Text';
import TextField from './TextField';

type Props = {|
  title: React.Node,
  description: React.Node,
  fieldDescription: React.Node,
  confirmText: string,
  onConfirm: () => void,
  onCancel: () => void,
|};

function ConfirmDeleteDialog(props: Props) {
  const [textInput, setTextInput] = React.useState<string>('');
  const canConfirm = textInput === props.confirmText;

  const onConfirm = () => {
    if (!canConfirm) return;
    props.onConfirm();
  };

  return (
    <Dialog
      open
      isDangerous
      onApply={onConfirm}
      onRequestClose={props.onCancel}
      maxWidth="sm"
      flexColumnBody
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          primary={false}
          onClick={props.onCancel}
        />,
        <DialogPrimaryButton
          key="confirm"
          label={<Trans>Confirm</Trans>}
          primary
          onClick={onConfirm}
          disabled={!canConfirm}
        />,
      ]}
    >
      <Text size="title">{props.title}</Text>
      <Text size="body">{props.description}</Text>
      <LargeSpacer />
      <TextField
        autoFocus
        floatingLabelFixed
        floatingLabelText={props.fieldDescription}
        value={textInput}
        onChange={(e, text) => setTextInput(text)}
        hintText={props.confirmText}
      />
    </Dialog>
  );
}

export default ConfirmDeleteDialog;
