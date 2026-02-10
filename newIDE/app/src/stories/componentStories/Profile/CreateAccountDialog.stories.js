// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import CreateAccountDialog from '../../../Profile/CreateAccountDialog';

export default {
  title: 'Profile/CreateAccountDialog',
  component: CreateAccountDialog,
  decorators: [paperDecorator],
};

const defaultProps = {
  onClose: () => action('onClose')(),
  onGoToLogin: action('onGoToLogin'),
  onCreateAccount: action('onCreateAccount'),
  onLoginWithProvider: action('onLoginWithProvider'),
  createAccountInProgress: false,
  error: null,
};
// $FlowFixMe[signature-verification-failure]
export const Default = () => <CreateAccountDialog {...defaultProps} />;

// $FlowFixMe[signature-verification-failure]
export const PasswordErrorFromBackend = () => (
  <CreateAccountDialog
    {...defaultProps}
    error={{ code: 'auth/weak-password' }}
  />
);

// $FlowFixMe[signature-verification-failure]
export const EmailErrorFromBackend = () => (
  <CreateAccountDialog
    {...defaultProps}
    error={{ code: 'auth/invalid-email' }}
  />
);

// $FlowFixMe[signature-verification-failure]
export const AccountExists = () => (
  <CreateAccountDialog
    {...defaultProps}
    error={{ code: 'auth/account-exists-with-different-credential' }}
  />
);

// $FlowFixMe[signature-verification-failure]
export const Submitting = () => (
  <CreateAccountDialog {...defaultProps} createAccountInProgress />
);
