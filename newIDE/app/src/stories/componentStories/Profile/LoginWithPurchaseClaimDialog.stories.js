// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import LoginWithPurchaseClaimDialog from '../../../Profile/LoginWithPurchaseClaimDialog';
import { fakeBundleListingData } from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Profile/LoginWithPurchaseClaimDialog',
  component: LoginWithPurchaseClaimDialog,
  decorators: [paperDecorator],
};

const claimedProductOptions = {
  productListingData: fakeBundleListingData,
  purchaseId: 'purchase-123',
  claimableToken: 'token-123',
};

const defaultProps = {
  onClose: action('onClose'),
  onForgotPassword: action('onForgotPassword'),
  onLogin: action('onLogin'),
  onLoginWithProvider: action('onLoginWithProvider'),
  onGoToCreateAccount: action('onGoToCreateAccount'),
  loginInProgress: false,
  error: null,
  claimedProductOptions,
};

export const Default = () => <LoginWithPurchaseClaimDialog {...defaultProps} />;

export const WeakPasswordErrorFromBackend = () => (
  <LoginWithPurchaseClaimDialog
    {...defaultProps}
    error={{
      code: 'auth/weak-password',
    }}
  />
);

export const InvalidEmailErrorFromBackend = () => (
  <LoginWithPurchaseClaimDialog
    {...defaultProps}
    error={{
      code: 'auth/invalid-email',
    }}
  />
);

export const AccountExistsWithDifferentCredentialErrorFromBackend = () => (
  <LoginWithPurchaseClaimDialog
    {...defaultProps}
    error={{
      code: 'auth/account-exists-with-different-credential',
    }}
  />
);

export const Submitting = () => (
  <LoginWithPurchaseClaimDialog {...defaultProps} loginInProgress />
);
