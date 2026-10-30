// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import ClaimableProductsDialog from '../../../../AssetStore/ClaimableProducts/ClaimableProductsDialog';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import PreferencesContext, {
  initialPreferences,
} from '../../../../MainFrame/Preferences/PreferencesContext';
import { fakeGoldAuthenticatedUser } from '../../../../fixtures/GDevelopServicesTestData';
import {
  claimableAssetPackListingData,
  claimableGameTemplateListingData,
} from './ClaimableProductsFixtures';

export default {
  title: 'AssetStore/ClaimableProducts/ClaimableProductsDialog',
  component: ClaimableProductsDialog,
  decorators: [paperDecorator],
};

const PreferencesProviderMock = ({ children }: {| children: React.Node |}) => {
  const [
    autoDisplayClaimableProductsDialog,
    setAutoDisplayClaimableProductsDialog,
  ] = React.useState<boolean>(true);
  const preferences = {
    ...initialPreferences,
    values: {
      ...initialPreferences.values,
      autoDisplayClaimableProductsDialog,
    },
    setAutoDisplayClaimableProductsDialog,
  };
  return (
    // $FlowFixMe[incompatible-type]
    <PreferencesContext.Provider value={preferences}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const AssetPackAndGameTemplate = (): React.Node => (
  <PreferencesProviderMock>
    <AuthenticatedUserContext.Provider
      value={{ ...fakeGoldAuthenticatedUser, receivedGameTemplates: [] }}
    >
      <ClaimableProductsDialog
        productListingDatas={[
          claimableAssetPackListingData,
          claimableGameTemplateListingData,
        ]}
        onClose={action('onClose')}
      />
    </AuthenticatedUserContext.Provider>
  </PreferencesProviderMock>
);

export const OnlyGameTemplate = (): React.Node => (
  <PreferencesProviderMock>
    <AuthenticatedUserContext.Provider
      value={{ ...fakeGoldAuthenticatedUser, receivedGameTemplates: [] }}
    >
      <ClaimableProductsDialog
        productListingDatas={[claimableGameTemplateListingData]}
        onClose={action('onClose')}
      />
    </AuthenticatedUserContext.Provider>
  </PreferencesProviderMock>
);
