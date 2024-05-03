// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { Trans } from '@lingui/macro';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

import Dialog, { DialogPrimaryButton } from '../Dialog';
import FlatButton from '../FlatButton';
import { MarkdownText } from '../MarkdownText';
import Text from '../Text';

type Props = {|
  open: boolean,
  title: MessageDescriptor,
  message: MessageDescriptor,
  onClickYes: () => void,
  onClickNo: () => void,
  onClickCancel: () => void,
  yesButtonLabel?: MessageDescriptor,
  noButtonLabel?: MessageDescriptor,
  cancelButtonLabel?: MessageDescriptor,
|};

function YesNoCancelDialog(props: Props) {
  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={i18n._(props.title)}
          open={props.open}
          actions={[
            <FlatButton
              key="no"
              keyboardFocused
              label={
                props.noButtonLabel ? (
                  i18n._(props.noButtonLabel)
                ) : (
                  <Trans>No</Trans>
                )
              }
              onClick={props.onClickNo}
            />,
            <DialogPrimaryButton
              key="yes"
              label={
                props.yesButtonLabel ? (
                  i18n._(props.yesButtonLabel)
                ) : (
                  <Trans>Yes</Trans>
                )
              }
              onClick={props.onClickYes}
              primary
            />,
          ]}
          secondaryActions={[
            <FlatButton
              key="cancel"
              keyboardFocused
              label={
                props.cancelButtonLabel ? (
                  i18n._(props.cancelButtonLabel)
                ) : (
                  <Trans>Cancel</Trans>
                )
              }
              onClick={props.onClickCancel}
            />,
          ]}
          maxWidth="xs"
          noMobileFullScreen
          onRequestClose={props.onClickCancel}
          onApply={props.onClickYes}
        >
          <Text>
            <MarkdownText translatableSource={props.message} isStandaloneText />
          </Text>
        </Dialog>
      )}
    </I18n>
  );
}

export default YesNoCancelDialog;
