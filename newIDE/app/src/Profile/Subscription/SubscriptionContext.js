// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import SubscriptionDialog from './SubscriptionDialog';
import {
  sendSubscriptionDialogShown,
  type SubscriptionDialogDisplayReason,
  type SubscriptionPlacementId,
} from '../../Utils/Analytics/EventSender';
import { isNativeMobileApp } from '../../Utils/Platform';
import {
  hasMobileAppStoreSubscriptionPlan,
  hasValidSubscriptionPlan,
  listSubscriptionPlanPricingSystems,
  listSubscriptionPlans,
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlan,
  type SubscriptionPlanPricingSystem,
} from '../../Utils/GDevelopServices/Usage';
import AuthenticatedUserContext from '../AuthenticatedUserContext';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import PromotionSubscriptionDialog from './PromotionSubscriptionDialog';
import SubscriptionPendingDialog from './SubscriptionPendingDialog';
import LoaderModal from '../../UI/LoaderModal';
import { useAsyncLazyMemo } from '../../Utils/UseLazyMemo';

export type SubscriptionType = 'individual' | 'team' | 'education';

export type SubscriptionAnalyticsMetadata = {|
  reason: SubscriptionDialogDisplayReason,
  recommendedPlanId?: string,
  placementId: SubscriptionPlacementId,
  preStep?: 'subscriptionChecker',
|};

const mergeSubscriptionPlansWithPrices = (
  subscriptionPlans: SubscriptionPlan[],
  subscriptionPlanPricingSystems: SubscriptionPlanPricingSystem[]
): SubscriptionPlanWithPricingSystems[] => {
  return subscriptionPlans
    .map(subscriptionPlan => {
      if (subscriptionPlan.id === 'free') {
        return {
          ...subscriptionPlan,
          pricingSystems: [],
        };
      }
      // Filter operation here keeps the order of the prices sent by the server.
      const matchingPricingSystems = subscriptionPlanPricingSystems.filter(
        pricingSystem => pricingSystem.planId === subscriptionPlan.id
      );
      if (matchingPricingSystems.length === 0) return null;
      return {
        ...subscriptionPlan,
        pricingSystems: matchingPricingSystems,
      };
    })
    .filter(Boolean);
};

const filterAvailableSubscriptionPlansWithPrices = (
  subscriptionPlansWithPricingSystems: SubscriptionPlanWithPricingSystems[]
): SubscriptionPlanWithPricingSystems[] => {
  const nonLegacyPlans = subscriptionPlansWithPricingSystems.filter(
    subscriptionPlanWithPrices => !subscriptionPlanWithPrices.isLegacy
  );
  const availableSubscriptionPlansWithPrices = nonLegacyPlans.map(
    planWithPricingSystems => ({
      ...planWithPricingSystems,
      pricingSystems: planWithPricingSystems.pricingSystems.filter(
        pricingSystem => pricingSystem.status === 'active'
      ),
    })
  );
  return availableSubscriptionPlansWithPrices;
};

type SubscriptionState = {|
  /**
   * Returns subscription plans with pricing systems, or null if not yet fetched.
   * Calling this function will trigger a fetch in the background if not already loaded.
   */
  getSubscriptionPlansWithPricingSystems: () =>
    | SubscriptionPlanWithPricingSystems[]
    | null,
  /**
   * Returns subscription plans with pricing systems including legacy plans, or null if not yet fetched.
   * Calling this function will trigger a fetch in the background if not already loaded.
   */
  getSubscriptionPlansWithPricingSystemsIncludingLegacy: () =>
    | SubscriptionPlanWithPricingSystems[]
    | null,
  /**
   * Call this when a subscription or subscription upgrade is required.
   */
  openSubscriptionDialog: ({|
    analyticsMetadata: SubscriptionAnalyticsMetadata,
    filter?: SubscriptionType,
  |}) => void,
  openSubscriptionPendingDialog: () => void,
|};

export const SubscriptionContext = React.createContext<SubscriptionState>({
  getSubscriptionPlansWithPricingSystems: () => null,
  getSubscriptionPlansWithPricingSystemsIncludingLegacy: () => null,
  openSubscriptionDialog: () => {},
  openSubscriptionPendingDialog: () => {},
});

type SubscriptionProviderProps = {|
  children: React.Node,
  simulateMobileApp?: true,
|};

