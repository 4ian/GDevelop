// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { Column } from '../UI/Grid';
import TextField from '../UI/TextField';
import {
  type LoginForm,
  type ForgotPasswordForm,
  type AuthError,
} from '../Utils/GDevelopServices/Authentication';
import LeftLoader from '../UI/LeftLoader';
import Text from '../UI/Text';
import { getEmailErrorText, getPasswordErrorText } from './CreateAccountDialog';
import { ColumnStackLayout } from '../UI/Layout';
import HelpButton from '../UI/HelpButton';
import Link from '../UI/Link';
import GDevelopGLogo from '../UI/CustomSvgIcons/GDevelopGLogo';
import ForgotPasswordDialog from './ForgotPasswordDialog';

const styles = {
  formContainer: {
    width: '60%',
    marginTop: 20,
  },
};

type Props = {|
  onClose: () => void,
  onGoToCreateAccount: () => void,
  onLogin: (form: LoginForm) => Promise<void>,
  onForgotPassword: (form: ForgotPasswordForm) => Promise<void>,
  loginInProgress: boolean,
  error: ?AuthError,
|};

const LoginDialog = ({
  onClose,
  onGoToCreateAccount,
  onLogin,
  onForgotPassword,
  loginInProgress,
  error,
}: Props) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [
    isForgotPasswordDialogOpen,
    setIsForgotPasswordDialogOpen,
  ] = React.useState(false);

  const doLogin = () => {
    if (loginInProgress) return;

    onLogin({
      email,
      password,
    });
  };

  const actions = [
    <FlatButton
      label={<Trans>Cancel</Trans>}
      disabled={loginInProgress}
      key="cancel"
      primary={false}
      onClick={onClose}
    />,
    <LeftLoader isLoading={loginInProgress} key="login">
      <DialogPrimaryButton
        id="login-button"
        label={<Trans>Login</Trans>}
        primary
        onClick={doLogin}
        disabled={loginInProgress}
      />
    </LeftLoader>,
  ];

  return (
    <Dialog
      title={null} // This dialog has a custom design to be more welcoming, the title is set in the content.
      id="login-dialog"
      actions={actions}
      secondaryActions={[
        <HelpButton key="help" helpPagePath={'/interface/profile'} />,
      ]}
      cannotBeDismissed={loginInProgress}
      onRequestClose={onClose}
      onApply={() => {
        // This is a hack to avoid submitting the login form
        // when submitting the forgot password form.
        if (isForgotPasswordDialogOpen) return;
        doLogin();
      }}
      maxWidth="sm"
      open
    >
      <ColumnStackLayout
        noMargin
        expand
        justifyContent="center"
        alignItems="center"
      >
        <GDevelopGLogo fontSize="large" />
        <Text size="title">
          <Trans>Log in to your account</Trans>
        </Text>
        <Column noMargin alignItems="center">
          <Text size="body2" noMargin>
            <Trans>Don't have an account yet?</Trans>
          </Text>
          <Link
            href=""
            onClick={onGoToCreateAccount}
            disabled={loginInProgress}
          >
            <Text size="body2" noMargin color="inherit">
              <Trans>Create an account</Trans>
            </Text>
          </Link>
        </Column>
        <div style={styles.formContainer}>
          <ColumnStackLayout noMargin>
            <TextField
              autoFocus
              value={email}
              floatingLabelText={<Trans>Email</Trans>}
              errorText={getEmailErrorText(error)}
              onChange={(e, value) => {
                setEmail(value);
              }}
              fullWidth
              disabled={loginInProgress}
            />
            <TextField
              value={password}
              floatingLabelText={<Trans>Password</Trans>}
              errorText={getPasswordErrorText(error)}
              type="password"
              onChange={(e, value) => {
                setPassword(value);
              }}
              fullWidth
              disabled={loginInProgress}
            />
          </ColumnStackLayout>
        </div>
        <Link
          href=""
          onClick={() => setIsForgotPasswordDialogOpen(true)}
          disabled={loginInProgress}
        >
          <Text size="body2" noMargin color="inherit">
            <Trans>Did you forget your password?</Trans>
          </Text>
        </Link>
      </ColumnStackLayout>
      {isForgotPasswordDialogOpen && (
        <ForgotPasswordDialog
          onClose={() => setIsForgotPasswordDialogOpen(false)}
          onForgotPassword={onForgotPassword}
        />
      )}
    </Dialog>
  );
};

export default LoginDialog;
