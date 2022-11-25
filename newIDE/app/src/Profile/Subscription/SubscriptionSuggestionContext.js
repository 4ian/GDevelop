// @flow
import * as React from 'react';
import SubscriptionDialog from './SubscriptionDialog';

type SubscriptionSuggestionState = {|
  openSubscriptionDialog: ({|
    reason: string,
    preStep?: 'subscriptionChecker',
  |}) => void,
|};

export const SubscriptionSuggestionContext = React.createContext<SubscriptionSuggestionState>(
  {
    openSubscriptionDialog: () => {},
  }
);

type SubscriptionSuggestionProviderProps = {|
  children: React.Node,
|};

export const SubscriptionSuggestionProvider = ({
  children,
}: SubscriptionSuggestionProviderProps) => {
  const [analyticsMetadata, setAnalyticsMetadata] = React.useState<?{|
    reason: string,
    preStep?: 'subscriptionChecker',
  |}>(null);

  const closeSubscriptionDialog = () => setAnalyticsMetadata(null);

  const openSubscriptionDialog = metadata => setAnalyticsMetadata(metadata);

  return (
    <SubscriptionSuggestionContext.Provider value={{ openSubscriptionDialog }}>
      {children}
      {analyticsMetadata && (
        <SubscriptionDialog
          open
          onClose={closeSubscriptionDialog}
          analyticsMetadata={analyticsMetadata}
        />
      )}
    </SubscriptionSuggestionContext.Provider>
  );
};
