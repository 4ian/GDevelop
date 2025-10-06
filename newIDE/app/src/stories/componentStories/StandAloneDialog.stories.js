// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import MockAdapter from 'axios-mock-adapter';

import paperDecorator from '../PaperDecorator';
import StandAloneDialog from '../../MainFrame/StandAloneDialog';
import {
  client as assetApiAxiosClient,
  type Bundle,
} from '../../Utils/GDevelopServices/Asset';
import { client as userApiAxiosClient } from '../../Utils/GDevelopServices/User';
import { client as shopApiAxiosClient } from '../../Utils/GDevelopServices/Shop';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import {
  fakeAssetPackLicenses,
  fakeBundle,
  fakeBundleListingData,
  fakePrivateAssetPack1ListingData,
  fakePrivateAssetPack2ListingData,
  fakePrivateGameTemplateListingData,
  fakeSilverAuthenticatedUserWithCloudProjects,
} from '../../fixtures/GDevelopServicesTestData';
import {
  BundleStoreContext,
  initialBundleStoreState,
} from '../../AssetStore/Bundles/BundleStoreContext';
import {
  initialPrivateGameTemplateStoreState,
  PrivateGameTemplateStoreContext,
} from '../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import {
  AssetStoreContext,
  initialAssetStoreState,
} from '../../AssetStore/AssetStoreContext';
import { ProductLicenseStoreStateProvider } from '../../AssetStore/ProductLicense/ProductLicenseStoreContext';
import { SubscriptionSuggestionProvider } from '../../Profile/Subscription/SubscriptionSuggestionContext';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import CourseStoreContext, {
  initialCourseStoreState,
} from '../../Course/CourseStoreContext';
import {
  CreditsPackageStoreContext,
  initialCreditsPackageStoreState,
} from '../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import RouterContext, {
  initialRouterState,
} from '../../MainFrame/RouterContext';

export default {
  title: 'StandAloneDialog',
  component: StandAloneDialog,
  decorators: [paperDecorator],
};

const sellerPublicProfile = {
  id: 'tVUYpNMz1AfsbzJtxUEpPTuu4Mn1',
  username: 'CreatorUserName',
  description: 'I create bundles for GDevelop.',
};

const allBundleListingData = [fakeBundleListingData];

const allPrivateAssetPackListingData = [
  fakePrivateAssetPack1ListingData,
  fakePrivateAssetPack2ListingData,
];

const allPrivateGameTemplateListingData = [fakePrivateGameTemplateListingData];

const mockCourses = [];

const StandAloneDialogStory = ({
  bundleCategory,
  receivedBundles = [],
  authenticatedUser = fakeSilverAuthenticatedUserWithCloudProjects,
  delayResponse = 0,
  errorCode,
  errorMessage,
}: {
  bundleCategory: string,
  authenticatedUser?: AuthenticatedUser,
  receivedBundles?: Array<Bundle>,
  delayResponse?: number,
  errorCode?: number,
  errorMessage?: string,
}) => {
  const userServiceMock = new MockAdapter(userApiAxiosClient, {
    delayResponse,
  });
  userServiceMock
    .onGet(`/user-public-profile/${fakeBundleListingData.sellerId}`)
    .reply(200, sellerPublicProfile)
    .onGet(`/user/${fakeBundleListingData.sellerId}/badge`)
    .reply(200, [])
    .onGet(`/achievement`)
    .reply(200, []);

  const assetServiceMock = new MockAdapter(assetApiAxiosClient, {
    delayResponse,
  });
  assetServiceMock
    .onGet(`/bundle/${fakeBundleListingData.id}`)
    .reply(errorCode || 200, errorCode ? errorMessage || null : fakeBundle)
    .onGet(`/course`)
    .reply(200, mockCourses)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  const shopServiceMock = new MockAdapter(shopApiAxiosClient, {
    delayResponse,
  });
  shopServiceMock
    .onGet('/product-license')
    .reply(200, fakeAssetPackLicenses)
    .onPost(`/product/${fakeBundleListingData.id}/action/redeem`)
    .reply(config => {
      action('Claim bundle')();
      return [200, 'OK'];
    })
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <RouterContext.Provider
      value={{
        ...initialRouterState,
        routeArguments: {
          'bundle-category': bundleCategory,
        },
        removeRouteArguments: () => {},
        navigateToRoute: (routeName, args) => {
          action('Navigate to route')(routeName, args);
        },
      }}
    >
      <BundleStoreContext.Provider
        value={{
          ...initialBundleStoreState,
          bundleListingDatas: allBundleListingData,
        }}
      >
        <PrivateGameTemplateStoreContext.Provider
          value={{
            ...initialPrivateGameTemplateStoreState,
            privateGameTemplateListingDatas: allPrivateGameTemplateListingData,
          }}
        >
          <AssetStoreContext.Provider
            value={{
              ...initialAssetStoreState,
              privateAssetPackListingDatas: allPrivateAssetPackListingData,
            }}
          >
            <AuthenticatedUserContext.Provider
              value={{
                ...authenticatedUser,
                receivedBundles,
                bundlePurchases: receivedBundles.map(receivedBundle => ({
                  id: 'purchase-id',
                  productType: 'BUNDLE',
                  usageType: 'commercial',
                  productId: receivedBundle.id,
                  buyerId: authenticatedUser.profile
                    ? authenticatedUser.profile.id
                    : 'userId',
                  receiverId: authenticatedUser.profile
                    ? authenticatedUser.profile.id
                    : 'userId',
                  createdAt: new Date(1707519600000).toString(),
                })),
              }}
            >
              <CourseStoreContext.Provider
                value={{
                  ...initialCourseStoreState,
                  listedCourses: [],
                }}
              >
                <CreditsPackageStoreContext.Provider
                  value={{
                    ...initialCreditsPackageStoreState,
                    creditsPackageListingDatas: [],
                  }}
                >
                  <SubscriptionSuggestionProvider>
                    <ProductLicenseStoreStateProvider>
                      <StandAloneDialog onClose={() => action('close')()} />
                    </ProductLicenseStoreStateProvider>
                  </SubscriptionSuggestionProvider>
                </CreditsPackageStoreContext.Provider>
              </CourseStoreContext.Provider>
            </AuthenticatedUserContext.Provider>
          </AssetStoreContext.Provider>
        </PrivateGameTemplateStoreContext.Provider>
      </BundleStoreContext.Provider>
    </RouterContext.Provider>
  );
};

export const Default = () => <StandAloneDialogStory bundleCategory="starter" />;

export const Loading = () => (
  <StandAloneDialogStory bundleCategory="starter" delayResponse={10000} />
);
