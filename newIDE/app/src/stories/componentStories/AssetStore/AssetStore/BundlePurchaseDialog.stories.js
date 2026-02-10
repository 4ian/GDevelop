// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import BundlePurchaseDialog from '../../../../AssetStore/Bundles/BundlePurchaseDialog';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeSilverAuthenticatedUser,
  fakeNotAuthenticatedUser,
  fakeBundleListingData,
} from '../../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'AssetStore/AssetStore/BundlePurchaseDialog',
  component: BundlePurchaseDialog,
  decorators: [paperDecorator],
  parameters: {
    initialState: {
      isBuying: true,
    },
  },
};

export const NotLoggedIn = (): React.Node => {
  return (
    <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
      <BundlePurchaseDialog
        bundleListingData={fakeBundleListingData}
        usageType="default"
        onClose={() => action('close')()}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const LoggedIn = (): React.Node => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <BundlePurchaseDialog
        bundleListingData={fakeBundleListingData}
        usageType="default"
        onClose={() => action('close')()}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const FastCheckout = (): React.Node => {
  return (
    <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
      <BundlePurchaseDialog
        bundleListingData={fakeBundleListingData}
        usageType="default"
        onClose={() => action('close')()}
        fastCheckout
      />
    </AuthenticatedUserContext.Provider>
  );
};
