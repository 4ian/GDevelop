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

export const Default = (): renders* => <LoginWithPurchaseClaimDialog {...defaultProps} />;

export const WeakPasswordErrorFromBackend = (): renders* => (
  <LoginWithPurchaseClaimDialog
    {...defaultProps}
    error={{
      code: 'auth/weak-password',
    }}
  />
);

export const InvalidEmailErrorFromBackend = (): renders* => (
  <LoginWithPurchaseClaimDialog
    {...defaultProps}
    error={{
      code: 'auth/invalid-email',
    }}
  />
);

export const AccountExistsWithDifferentCredentialErrorFromBackend = (): renders* => (
  <LoginWithPurchaseClaimDialog
    {...defaultProps}
    error={{
      code: 'auth/account-exists-with-different-credential',
    }}
  />
);

export const Submitting = (): renders* => (
  <LoginWithPurchaseClaimDialog {...defaultProps} loginInProgress />
);
