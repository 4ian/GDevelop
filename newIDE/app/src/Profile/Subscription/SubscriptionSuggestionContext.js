// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import SubscriptionDialog from './SubscriptionDialog';
import { type SubscriptionDialogDisplayReason } from '../../Utils/Analytics/EventSender';
import { isNativeMobileApp } from '../../Utils/Platform';
import {
  hasMobileAppStoreSubscriptionPlan,
  hasValidSubscriptionPlan,
} from '../../Utils/GDevelopServices/Usage';
import AuthenticatedUserContext from '../AuthenticatedUserContext';
import useAlertDialog from '../../UI/Alert/useAlertDialog';

export type SubscriptionAnalyticsMetadata = {|
  reason: SubscriptionDialogDisplayReason,
  preStep?: 'subscriptionChecker',
|};

export type SubscriptionType = 'individual' | 'team' | 'education';

type SubscriptionSuggestionState = {|
  /**
   * Call this when a subscription or subscription upgrade is required.
   */
  openSubscriptionDialog: ({|
    analyticsMetadata: SubscriptionAnalyticsMetadata,
    filter?: SubscriptionType,
  |}) => void,
|};

export const SubscriptionSuggestionContext = React.createContext<SubscriptionSuggestionState>(
  {
    openSubscriptionDialog: () => {},
  }
);

type SubscriptionSuggestionProviderProps = {|
  children: React.Node,
  simulateMobileApp?: true,
|};

export const SubscriptionSuggestionProvider = ({
  children,
  simulateMobileApp,
}: SubscriptionSuggestionProviderProps) => {
  const [analyticsMetadata, setAnalyticsMetadata] = React.useState<?{|
    reason: SubscriptionDialogDisplayReason,
    preStep?: 'subscriptionChecker',
  |}>(null);
  const [filter, setFilter] = React.useState<
    'individual' | 'team' | 'education' | null
  >(null);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { showAlert } = useAlertDialog();

  const closeSubscriptionDialog = () => setAnalyticsMetadata(null);

  const openSubscriptionDialog = React.useCallback(
    ({ analyticsMetadata: metadata, filter: subscriptionsFilter }) => {
      if (isNativeMobileApp() || simulateMobileApp) {
        if (hasValidSubscriptionPlan(authenticatedUser.subscription)) {
          if (
            !hasMobileAppStoreSubscriptionPlan(authenticatedUser.subscription)
          ) {
            showAlert({
              title: t`Subscription outside the app store`,
              message: t`The subscription of this account comes from outside the app store. Connect with your account on gdevelop.io from your web-browser to manage it.`,
            });
            return;
          }
        }

        // Would present App Store screen.
      } else {
        if (hasMobileAppStoreSubscriptionPlan(authenticatedUser.subscription)) {
          showAlert({
            title: t`Subscription with the Apple App store or Google Play store`,
            message: t`The subscription of this account was done using Apple or Google Play. Connect on your account on your Apple or Google device to manage it.`,
          });
          return;
        }

        setFilter(subscriptionsFilter || null);
        setAnalyticsMetadata(metadata);
      }
    },
    [authenticatedUser.subscription, showAlert, simulateMobileApp]
  );

  const value = React.useMemo(() => ({ openSubscriptionDialog }), [
    openSubscriptionDialog,
  ]);

  return (
    <SubscriptionSuggestionContext.Provider value={value}>
      {children}
      {analyticsMetadata && (
        <SubscriptionDialog
          open
          onClose={closeSubscriptionDialog}
          analyticsMetadata={analyticsMetadata}
          filter={filter}
        />
      )}
    </SubscriptionSuggestionContext.Provider>
  );
};