export const SubscriptionProvider = ({
  children,
  simulateMobileApp,
}: SubscriptionProviderProps) => {
  const [
    analyticsMetadata,
    setAnalyticsMetadata,
  ] = React.useState<?SubscriptionAnalyticsMetadata>(null);
  const recommendedPlanId = analyticsMetadata
    ? analyticsMetadata.recommendedPlanId
    : null;
  const [filter, setFilter] = React.useState<
    'individual' | 'team' | 'education' | null
  >(null);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { showAlert } = useAlertDialog();
  const [
    subscriptionPendingDialogOpen,
    setSubscriptionPendingDialogOpen,
  ] = React.useState(false);
  const userId =
    authenticatedUser && authenticatedUser.profile
      ? authenticatedUser.profile.id
      : null;
  const getAuthorizationHeader = authenticatedUser
    ? authenticatedUser.getAuthorizationHeader
    : null;

  // Fetch subscription plans lazily - only when requested
  const fetchSubscriptionPlansAndPrices = React.useCallback(
    async (): Promise<{
      subscriptionPlansWithPricingSystems: SubscriptionPlanWithPricingSystems[],
      subscriptionPlansWithPricingSystemsIncludingLegacy: SubscriptionPlanWithPricingSystems[],
    }> => {
      console.info(
        `Fetching subscription plans and pricing systems (includeLegacy=true, userId=${userId ||
          'null'})...`
      );

      const [
        subscriptionPlans,
        subscriptionPlanPricingSystems,
      ] = await Promise.all([
        listSubscriptionPlans({
          includeLegacy: true,
          getAuthorizationHeader,
          userId,
        }),
        listSubscriptionPlanPricingSystems({
          includeLegacy: true,
          getAuthorizationHeader,
          userId,
        }),
      ]);

      const merged = mergeSubscriptionPlansWithPrices(
        subscriptionPlans,
        subscriptionPlanPricingSystems
      );

      return {
        subscriptionPlansWithPricingSystemsIncludingLegacy: merged,
        subscriptionPlansWithPricingSystems: filterAvailableSubscriptionPlansWithPrices(
          merged
        ),
      };
    },
    [getAuthorizationHeader, userId]
  );

  const getSubscriptionPlansData = useAsyncLazyMemo(
    fetchSubscriptionPlansAndPrices
  );

  const getSubscriptionPlansWithPricingSystems = React.useCallback(
    () => {
      const data = getSubscriptionPlansData();
      return data ? data.subscriptionPlansWithPricingSystems : null;
    },
    [getSubscriptionPlansData]
  );

  const getSubscriptionPlansWithPricingSystemsIncludingLegacy = React.useCallback(
    () => {
      const data = getSubscriptionPlansData();
      return data
        ? data.subscriptionPlansWithPricingSystemsIncludingLegacy
        : null;
    },
    [getSubscriptionPlansData]
  );

  const openSubscriptionPendingDialog = React.useCallback(
    () => setSubscriptionPendingDialogOpen(true),
    []
  );

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
        setFilter(subscriptionsFilter || null);
        setAnalyticsMetadata(metadata);
      }
    },
    [authenticatedUser.subscription, showAlert, simulateMobileApp]
  );

  const getUserLegacySubscriptionPlanWithPricingSystem = React.useCallback(
    () => {
      const subscriptionPlansWithPricingSystems = getSubscriptionPlansWithPricingSystems();
      if (
        !authenticatedUser.subscription ||
        !authenticatedUser.subscription.planId ||
        !authenticatedUser.subscription.pricingSystemId ||
        !subscriptionPlansWithPricingSystems
      ) {
        return null;
      }
      const {
        planId: userPlanId,
        pricingSystemId: userPricingSystemId,
      } = authenticatedUser.subscription;
      const userPlanWithPricingSystems = subscriptionPlansWithPricingSystems.find(
        planWithPricingSystems => planWithPricingSystems.id === userPlanId
      );
      if (!userPlanWithPricingSystems || !userPlanWithPricingSystems.isLegacy) {
        return null;
      }
      const userPricingSystem = userPlanWithPricingSystems.pricingSystems.find(
        pricingSystem => pricingSystem.id === userPricingSystemId
      );
      if (!userPricingSystem) return null;
      return {
        ...userPlanWithPricingSystems,
        pricingSystems: [userPricingSystem],
      };
    },
    [getSubscriptionPlansWithPricingSystems, authenticatedUser.subscription]
  );

  const value = React.useMemo(
    () => ({
      getSubscriptionPlansWithPricingSystems,
      getSubscriptionPlansWithPricingSystemsIncludingLegacy,
      openSubscriptionDialog,
      openSubscriptionPendingDialog,
    }),
    [
      getSubscriptionPlansWithPricingSystems,
      getSubscriptionPlansWithPricingSystemsIncludingLegacy,
      openSubscriptionDialog,
      openSubscriptionPendingDialog,
    ]
  );

  // When the analyticsMetadata is set, a dialog is shown so we can send an event.
  React.useEffect(
    () => {
      if (analyticsMetadata) {
        sendSubscriptionDialogShown(analyticsMetadata);
      }
    },
    [analyticsMetadata]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      {subscriptionPendingDialogOpen && (
        <SubscriptionPendingDialog
          authenticatedUser={authenticatedUser}
          onClose={() => {
            setSubscriptionPendingDialogOpen(false);
            authenticatedUser.onRefreshSubscription();
          }}
          onSuccess={closeSubscriptionDialog}
        />
      )}
      {analyticsMetadata ? (
        authenticatedUser.loginState === 'loggingIn' ? (
          <LoaderModal showImmediately />
        ) : !hasValidSubscriptionPlan(authenticatedUser.subscription) &&
          recommendedPlanId ? (
          <PromotionSubscriptionDialog
            availableSubscriptionPlansWithPrices={getSubscriptionPlansWithPricingSystems()}
            onClose={closeSubscriptionDialog}
            recommendedPlanId={recommendedPlanId}
            onOpenPendingDialog={(open: boolean) =>
              setSubscriptionPendingDialogOpen(open)
            }
          />
        ) : (
          <SubscriptionDialog
            availableSubscriptionPlansWithPrices={getSubscriptionPlansWithPricingSystems()}
            userLegacySubscriptionPlanWithPricingSystem={getUserLegacySubscriptionPlanWithPricingSystem()}
            onClose={closeSubscriptionDialog}
            filter={filter}
            onOpenPendingDialog={(open: boolean) =>
              setSubscriptionPendingDialogOpen(open)
            }
          />
        )
      ) : null}
    </SubscriptionContext.Provider>
  );
};
