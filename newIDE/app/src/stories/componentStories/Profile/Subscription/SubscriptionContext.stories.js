// @flow
import * as React from 'react';

import paperDecorator from '../../../PaperDecorator';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeAuthenticatedUserWithNoSubscription,
  fakeNotAuthenticatedUser,
  fakeGoldAuthenticatedUser,
  fakeGoldWithPurchaselyAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import {
  SubscriptionContext,
  SubscriptionProvider,
} from '../../../../Profile/Subscription/SubscriptionContext';
import AlertProvider from '../../../../UI/Alert/AlertProvider';
import Text from '../../../../UI/Text';

export default {
  title: 'Subscription/SubscriptionContext',
  component: SubscriptionContext,
  decorators: [paperDecorator],
};

const SubscriptionDialogTestOpener = ({ label }: {| label: string |}) => {
  const { openSubscriptionDialog } = React.useContext(SubscriptionContext);
  React.useEffect(
    () => {
      openSubscriptionDialog({
        analyticsMetadata: {
          reason: 'Cloud Project limit reached',
          recommendedPlanId: 'gdevelop_silver',
          placementId: 'max-projects-reached',
        },
      });
    },
    [openSubscriptionDialog]
  );

  return <Text>{label}</Text>;
};

export const NotAuthenticated = (): React.Node => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
        <SubscriptionProvider>
          <SubscriptionDialogTestOpener
            label={'SubscriptionDialog should be shown.'}
          />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
export const NoSubscriptionUser = (): React.Node => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <SubscriptionProvider>
          <SubscriptionDialogTestOpener
            label={'SubscriptionDialog should be shown.'}
          />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
export const GoldSubscribedUser = (): React.Node => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={fakeGoldAuthenticatedUser}>
        <SubscriptionProvider>
          <SubscriptionDialogTestOpener
            label={'SubscriptionDialog should be shown.'}
          />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
export const GoldWithPurchaselySubscribedUser = (): React.Node => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeGoldWithPurchaselyAuthenticatedUser}
      >
        <SubscriptionProvider>
          <SubscriptionDialogTestOpener label={'Alert should be shown.'} />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

export const NotAuthenticatedOnMobile = (): React.Node => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
        <SubscriptionProvider simulateMobileApp>
          <SubscriptionDialogTestOpener
            label={
              '`presentAppStorePresentationForPlacement` should be called.'
            }
          />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
export const NoSubscriptionUserOnMobile = (): React.Node => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <SubscriptionProvider simulateMobileApp>
          <SubscriptionDialogTestOpener
            label={
              '`presentAppStorePresentationForPlacement` should be called.'
            }
          />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
export const GoldSubscribedUserOnMobile = (): React.Node => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={fakeGoldAuthenticatedUser}>
        <SubscriptionProvider simulateMobileApp>
          <SubscriptionDialogTestOpener label={'Alert should be shown.'} />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
export const GoldWithPurchaselySubscribedUserOnMobile = (): React.Node => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeGoldWithPurchaselyAuthenticatedUser}
      >
        <SubscriptionProvider simulateMobileApp>
          <SubscriptionDialogTestOpener
            label={
              '`presentAppStorePresentationForPlacement` should be called.'
            }
          />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
