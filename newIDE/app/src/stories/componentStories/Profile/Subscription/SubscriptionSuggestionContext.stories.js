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
  SubscriptionSuggestionContext,
  SubscriptionSuggestionProvider,
} from '../../../../Profile/Subscription/SubscriptionSuggestionContext';
import AlertProvider from '../../../../UI/Alert/AlertProvider';
import Text from '../../../../UI/Text';

export default {
  title: 'Subscription/SubscriptionSuggestionContext',
  component: SubscriptionSuggestionContext,
  decorators: [paperDecorator],
};

const SubscriptionDialogTestOpener = ({ label }: {| label: string |}) => {
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  React.useEffect(
    () => {
      openSubscriptionDialog({
        analyticsMetadata: {
          reason: 'Cloud Project limit reached',
        },
      });
    },
    [openSubscriptionDialog]
  );

  return <Text>{label}</Text>;
};

export const NotAuthenticated = () => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
        <SubscriptionSuggestionProvider>
          <SubscriptionDialogTestOpener
            label={'SubscriptionDialog should be shown.'}
          />
        </SubscriptionSuggestionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
export const NoSubscriptionUser = () => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <SubscriptionSuggestionProvider>
          <SubscriptionDialogTestOpener
            label={'SubscriptionDialog should be shown.'}
          />
        </SubscriptionSuggestionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
export const GoldSubscribedUser = () => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={fakeGoldAuthenticatedUser}>
        <SubscriptionSuggestionProvider>
          <SubscriptionDialogTestOpener
            label={'SubscriptionDialog should be shown.'}
          />
        </SubscriptionSuggestionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
export const GoldWithPurchaselySubscribedUser = () => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeGoldWithPurchaselyAuthenticatedUser}
      >
        <SubscriptionSuggestionProvider>
          <SubscriptionDialogTestOpener label={'Alert should be shown.'} />
        </SubscriptionSuggestionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

export const NotAuthenticatedOnMobile = () => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
        <SubscriptionSuggestionProvider simulateMobileApp>
          <SubscriptionDialogTestOpener
            label={
              '`presentAppStorePresentationForPlacement` should be called.'
            }
          />
        </SubscriptionSuggestionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
export const NoSubscriptionUserOnMobile = () => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <SubscriptionSuggestionProvider simulateMobileApp>
          <SubscriptionDialogTestOpener
            label={
              '`presentAppStorePresentationForPlacement` should be called.'
            }
          />
        </SubscriptionSuggestionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
export const GoldSubscribedUserOnMobile = () => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={fakeGoldAuthenticatedUser}>
        <SubscriptionSuggestionProvider simulateMobileApp>
          <SubscriptionDialogTestOpener label={'Alert should be shown.'} />
        </SubscriptionSuggestionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
export const GoldWithPurchaselySubscribedUserOnMobile = () => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeGoldWithPurchaselyAuthenticatedUser}
      >
        <SubscriptionSuggestionProvider simulateMobileApp>
          <SubscriptionDialogTestOpener
            label={
              '`presentAppStorePresentationForPlacement` should be called.'
            }
          />
        </SubscriptionSuggestionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
