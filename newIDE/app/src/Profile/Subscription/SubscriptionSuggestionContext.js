// @flow
import * as React from 'react';
import SubscriptionDialog from './SubscriptionDialog';
import { type SubscriptionDialogDisplayReason } from '../../Utils/Analytics/EventSender';

type SubscriptionSuggestionState = {|
  openSubscriptionDialog: ({|
    reason: SubscriptionDialogDisplayReason,
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
    reason: SubscriptionDialogDisplayReason,
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
