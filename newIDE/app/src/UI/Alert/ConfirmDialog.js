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
  onConfirm: () => void,
  onDismiss: () => void,
  confirmButtonLabel?: MessageDescriptor,
  dismissButtonLabel?: MessageDescriptor,
  secondaryActionButtonLabel?: MessageDescriptor,
  secondaryActionButtonColor?:
    | 'primary'
    | 'success'
    | 'danger'
    | 'premium'
    | 'ai',
  onClickSecondaryAction?: () => void,
  level: 'info' | 'warning' | 'error',
  maxWidth?: 'xs' | 'sm' | 'md',
  makeDismissButtonPrimary?: boolean,
|};

function ConfirmDialog(props: Props): React.Node {
  return (
    <I18n>
      {({ i18n }) => {
        const dismissButtonLabel = props.dismissButtonLabel ? (
          i18n._(props.dismissButtonLabel)
        ) : (
          <Trans>Cancel</Trans>
        );
        const dismissActionButton = props.makeDismissButtonPrimary ? (
          <DialogPrimaryButton
            key="dismiss"
            keyboardFocused
            label={dismissButtonLabel}
            onClick={props.onDismiss}
            primary
          />
        ) : (
          <FlatButton
            key="dismiss"
            keyboardFocused
            label={dismissButtonLabel}
            onClick={props.onDismiss}
          />
        );
        const confirmButtonLabel = props.confirmButtonLabel ? (
          i18n._(props.confirmButtonLabel)
        ) : (
          <Trans>Confirm</Trans>
        );
        const confirmActionButton = props.makeDismissButtonPrimary ? (
          <FlatButton
            key="confirm"
            label={confirmButtonLabel}
            onClick={props.onConfirm}
          />
        ) : (
          <DialogPrimaryButton
            key="confirm"
            label={confirmButtonLabel}
            onClick={props.onConfirm}
            primary
          />
        );
        const dialogActions = [dismissActionButton, confirmActionButton];
        const secondaryActions = props.onClickSecondaryAction
          ? [
              <FlatButton
                key="secondary-action"
                label={
                  props.secondaryActionButtonLabel ? (
                    i18n._(props.secondaryActionButtonLabel)
                  ) : (
                    <Trans>Continue</Trans>
                  )
                }
                color={props.secondaryActionButtonColor}
                onClick={props.onClickSecondaryAction}
              />,
            ]
          : undefined;
        return (
          <Dialog
            dangerLevel={
              props.level === 'warning'
                ? 'warning'
                : props.level === 'error'
                ? 'danger'
                : undefined
            }
            title={i18n._(props.title)}
            open={props.open}
            // $FlowFixMe[incompatible-type]
            actions={dialogActions}
            secondaryActions={secondaryActions}
            maxWidth={props.maxWidth || 'xs'}
            fullscreen="never-even-on-mobile"
            onRequestClose={props.onDismiss}
            onApply={props.onConfirm}
          >
            <Text>
              <MarkdownText
                translatableSource={props.message}
                isStandaloneText
              />
            </Text>
          </Dialog>
        );
      }}
    </I18n>
  );
}

export default ConfirmDialog;
