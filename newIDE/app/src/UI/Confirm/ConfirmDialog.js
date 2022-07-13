// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

import Dialog, { DialogPrimaryButton } from '../Dialog';
import FlatButton from '../FlatButton';
import Text from '../Text';

type Props = {|
  open: boolean,
  title: MessageDescriptor,
  message: MessageDescriptor,
  onConfirm: () => void,
  onDismiss: () => void,
  // TODO: Add notion of level (info, warning, error)
  // level: string,
|};

function ConfirmDialog(props: Props) {
  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          open={props.open}
          actions={[
            <FlatButton
              key="dismiss"
              label={<Trans>Cancel</Trans>}
              onClick={props.onDismiss}
            />,
            <DialogPrimaryButton
              key="confirm"
              label={<Trans>Confirm</Trans>}
              onClick={props.onConfirm}
            />,
          ]}
          maxWidth="xs"
          title={i18n._(props.title)}
        >
          <Text>{i18n._(props.message)}</Text>
        </Dialog>
      )}
    </I18n>
  );
}

export default ConfirmDialog;
