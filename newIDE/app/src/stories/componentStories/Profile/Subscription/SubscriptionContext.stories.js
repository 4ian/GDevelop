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

// $FlowFixMe[signature-verification-failure]
export const NotAuthenticated = () => {
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
// $FlowFixMe[signature-verification-failure]
export const NoSubscriptionUser = () => {
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
// $FlowFixMe[signature-verification-failure]
export const GoldSubscribedUser = () => {
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
// $FlowFixMe[signature-verification-failure]
export const GoldWithPurchaselySubscribedUser = () => {
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

// $FlowFixMe[signature-verification-failure]
export const NotAuthenticatedOnMobile = () => {
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
// $FlowFixMe[signature-verification-failure]
export const NoSubscriptionUserOnMobile = () => {
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
// $FlowFixMe[signature-verification-failure]
export const GoldSubscribedUserOnMobile = () => {
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
// $FlowFixMe[signature-verification-failure]
export const GoldWithPurchaselySubscribedUserOnMobile = () => {
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
