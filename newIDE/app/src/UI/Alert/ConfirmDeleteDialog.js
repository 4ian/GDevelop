// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';

import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import Dialog, { DialogPrimaryButton } from '../Dialog';
import { type ButtonInterface } from '../Button';
import FlatButton from '../FlatButton';
import { LargeSpacer } from '../Grid';
import Text from '../Text';
import TextField from '../TextField';
import { useShouldAutofocusInput } from '../Responsive/ScreenTypeMeasurer';

type Props = {|
  open: boolean,
  title: MessageDescriptor,
  message: MessageDescriptor,
  fieldMessage?: MessageDescriptor,
  confirmText?: string,
  onConfirm: () => void,
  onDismiss: () => void,
  confirmButtonLabel?: MessageDescriptor,
  dismissButtonLabel?: MessageDescriptor,
|};

function ConfirmDeleteDialog(props: Props) {
  const { open, confirmText } = props;
  const [textInput, setTextInput] = React.useState<string>('');
  const confirmButtonRef = React.useRef<?ButtonInterface>(null);
  const canConfirm = props.confirmText ? textInput === props.confirmText : true;
  const shouldAutofocus = useShouldAutofocusInput();

  const onConfirm = () => {
    if (!canConfirm) return;
    props.onConfirm();
    setTextInput('');
  };

  React.useEffect(
    () => {
      if (open && shouldAutofocus && !confirmText) {
        // If the dialog is opened and autofocus should be set and there is no confirm text
        // to enter, focus Confirm button to enable quick deletion with only keyboard navigation.
        setTimeout(
          () => {
            if (confirmButtonRef.current) {
              confirmButtonRef.current.focus();
            }
          },
          // Wait for component to be mounted so that confirmButtonRef targets something.
          50
        );
      }
    },
    [open, shouldAutofocus, confirmText]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={i18n._(props.title)}
          open={open}
          dangerLevel="danger"
          onApply={onConfirm}
          onRequestClose={props.onDismiss}
          maxWidth="sm"
          flexColumnBody
          actions={[
            <FlatButton
              key="cancel"
              label={
                props.dismissButtonLabel ? (
                  i18n._(props.dismissButtonLabel)
                ) : (
                  <Trans>Cancel</Trans>
                )
              }
              primary={false}
              onClick={props.onDismiss}
            />,
            <DialogPrimaryButton
              key="confirm"
              ref={confirmButtonRef}
              label={
                props.confirmButtonLabel ? (
                  i18n._(props.confirmButtonLabel)
                ) : (
                  <Trans>Confirm</Trans>
                )
              }
              primary
              onClick={onConfirm}
              disabled={!canConfirm}
            />,
          ]}
          noMobileFullScreen
        >
          <Text size="body" style={{ userSelect: 'text' }}>
            {i18n._(props.message)}
          </Text>
          {props.confirmText && props.fieldMessage && (
            <>
              <LargeSpacer />
              <TextField
                autoFocus="desktop"
                floatingLabelFixed
                floatingLabelText={i18n._(props.fieldMessage)}
                value={textInput}
                onChange={(e, text) => setTextInput(text)}
                hintText={props.confirmText}
              />
            </>
          )}
        </Dialog>
      )}
    </I18n>
  );
}

export default ConfirmDeleteDialog;
