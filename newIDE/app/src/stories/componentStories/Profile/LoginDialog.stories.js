// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import LoginDialog from '../../../Profile/LoginDialog';
import { delay } from '../../../Utils/Delay';
import {
  fakeNotAuthenticatedUser,
  fakeSilverAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Profile/LoginDialog',
  component: LoginDialog,
  decorators: [paperDecorator, muiDecorator],
};

const defaultProps = {
  authenticatedUser: fakeNotAuthenticatedUser,
  onClose: action('onClose'),
  onForgotPassword: action('onForgotPassword'),
  onLogin: action('onLogin'),
  onLoginOnDesktopApp: action('onLoginOnDesktopApp'),
  onLogout: action('onLogout'),
  onLoginWithProvider: action('onLoginWithProvider'),
  onGoToCreateAccount: action('onGoToCreateAccount'),
  loginInProgress: false,
  error: null,
};

export const Default = () => <LoginDialog {...defaultProps} />;

export const AlreadyLoggedIn = () => {
  const [
    loginOnDesktopAppSuccess,
    setLoginOnDesktopAppSuccess,
  ] = React.useState<boolean>(false);

  const onLoginOnDesktopApp = async () => {
    action('onLoginOnDesktopApp')();
    await delay(500);
    setLoginOnDesktopAppSuccess(true);
  };
  return (
    <LoginDialog
      {...defaultProps}
      loginOnDesktopAppSuccess={loginOnDesktopAppSuccess}
      onLoginOnDesktopApp={onLoginOnDesktopApp}
      authenticatedUser={fakeSilverAuthenticatedUser}
    />
  );
};

export const WeakPasswordErrorFromBackend = () => (
  <LoginDialog
    {...defaultProps}
    error={{
      code: 'auth/weak-password',
    }}
  />
);

export const InvalidEmailErrorFromBackend = () => (
  <LoginDialog
    {...defaultProps}
    error={{
      code: 'auth/invalid-email',
    }}
  />
);

export const AccountExistsWithDifferentCredentialErrorFromBackend = () => (
  <LoginDialog
    {...defaultProps}
    error={{
      code: 'auth/account-exists-with-different-credential',
    }}
  />
);

export const Submitting = () => (
  <LoginDialog {...defaultProps} loginInProgress />
);
