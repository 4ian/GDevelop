// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
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
import SubscriptionDialog from './SubscriptionDialog';
import SubscriptionPendingDialog from './SubscriptionPendingDialog';
import LoaderModal from '../../UI/LoaderModal';
import { useAsyncLazyMemo } from '../../Utils/UseLazyMemo';
import RedeemCodeDialog from '../RedeemCodeDialog';

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
   * Returns subscription plan of the user, even if it's a legacy plan, or null if not found or no subscription.
   */
  getUserSubscriptionPlanEvenIfLegacy: () => SubscriptionPlanWithPricingSystems | null,
  /**
   * Call this when a subscription or subscription upgrade is required.
   */
  openSubscriptionDialog: ({|
    analyticsMetadata: SubscriptionAnalyticsMetadata,
    couponCode?: string,
  |}) => void,
  /**
   * Returns the current coupon code being used, or null.
   */
  getCouponCode: () => ?string,
  /**
   * Clears the current coupon code.
   */
  clearCouponCode: () => void,
  openRedeemCodeDialog: (options?: {|
    codeToPrefill?: string,
    autoSubmit?: boolean,
  |}) => void,
|};

export const SubscriptionContext = React.createContext<SubscriptionState>({
  getSubscriptionPlansWithPricingSystems: () => null,
  getUserSubscriptionPlanEvenIfLegacy: () => null,
  openSubscriptionDialog: () => {},
  getCouponCode: () => null,
  clearCouponCode: () => {},
  openRedeemCodeDialog: () => {},
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
  const [couponCode, setCouponCode] = React.useState<?string>(null);
  const recommendedPlanId = analyticsMetadata
    ? analyticsMetadata.recommendedPlanId
    : null;
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { showAlert } = useAlertDialog();
  const [
    subscriptionPendingDialogOpen,
    setSubscriptionPendingDialogOpen,
  ] = React.useState(false);
  const [
    subscriptionPendingDialogImmediateSuccess,
    setSubscriptionPendingDialogImmediateSuccess,
  ] = React.useState(false);
  const [redeemCodeDialogOpen, setRedeemCodeDialogOpen] = React.useState(false);
  const [codeToPrefill, setCodeToPrefill] = React.useState<?string>(null);
  const [autoSubmit, setAutoSubmit] = React.useState(false);
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
    (open: boolean) => setSubscriptionPendingDialogOpen(open),
    []
  );

  const closeSubscriptionDialog = () => {
    setAnalyticsMetadata(null);
    setCouponCode(null);
  };

  const openSubscriptionDialog = React.useCallback(
    ({ analyticsMetadata: metadata, couponCode: coupon }) => {
      if (isNativeMobileApp() || simulateMobileApp) {
        if (hasValidSubscriptionPlan(authenticatedUser.subscription)) {
          if (
            !hasMobileAppStoreSubscriptionPlan(authenticatedUser.subscription)
          ) {
            showAlert({
              title: t`Subscription outside the app store`,
              message: t`The subscription of this account comes from outside the app store. Connect with your account on editor.gdevelop.io from your web-browser to manage it.`,
            });
            return;
          }
        }

        // Would present App Store screen.
      } else {
        setAnalyticsMetadata(metadata);
        setCouponCode(coupon || null);
      }
    },
    [authenticatedUser.subscription, showAlert, simulateMobileApp]
  );

  const getUserSubscriptionPlanEvenIfLegacy = React.useCallback(
    () => {
      const subscriptionPlansWithPricingSystemsIncludingLegacy = getSubscriptionPlansWithPricingSystemsIncludingLegacy();
      if (
        !subscriptionPlansWithPricingSystemsIncludingLegacy ||
        !authenticatedUser.subscription
      )
        return null;

      const userSubscriptionPlanId = authenticatedUser.subscription.planId;
      const userSubscriptionPlan = subscriptionPlansWithPricingSystemsIncludingLegacy.find(
        plan => plan.id === userSubscriptionPlanId
      );
      return userSubscriptionPlan || null;
    },
    [
      authenticatedUser.subscription,
      getSubscriptionPlansWithPricingSystemsIncludingLegacy,
    ]
  );

  const getCouponCode = React.useCallback(() => couponCode, [couponCode]);

  const clearCouponCode = React.useCallback(() => setCouponCode(null), []);

  const openRedeemCodeDialog = React.useCallback(
    (options?: {| codeToPrefill?: string, autoSubmit?: boolean |}) => {
      setRedeemCodeDialogOpen(true);
      setCodeToPrefill((options && options.codeToPrefill) || null);
      setAutoSubmit((options && options.autoSubmit) || false);
    },
    []
  );

  const closeRedeemCodeDialog = React.useCallback(
    async (hasJustRedeemedCode: boolean) => {
      setRedeemCodeDialogOpen(false);
      setCodeToPrefill(null);
      setAutoSubmit(false);
      if (hasJustRedeemedCode) {
        await authenticatedUser.onRefreshSubscription();
        // Show the success message after the subscription has been refreshed.
        setSubscriptionPendingDialogImmediateSuccess(true);
        setSubscriptionPendingDialogOpen(true);
      }
    },
    [authenticatedUser]
  );

  const value = React.useMemo(
    () => ({
      getSubscriptionPlansWithPricingSystems,
      getUserSubscriptionPlanEvenIfLegacy,
      openSubscriptionDialog,
      getCouponCode,
      clearCouponCode,
      openRedeemCodeDialog,
    }),
    [
      getSubscriptionPlansWithPricingSystems,
      getUserSubscriptionPlanEvenIfLegacy,
      openSubscriptionDialog,
      getCouponCode,
      clearCouponCode,
      openRedeemCodeDialog,
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
          immediatelyShowSuccessMessage={
            subscriptionPendingDialogImmediateSuccess
          }
          onClose={() => {
            setSubscriptionPendingDialogOpen(false);
            setSubscriptionPendingDialogImmediateSuccess(false);
            authenticatedUser.onRefreshSubscription();
          }}
          onSuccess={closeSubscriptionDialog}
        />
      )}
      {analyticsMetadata ? (
        authenticatedUser.loginState === 'loggingIn' ? (
          <LoaderModal showImmediately />
        ) : (
          <SubscriptionDialog
            availableSubscriptionPlansWithPrices={getSubscriptionPlansWithPricingSystems()}
            userSubscriptionPlanEvenIfLegacy={getUserSubscriptionPlanEvenIfLegacy()}
            onClose={closeSubscriptionDialog}
            recommendedPlanId={recommendedPlanId}
            onOpenPendingDialog={openSubscriptionPendingDialog}
            couponCode={couponCode}
          />
        )
      ) : null}
      {redeemCodeDialogOpen && (
        <RedeemCodeDialog
          codeToPrefill={codeToPrefill || undefined}
          autoSubmit={autoSubmit}
          onClose={closeRedeemCodeDialog}
        />
      )}
    </SubscriptionContext.Provider>
  );
};
