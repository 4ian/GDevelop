// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import MockAdapter from 'axios-mock-adapter';

import paperDecorator from '../../PaperDecorator';
import PurchaseClaimDialog from '../../../Profile/PurchaseClaimDialog';
import { client as shopApiAxiosClient } from '../../../Utils/GDevelopServices/Shop';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import {
  fakeSilverAuthenticatedUser,
  fakeNotAuthenticatedUser,
  fakeBundleListingData,
} from '../../../fixtures/GDevelopServicesTestData';
import RouterContext, {
  initialRouterState,
} from '../../../MainFrame/RouterContext';
import AlertProvider from '../../../UI/Alert/AlertProvider';

export default {
  title: 'PurchaseClaimDialog',
  component: PurchaseClaimDialog,
  decorators: [paperDecorator],
};

const purchaseId = 'purchase-id-123';
const claimableToken = 'claimable-token-123';

export const ReadyToActivate = () => {
  const shopServiceMock = new MockAdapter(shopApiAxiosClient, {
    delayResponse: 0,
  });
  shopServiceMock
    .onPost(`/purchase/${purchaseId}/action/claim`)
    .reply(config => {
      action('Claim purchase')();
      return [
        200,
        {
          id: purchaseId,
          productId: fakeBundleListingData.id,
          productType: 'BUNDLE',
          usageType: 'default',
          buyerId: 'buyer-id',
          receiverId: 'receiver-id',
          createdAt: new Date(1707519600000).toString(),
        },
      ];
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
        navigateToRoute: (routeName, args) => {
          action('Navigate to route')(routeName, args);
        },
      }}
    >
      <AlertProvider>
        <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
          <PurchaseClaimDialog
            claimedProductOptions={{
              productListingData: fakeBundleListingData,
              purchaseId,
              claimableToken,
            }}
            onClose={() => action('close')()}
          />
        </AuthenticatedUserContext.Provider>
      </AlertProvider>
    </RouterContext.Provider>
  );
};

export const NotLoggedIn = () => {
  return (
    <RouterContext.Provider
      value={{
        ...initialRouterState,
        navigateToRoute: (routeName, args) => {
          action('Navigate to route')(routeName, args);
        },
      }}
    >
      <AlertProvider>
        <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
          <PurchaseClaimDialog
            claimedProductOptions={{
              productListingData: fakeBundleListingData,
              purchaseId,
              claimableToken,
            }}
            onClose={() => action('close')()}
          />
        </AuthenticatedUserContext.Provider>
      </AlertProvider>
    </RouterContext.Provider>
  );
};

export const AlreadyClaimed = () => {
  const shopServiceMock = new MockAdapter(shopApiAxiosClient, {
    delayResponse: 0,
  });
  shopServiceMock
    .onPost(`/purchase/${purchaseId}/action/claim`)
    .reply(() => {
      return [
        400,
        {
          code: 'purchase/already-claimed',
          message: 'This purchase has already been claimed.',
        },
      ];
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
        navigateToRoute: (routeName, args) => {
          action('Navigate to route')(routeName, args);
        },
      }}
    >
      <AlertProvider>
        <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
          <PurchaseClaimDialog
            claimedProductOptions={{
              productListingData: fakeBundleListingData,
              purchaseId,
              claimableToken,
            }}
            onClose={() => action('close')()}
          />
        </AuthenticatedUserContext.Provider>
      </AlertProvider>
    </RouterContext.Provider>
  );
};

export const AlreadyOwned = () => {
  const shopServiceMock = new MockAdapter(shopApiAxiosClient, {
    delayResponse: 0,
  });
  shopServiceMock
    .onPost(`/purchase/${purchaseId}/action/claim`)
    .reply(() => {
      return [
        409,
        {
          code: 'purchase/already-owned',
          message: 'This account already owns this product.',
        },
      ];
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
        navigateToRoute: (routeName, args) => {
          action('Navigate to route')(routeName, args);
        },
      }}
    >
      <AlertProvider>
        <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
          <PurchaseClaimDialog
            claimedProductOptions={{
              productListingData: fakeBundleListingData,
              purchaseId,
              claimableToken,
            }}
            onClose={() => action('close')()}
          />
        </AuthenticatedUserContext.Provider>
      </AlertProvider>
    </RouterContext.Provider>
  );
};

export const InvalidToken = () => {
  const shopServiceMock = new MockAdapter(shopApiAxiosClient, {
    delayResponse: 0,
  });
  shopServiceMock
    .onPost(`/purchase/${purchaseId}/action/claim`)
    .reply(() => {
      return [
        403,
        {
          code: 'purchase/invalid-token',
          message: 'The token is invalid.',
        },
      ];
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
        navigateToRoute: (routeName, args) => {
          action('Navigate to route')(routeName, args);
        },
      }}
    >
      <AlertProvider>
        <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
          <PurchaseClaimDialog
            claimedProductOptions={{
              productListingData: fakeBundleListingData,
              purchaseId,
              claimableToken,
            }}
            onClose={() => action('close')()}
          />
        </AuthenticatedUserContext.Provider>
      </AlertProvider>
    </RouterContext.Provider>
  );
};
