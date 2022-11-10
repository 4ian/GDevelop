// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

import Dialog from '../Dialog';
import FlatButton from '../FlatButton';
import Text from '../Text';

type Props = {|
  open: boolean,
  title: MessageDescriptor,
  message: MessageDescriptor,
  onDismiss: () => void,
|};

function AlertDialog(props: Props) {
  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={i18n._(props.title)}
          open={props.open}
          noMobileFullScreen
          actions={[
            <FlatButton
              key="dismiss"
              keyboardFocused
              label={<Trans>OK</Trans>}
              onClick={props.onDismiss}
            />,
          ]}
          maxWidth="xs"
        >
          <Text>{i18n._(props.message)}</Text>
        </Dialog>
      )}
    </I18n>
  );
}

export default AlertDialog;
