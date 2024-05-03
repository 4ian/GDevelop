// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { Column } from '../UI/Grid';
import TextField from '../UI/TextField';
import { type ForgotPasswordForm } from '../Utils/GDevelopServices/Authentication';
import LeftLoader from '../UI/LeftLoader';
import Text from '../UI/Text';
import Form from '../UI/Form';

export const emailRegex = /^(.+)@(.+)$/;

type Props = {|
  onClose: () => void,
  onForgotPassword: ForgotPasswordForm => Promise<void>,
|};

const ForgotPasswordDialog = ({ onClose, onForgotPassword }: Props) => {
  const [email, setEmail] = React.useState('');
  const [resetDone, setResetDone] = React.useState(false);
  const [resetInProgress, setResetInProgress] = React.useState(false);
  const [isEmailValid, setIsEmailValid] = React.useState<boolean>(true);

  const doResetPassword = async () => {
    const trimmedEmail = email.trim();
    setEmail(trimmedEmail);
    setIsEmailValid(emailRegex.test(trimmedEmail));

    if (resetInProgress || !email || !isEmailValid) return;
    setResetInProgress(true);

    await onForgotPassword({
      email,
    });

    setResetInProgress(false);
    setResetDone(true);
  };

  return (
    <Dialog
      title={<Trans>Reset your password</Trans>}
      open
      actions={[
        <FlatButton
          label={<Trans>Close</Trans>}
          key="close"
          onClick={onClose}
          disabled={resetInProgress}
        />,
        !resetDone ? (
          <LeftLoader isLoading={resetInProgress} key="reset">
            <DialogPrimaryButton
              label={<Trans>Reset password</Trans>}
              primary
              onClick={doResetPassword}
              disabled={resetInProgress || !isEmailValid}
            />
          </LeftLoader>
        ) : null,
      ]}
      cannotBeDismissed={resetInProgress}
      onRequestClose={onClose}
      maxWidth="xs"
      onApply={doResetPassword}
    >
      {resetDone ? (
        <Column noMargin>
          <Text>
            <Trans>
              You should have received an email containing instructions to reset
              and set a new password. Once it's done, you can use your new
              password in GDevelop.
            </Trans>
          </Text>
        </Column>
      ) : (
        <Form onSubmit={doResetPassword} autoComplete="on" name="resetPassword">
          <Column noMargin>
            <TextField
              autoFocus="desktop"
              value={email}
              floatingLabelText={<Trans>Email</Trans>}
              onChange={(e, value) => {
                if (!isEmailValid) setIsEmailValid(true);
                setEmail(value);
              }}
              errorText={
                !isEmailValid ? (
                  <Trans>Invalid email address.</Trans>
                ) : (
                  undefined
                )
              }
              type="email"
              fullWidth
              onBlur={event => {
                const trimmedEmail = event.currentTarget.value.trim();
                setEmail(trimmedEmail);
                setIsEmailValid(emailRegex.test(trimmedEmail));
              }}
            />
          </Column>
        </Form>
      )}
    </Dialog>
  );
};

export default ForgotPasswordDialog;
