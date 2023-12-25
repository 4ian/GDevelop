// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import LoginDialog from '../../../Profile/LoginDialog';

export default {
  title: 'Profile/LoginDialog',
  component: LoginDialog,
  decorators: [paperDecorator, muiDecorator],
};

const defaultProps = {
  onClose: action('onClose'),
  onForgotPassword: action('onForgotPassword'),
  onLogin: action('onLogin'),
  onLoginWithProvider: action('onLoginWithProvider'),
  onGoToCreateAccount: action('onGoToCreateAccount'),
  loginInProgress: false,
  error: null,
};

export const Default = () => <LoginDialog {...defaultProps} />;

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
