// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import CreateAccountWithPurchaseClaimDialog from '../../../Profile/CreateAccountWithPurchaseClaimDialog';
import { fakeBundleListingData } from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Profile/CreateAccountWithPurchaseClaimDialog',
  component: CreateAccountWithPurchaseClaimDialog,
  decorators: [paperDecorator],
};

const claimedProductOptions = {
  productListingData: fakeBundleListingData,
  purchaseId: 'purchase-123',
  claimableToken: 'token-123',
};

const defaultProps = {
  onClose: () => action('onClose')(),
  onGoToLogin: action('onGoToLogin'),
  onCreateAccount: action('onCreateAccount'),
  onLoginWithProvider: action('onLoginWithProvider'),
  createAccountInProgress: false,
  error: null,
  claimedProductOptions,
};

export const Default = () => (
  <CreateAccountWithPurchaseClaimDialog {...defaultProps} />
);

export const PasswordErrorFromBackend = () => (
  <CreateAccountWithPurchaseClaimDialog
    {...defaultProps}
    error={{ code: 'auth/weak-password' }}
  />
);

export const EmailErrorFromBackend = () => (
  <CreateAccountWithPurchaseClaimDialog
    {...defaultProps}
    error={{ code: 'auth/invalid-email' }}
  />
);

export const AccountExists = () => (
  <CreateAccountWithPurchaseClaimDialog
    {...defaultProps}
    error={{ code: 'auth/account-exists-with-different-credential' }}
  />
);

export const Submitting = () => (
  <CreateAccountWithPurchaseClaimDialog
    {...defaultProps}
    createAccountInProgress
  />
);
