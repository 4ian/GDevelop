// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

import Dialog from '../Dialog';
import FlatButton from '../FlatButton';
import Text from '../Text';
import { MarkdownText } from '../MarkdownText';

type Props = {|
  open: boolean,
  title: MessageDescriptor,
  message: MessageDescriptor,
  onDismiss: () => void,
  dismissButtonLabel?: MessageDescriptor,
|};

function AlertDialog(props: Props) {
  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={i18n._(props.title)}
          open={props.open}
          fullscreen="never-even-on-mobile"
          actions={[
            <FlatButton
              key="dismiss"
              keyboardFocused
              label={
                props.dismissButtonLabel ? (
                  i18n._(props.dismissButtonLabel)
                ) : (
                  <Trans>OK</Trans>
                )
              }
              onClick={props.onDismiss}
            />,
          ]}
          maxWidth="xs"
          onRequestClose={props.onDismiss}
          onApply={props.onDismiss}
        >
          <Text>
            <MarkdownText translatableSource={props.message} isStandaloneText />
          </Text>
        </Dialog>
      )}
    </I18n>
  );
}

export default AlertDialog;
