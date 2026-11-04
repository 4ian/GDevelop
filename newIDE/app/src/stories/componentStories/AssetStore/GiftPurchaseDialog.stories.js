// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import GiftPurchaseDialog from '../../../AssetStore/Gift/GiftPurchaseDialog';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import {
  fakeBundleListingData,
  fakeSilverAuthenticatedUser,
  fakeNotAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'AssetStore/GiftPurchaseDialog',
  component: GiftPurchaseDialog,
  decorators: [paperDecorator],
};

export const LoggedIn = (): React.Node => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GiftPurchaseDialog
      productListingData={fakeBundleListingData}
      usageType="default"
      onClose={() => action('close')()}
    />
  </AuthenticatedUserContext.Provider>
);

export const NotLoggedIn = (): React.Node => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <GiftPurchaseDialog
      productListingData={fakeBundleListingData}
      usageType="default"
      onClose={() => action('close')()}
    />
  </AuthenticatedUserContext.Provider>
);
