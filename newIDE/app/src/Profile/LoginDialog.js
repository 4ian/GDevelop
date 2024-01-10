// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import {
  type LoginForm as LoginFormType,
  type ForgotPasswordForm,
  type AuthError,
  type IdentityProvider,
} from '../Utils/GDevelopServices/Authentication';
import LoginForm from './LoginForm';
import type { AuthenticatedUser } from './AuthenticatedUserContext';
import LeftLoader from '../UI/LeftLoader';
import Text from '../UI/Text';
import { ColumnStackLayout } from '../UI/Layout';
import { Column, Spacer } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import HelpButton from '../UI/HelpButton';
import FlatButton from '../UI/FlatButton';
import Link from '../UI/Link';
import GDevelopGLogo from '../UI/CustomSvgIcons/GDevelopGLogo';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';

const styles = {
  formContainer: {
    marginTop: 20,
  },
};

type Props = {|
  authenticatedUser: AuthenticatedUser,
  onClose: () => void,
  onGoToCreateAccount: () => void,
  onLogin: (form: LoginFormType) => Promise<void>,
  onLoginOnDesktopApp: () => Promise<void>,
  loginOnDesktopAppSuccess?: boolean,
  onLogout: () => Promise<void>,
  onLoginWithProvider: (provider: IdentityProvider) => Promise<void>,
  onForgotPassword: (form: ForgotPasswordForm) => Promise<void>,
  loginInProgress: boolean,
  error: ?AuthError,
|};

const LoginDialog = ({
  authenticatedUser,
  onClose,
  onGoToCreateAccount,
  onLogin,
  onLoginOnDesktopApp,
  loginOnDesktopAppSuccess,
  onLogout,
  onLoginWithProvider,
  onForgotPassword,
  loginInProgress,
  error,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const isMobileScreen = windowWidth === 'small';
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const alreadyLoggedInAccountUsernameOrEmail: ?string = authenticatedUser.profile
    ? authenticatedUser.profile.username || authenticatedUser.profile.email
    : null;

  const doLogin = () => {
    if (loginInProgress) return;

    onLogin({
      email: email.trim(),
      password,
    });
  };

  const actions = loginOnDesktopAppSuccess
    ? [
        <FlatButton
          label={<Trans>Close</Trans>}
          key="cancel"
          primary={false}
          onClick={onClose}
        />,
      ]
    : alreadyLoggedInAccountUsernameOrEmail
    ? undefined
    : [
        <FlatButton
          label={<Trans>Cancel</Trans>}
          disabled={loginInProgress} // TODO: Add possibility to cancel login with providers.
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

  const secondaryActions =
    alreadyLoggedInAccountUsernameOrEmail || loginOnDesktopAppSuccess
      ? undefined
      : [<HelpButton key="help" helpPagePath={'/interface/profile'} />];

  const dialogContent = loginOnDesktopAppSuccess ? (
    <ColumnStackLayout
      noMargin
      expand
      justifyContent="center"
      alignItems="center"
    >
      <Text size="title" align="center">
        <Trans>Success</Trans>
      </Text>
      <Text align="center">
        <Trans>You can now go back to the desktop app.</Trans>
      </Text>
    </ColumnStackLayout>
  ) : alreadyLoggedInAccountUsernameOrEmail ? (
    <ColumnStackLayout
      noMargin
      expand
      justifyContent="center"
      alignItems="center"
    >
      <Text size="title" align="center">
        <Trans>Log in</Trans>
      </Text>
      <Text align="center">
        <Trans>
          You are logged in as {alreadyLoggedInAccountUsernameOrEmail}
        </Trans>
      </Text>
      <RaisedButton
        primary
        label={
          <Trans>Continue as {alreadyLoggedInAccountUsernameOrEmail}</Trans>
        }
        onClick={onLoginOnDesktopApp}
      />
      <Spacer />
      <Column noMargin alignItems="center">
        <Text size="body2" noMargin>
          <Trans>You're not {alreadyLoggedInAccountUsernameOrEmail}?</Trans>
        </Text>
        <Link href="" onClick={onLogout} disabled={loginInProgress}>
          <Text size="body2" noMargin color="inherit">
            <Trans>Log in with another account</Trans>
          </Text>
        </Link>
      </Column>
    </ColumnStackLayout>
  ) : (
    <ColumnStackLayout
      noMargin
      expand
      justifyContent="center"
      alignItems="center"
    >
      <GDevelopGLogo fontSize="large" />
      <Text size="title" align="center">
        <Trans>Log in to your account</Trans>
      </Text>
      <Column noMargin alignItems="center">
        <Text size="body2" noMargin>
          <Trans>Don't have an account yet?</Trans>
        </Text>
        <Link href="" onClick={onGoToCreateAccount} disabled={loginInProgress}>
          <Text size="body2" noMargin color="inherit">
            <Trans>Create an account</Trans>
          </Text>
        </Link>
      </Column>
      <div
        style={{
          ...styles.formContainer,
          // Take full width on mobile.
          width: isMobileScreen ? '95%' : '60%',
        }}
      >
        <LoginForm
          onLogin={doLogin}
          onLoginWithProvider={onLoginWithProvider}
          email={email}
          onChangeEmail={setEmail}
          password={password}
          onChangePassword={setPassword}
          onForgotPassword={onForgotPassword}
          loginInProgress={loginInProgress}
          error={error}
        />
      </div>
    </ColumnStackLayout>
  );

  return (
    <Dialog
      title={null} // This dialog has a custom design to be more welcoming, the title is set in the content.
      id="login-dialog"
      actions={actions}
      secondaryActions={secondaryActions}
      cannotBeDismissed={loginInProgress}
      onRequestClose={onClose}
      onApply={doLogin}
      maxWidth="sm"
      open
      flexColumnBody
    >
      {dialogContent}
    </Dialog>
  );
};

export default LoginDialog;
