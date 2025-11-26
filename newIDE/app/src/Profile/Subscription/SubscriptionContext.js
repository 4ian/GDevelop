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
  subscriptionPlansWithPricingSystems:
    | SubscriptionPlanWithPricingSystems[]
    | null,
  subscriptionPlansWithPricingSystemsIncludingLegacy:
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
  subscriptionPlansWithPricingSystems: null,
  subscriptionPlansWithPricingSystemsIncludingLegacy: null,
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
  const [filter, setFilter] = React.useState<
    'individual' | 'team' | 'education' | null
  >(null);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { showAlert } = useAlertDialog();
  const [
    subscriptionPendingDialogOpen,
    setSubscriptionPendingDialogOpen,
  ] = React.useState(false);
  const isLoading = React.useRef<boolean>(false);

  // Fetch subscription plans on mount
  const [
    subscriptionPlansWithPricingSystems,
    setSubscriptionPlansWithPricingSystems,
  ] = React.useState<SubscriptionPlanWithPricingSystems[] | null>(null);
  const [
    subscriptionPlansWithPricingSystemsIncludingLegacy,
    setSubscriptionPlansWithPricingSystemsIncludingLegacy,
  ] = React.useState<SubscriptionPlanWithPricingSystems[] | null>(null);

  const fetchSubscriptionPlansAndPrices = React.useCallback(
    async () => {
      // If the sub plans are already loaded, don't load them again.
      if (
        isLoading.current ||
        (subscriptionPlansWithPricingSystemsIncludingLegacy &&
          subscriptionPlansWithPricingSystems)
      )
        return;

      isLoading.current = true;
      try {
        const userId =
          authenticatedUser && authenticatedUser.profile
            ? authenticatedUser.profile.id
            : null;
        const getAuthorizationHeader = authenticatedUser
          ? authenticatedUser.getAuthorizationHeader
          : null;

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

        setSubscriptionPlansWithPricingSystemsIncludingLegacy(merged);
        setSubscriptionPlansWithPricingSystems(
          filterAvailableSubscriptionPlansWithPrices(merged)
        );
      } catch (error) {
        console.error(
          'Error while fetching subscription plans and pricing systems:',
          error
        );
      } finally {
        isLoading.current = false;
      }
    },
    [
      authenticatedUser,
      subscriptionPlansWithPricingSystems,
      subscriptionPlansWithPricingSystemsIncludingLegacy,
    ]
  );

  React.useEffect(
    () => {
      if (isLoading.current) return;

      fetchSubscriptionPlansAndPrices();
    },
    [fetchSubscriptionPlansAndPrices]
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

  const userLegacySubscriptionPlanWithPricingSystem = React.useMemo(
    () => {
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
    [subscriptionPlansWithPricingSystems, authenticatedUser.subscription]
  );

  const value = React.useMemo(
    () => ({
      subscriptionPlansWithPricingSystems,
      subscriptionPlansWithPricingSystemsIncludingLegacy,
      openSubscriptionDialog,
      openSubscriptionPendingDialog,
    }),
    [
      subscriptionPlansWithPricingSystems,
      subscriptionPlansWithPricingSystemsIncludingLegacy,
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
          analyticsMetadata.recommendedPlanId ? (
          <PromotionSubscriptionDialog
            availableSubscriptionPlansWithPrices={
              subscriptionPlansWithPricingSystems
            }
            onClose={closeSubscriptionDialog}
            recommendedPlanId={analyticsMetadata.recommendedPlanId}
            onOpenPendingDialog={(open: boolean) =>
              setSubscriptionPendingDialogOpen(open)
            }
          />
        ) : (
          <SubscriptionDialog
            availableSubscriptionPlansWithPrices={
              subscriptionPlansWithPricingSystems
            }
            userLegacySubscriptionPlanWithPricingSystem={
              userLegacySubscriptionPlanWithPricingSystem
            }
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
