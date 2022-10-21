// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { Column } from '../UI/Grid';
import TextField from '../UI/TextField';
import {
  type LoginForm,
  type AuthError,
} from '../Utils/GDevelopServices/Authentication';
import RightLoader from '../UI/RightLoader';
import LeftLoader from '../UI/LeftLoader';
import Text from '../UI/Text';
import { getEmailErrorText, getPasswordErrorText } from './CreateAccountDialog';
import AlertMessage from '../UI/AlertMessage';
import { ColumnStackLayout } from '../UI/Layout';

type Props = {|
  onClose: () => void,
  onGoToCreateAccount: () => void,
  onLogin: (form: LoginForm) => Promise<void>,
  onForgotPassword: (form: LoginForm) => Promise<void>,
  loginInProgress: boolean,
  error: ?AuthError,
  resetPasswordDialogOpen: boolean,
  onCloseResetPasswordDialog: () => void,
  forgotPasswordInProgress: boolean,
|};

const LoginDialog = ({
  onClose,
  onGoToCreateAccount,
  onLogin,
  onForgotPassword,
  loginInProgress,
  error,
  resetPasswordDialogOpen,
  onCloseResetPasswordDialog,
  forgotPasswordInProgress,
}: Props) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const actionInProgress = loginInProgress || forgotPasswordInProgress;

  const doLogin = () => {
    if (actionInProgress) return;

    onLogin({
      email,
      password,
    });
  };

  const doForgotPassword = () => {
    if (actionInProgress) return;

    onForgotPassword({
      email,
      password,
    });
  };

  const actions = [
    <FlatButton
      label={<Trans>Cancel</Trans>}
      disabled={actionInProgress}
      key="cancel"
      primary={false}
      onClick={onClose}
    />,
    <LeftLoader isLoading={loginInProgress} key="login">
      <DialogPrimaryButton
        label={<Trans>Login</Trans>}
        primary
        onClick={doLogin}
        disabled={actionInProgress}
      />
    </LeftLoader>,
  ];

  return (
    <Dialog
      title={<Trans>Login to your GDevelop account</Trans>}
      actions={actions}
      secondaryActions={[
        <RightLoader isLoading={forgotPasswordInProgress} key="forgot-password">
          <FlatButton
            label={<Trans>I forgot my password</Trans>}
            primary={false}
            disabled={loginInProgress || forgotPasswordInProgress}
            onClick={doForgotPassword}
          />
        </RightLoader>,
      ]}
      cannotBeDismissed={loginInProgress || forgotPasswordInProgress}
      onRequestClose={onClose}
      onApply={doLogin}
      maxWidth="sm"
      open
    >
      <ColumnStackLayout noMargin>
        <AlertMessage
          kind="info"
          renderRightButton={() => (
            <FlatButton
              label={<Trans>Create my account</Trans>}
              disabled={loginInProgress || forgotPasswordInProgress}
              primary
              onClick={onGoToCreateAccount}
            />
          )}
        >
          <Trans>Don't have an account yet?</Trans>
        </AlertMessage>
        <TextField
          autoFocus
          value={email}
          floatingLabelText={<Trans>Email</Trans>}
          errorText={getEmailErrorText(error)}
          fullWidth
          onChange={(e, value) => {
            setEmail(value);
          }}
          disabled={loginInProgress}
        />
        <TextField
          value={password}
          floatingLabelText={<Trans>Password</Trans>}
          errorText={getPasswordErrorText(error)}
          type="password"
          fullWidth
          onChange={(e, value) => {
            setPassword(value);
          }}
          disabled={loginInProgress}
        />
      </ColumnStackLayout>
      <Dialog
        open={resetPasswordDialogOpen}
        title={<Trans>Reset your password</Trans>}
        actions={[
          <FlatButton
            label={<Trans>Close</Trans>}
            key="close"
            onClick={onCloseResetPasswordDialog}
          />,
        ]}
        cannotBeDismissed={forgotPasswordInProgress}
        onRequestClose={onCloseResetPasswordDialog}
      >
        <Column noMargin>
          <Text>
            <Trans>
              You should have received an email containing instructions to reset
              and set a new password. Once it's done, you can use your new
              password in GDevelop.
            </Trans>
          </Text>
        </Column>
      </Dialog>
    </Dialog>
  );
};

export default LoginDialog;
