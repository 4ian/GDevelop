// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';

import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import Dialog, { DialogPrimaryButton } from '../Dialog';
import FlatButton from '../FlatButton';
import { LargeSpacer } from '../Grid';
import Text from '../Text';
import TextField from '../TextField';

type Props = {|
  open: boolean,
  title: MessageDescriptor,
  message: MessageDescriptor,
  fieldMessage: MessageDescriptor,
  confirmText: string,
  onConfirm: () => void,
  onDismiss: () => void,
|};

function ConfirmDeleteDialog(props: Props) {
  const [textInput, setTextInput] = React.useState<string>('');
  const canConfirm = textInput === props.confirmText;

  const onConfirm = () => {
    if (!canConfirm) return;
    props.onConfirm();
    setTextInput('');
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          open={props.open}
          isDangerous
          onApply={onConfirm}
          onRequestClose={props.onDismiss}
          maxWidth="sm"
          flexColumnBody
          actions={[
            <FlatButton
              key="cancel"
              label={<Trans>Cancel</Trans>}
              primary={false}
              onClick={props.onDismiss}
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
          <Text size="block-title">{i18n._(props.title)}</Text>
          <Text size="body">{i18n._(props.message)}</Text>
          <LargeSpacer />
          <TextField
            autoFocus
            floatingLabelFixed
            floatingLabelText={i18n._(props.fieldMessage)}
            value={textInput}
            onChange={(e, text) => setTextInput(text)}
            hintText={props.confirmText}
          />
        </Dialog>
      )}
    </I18n>
  );
}

export default ConfirmDeleteDialog;
