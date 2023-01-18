// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

import Dialog, { DialogPrimaryButton } from '../Dialog';
import FlatButton from '../FlatButton';
import { MarkdownText } from '../MarkdownText';

type Props = {|
  open: boolean,
  title: MessageDescriptor,
  message: MessageDescriptor,
  onConfirm: () => void,
  onDismiss: () => void,
  confirmButtonLabel?: MessageDescriptor,
  dismissButtonLabel?: MessageDescriptor,
  // TODO: Add notion of level (info, warning, error)
  // level: string,
|};

function ConfirmDialog(props: Props) {
  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={i18n._(props.title)}
          open={props.open}
          actions={[
            <FlatButton
              key="dismiss"
              keyboardFocused
              label={
                props.dismissButtonLabel ? (
                  i18n._(props.dismissButtonLabel)
                ) : (
                  <Trans>Cancel</Trans>
                )
              }
              onClick={props.onDismiss}
            />,
            <DialogPrimaryButton
              key="confirm"
              label={
                props.confirmButtonLabel ? (
                  i18n._(props.confirmButtonLabel)
                ) : (
                  <Trans>Confirm</Trans>
                )
              }
              onClick={props.onConfirm}
              primary
            />,
          ]}
          maxWidth="xs"
          noMobileFullScreen
        >
          <MarkdownText translatableSource={props.message} isStandaloneText />
        </Dialog>
      )}
    </I18n>
  );
}

export default ConfirmDialog;
