// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import LoginDialog from '../../../Profile/LoginDialog';

export default {
  title: 'Profile/LoginDialog',
  component: LoginDialog,
  decorators: [paperDecorator],
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

// $FlowFixMe[signature-verification-failure]
export const Default = () => <LoginDialog {...defaultProps} />;

// $FlowFixMe[signature-verification-failure]
export const WeakPasswordErrorFromBackend = () => (
  <LoginDialog
    {...defaultProps}
    error={{
      code: 'auth/weak-password',
    }}
  />
);

// $FlowFixMe[signature-verification-failure]
export const InvalidEmailErrorFromBackend = () => (
  <LoginDialog
    {...defaultProps}
    error={{
      code: 'auth/invalid-email',
    }}
  />
);

// $FlowFixMe[signature-verification-failure]
export const AccountExistsWithDifferentCredentialErrorFromBackend = () => (
  <LoginDialog
    {...defaultProps}
    error={{
      code: 'auth/account-exists-with-different-credential',
    }}
  />
);

// $FlowFixMe[signature-verification-failure]
export const Submitting = () => (
  <LoginDialog {...defaultProps} loginInProgress />
);
