// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import MockAdapter from 'axios-mock-adapter';

import paperDecorator from '../../../PaperDecorator';
import BundleInformationPage from '../../../../AssetStore/Bundles/BundleInformationPage';
import {
  client as assetApiAxiosClient,
  type Bundle,
  type Course,
} from '../../../../Utils/GDevelopServices/Asset';
import { client as userApiAxiosClient } from '../../../../Utils/GDevelopServices/User';
import { client as shopApiAxiosClient } from '../../../../Utils/GDevelopServices/Shop';
import { type BundleListingData } from '../../../../Utils/GDevelopServices/Shop';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeAssetPackLicenses,
  fakeBundle,
  fakeBundleListingData,
  fakePrivateAssetPack1ListingData,
  fakePrivateAssetPack2ListingData,
  fakePrivateGameTemplateListingData,
  fakeSilverAuthenticatedUserWithCloudProjects,
} from '../../../../fixtures/GDevelopServicesTestData';
import {
  BundleStoreContext,
  initialBundleStoreState,
} from '../../../../AssetStore/Bundles/BundleStoreContext';
import {
  initialPrivateGameTemplateStoreState,
  PrivateGameTemplateStoreContext,
} from '../../../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import {
  AssetStoreContext,
  initialAssetStoreState,
} from '../../../../AssetStore/AssetStoreContext';
import { ProductLicenseStoreStateProvider } from '../../../../AssetStore/ProductLicense/ProductLicenseStoreContext';
import { SubscriptionProvider } from '../../../../Profile/Subscription/SubscriptionContext';
import { type AuthenticatedUser } from '../../../../Profile/AuthenticatedUserContext';
import CourseStoreContext, {
  initialCourseStoreState,
} from '../../../../Course/CourseStoreContext';
import {
  CreditsPackageStoreContext,
  initialCreditsPackageStoreState,
} from '../../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';

export default {
  title: 'AssetStore/AssetStore/BundleInformationPage',
  component: BundleInformationPage,
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

const mockCourses: Array<Course> = [];

const BundleInformationPageStory = ({
  bundleListingDataToDisplay,
  receivedBundles = [],
  authenticatedUser = fakeSilverAuthenticatedUserWithCloudProjects,
  delayResponse = 0,
  errorCode,
  errorMessage,
}: {
  bundleListingDataToDisplay: BundleListingData,
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
    .onGet(`/user-public-profile/${bundleListingDataToDisplay.sellerId}`)
    .reply(200, sellerPublicProfile)
    .onGet(`/user/${bundleListingDataToDisplay.sellerId}/badge`)
    .reply(200, [])
    .onGet(`/achievement`)
    .reply(200, []);

  const assetServiceMock = new MockAdapter(assetApiAxiosClient, {
    delayResponse,
  });
  assetServiceMock
    .onGet(`/bundle/${bundleListingDataToDisplay.id}`)
    .reply(errorCode || 200, errorCode ? errorMessage || null : fakeBundle)
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
    .onPost(`/product/${bundleListingDataToDisplay.id}/action/redeem`)
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
                listedCourseChapters: [],
              }}
            >
              <CreditsPackageStoreContext.Provider
                value={{
                  ...initialCreditsPackageStoreState,
                  creditsPackageListingDatas: [],
                }}
              >
                <SubscriptionProvider>
                  <ProductLicenseStoreStateProvider>
                    <BundleInformationPage
                      bundleListingData={bundleListingDataToDisplay}
                      onAssetPackOpen={() => action('open asset pack')()}
                      onGameTemplateOpen={() => action('open game template')()}
                      onBundleOpen={() => action('open bundle')()}
                      onCourseOpen={() => action('open course')()}
                      courses={mockCourses}
                      getCourseCompletion={() => null}
                    />
                  </ProductLicenseStoreStateProvider>
                </SubscriptionProvider>
              </CreditsPackageStoreContext.Provider>
            </CourseStoreContext.Provider>
          </AuthenticatedUserContext.Provider>
        </AssetStoreContext.Provider>
      </PrivateGameTemplateStoreContext.Provider>
    </BundleStoreContext.Provider>
  );
};

export const Default = () => (
  <BundleInformationPageStory
    bundleListingDataToDisplay={fakeBundleListingData}
  />
);

export const ForAlreadyPurchasedBundle = () => (
  <BundleInformationPageStory
    bundleListingDataToDisplay={fakeBundleListingData}
    receivedBundles={[fakeBundle]}
  />
);

export const Loading = () => (
  <BundleInformationPageStory
    bundleListingDataToDisplay={fakeBundleListingData}
    delayResponse={10000}
  />
);

export const With404 = () => (
  <BundleInformationPageStory
    bundleListingDataToDisplay={fakeBundleListingData}
    errorCode={404}
  />
);

export const WithUnknownError = () => (
  <BundleInformationPageStory
    bundleListingDataToDisplay={fakeBundleListingData}
    errorCode={500}
    errorMessage={'Internal server error'}
  />
);
