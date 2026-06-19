// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import {
  sendSubscriptionDialogShown,
  type SubscriptionDialogDisplayReason,
  type SubscriptionPlacementId,
  type SubscriptionDialogVariant,
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
  type SubscriptionDialogDisplayConfig,
  type SubscriptionDialogVariantConfig,
} from '../../Utils/GDevelopServices/Usage';
import AuthenticatedUserContext from '../AuthenticatedUserContext';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import SubscriptionDialog from './SubscriptionDialog';
import SimplifiedSubscriptionDialog from './SubscriptionDialog/SimplifiedSubscriptionDialog';
import { planIdSortingFunction } from './PlanSmallCard';
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
  // Which version of the subscription dialog was shown. Computed when the dialog
  // is opened (see `resolveSubscriptionDialogDisplay`) and sent with analytics
  // events.
  dialogVariant?: SubscriptionDialogVariant,
  // Plan featured by the simplified dialog, when shown.
  featuredPlanId?: string,
|};

export type SubscriptionDialogDisplay = {|
  dialogVariant: SubscriptionDialogVariant,
  featuredPlanId?: string,
|};

const standardDialogDisplay: SubscriptionDialogDisplay = {
  dialogVariant: 'standard',
};

/**
 * Picks a variant among the given ones, proportionally to their weights.
 */
const pickWeightedVariant = (
  variants: Array<SubscriptionDialogVariantConfig>
): ?SubscriptionDialogVariantConfig => {
  const positiveWeightVariants = variants.filter(variant => variant.weight > 0);
  if (positiveWeightVariants.length === 0) return variants[0] || null;

  const totalWeight = positiveWeightVariants.reduce(
    (sum, variant) => sum + variant.weight,
    0
  );
  let remaining = Math.random() * totalWeight;
  for (const variant of positiveWeightVariants) {
    remaining -= variant.weight;
    if (remaining < 0) return variant;
  }
  return positiveWeightVariants[positiveWeightVariants.length - 1];
};

/**
 * Decides, from the backend-provided A/B test configuration, which subscription
 * dialog variant (and featured plan) to show for a given placement.
 *
 * Degrades gracefully: unconfigured placements, unknown variant types or a
 * missing config all fall back to the standard dialog. The simplified dialog is
 * also skipped when the user already has the featured plan (or a higher one),
 * as it would not make sense to upsell it.
 */
export const resolveSubscriptionDialogDisplay = ({
  placementId,
  displayConfig,
  userSubscriptionPlanId,
  pickVariant = pickWeightedVariant,
}: {|
  placementId: SubscriptionPlacementId,
  displayConfig: ?SubscriptionDialogDisplayConfig,
  userSubscriptionPlanId: ?string,
  pickVariant?: (
    variants: Array<SubscriptionDialogVariantConfig>
  ) => ?SubscriptionDialogVariantConfig,
|}): SubscriptionDialogDisplay => {
  if (!displayConfig || !displayConfig.placements) return standardDialogDisplay;

  const placementConfig = displayConfig.placements[placementId];
  if (
    !placementConfig ||
    !placementConfig.variants ||
    placementConfig.variants.length === 0
  ) {
    return standardDialogDisplay;
  }

  const variant = pickVariant(placementConfig.variants);
  if (!variant) return standardDialogDisplay;

  if (variant.type === 'simplified') {
    const { featuredPlanId } = variant;
    // Don't show the simplified (upsell) dialog if we don't know which plan to
    // feature, or if the user already has that plan or a higher one.
    if (!featuredPlanId) return standardDialogDisplay;
    if (
      userSubscriptionPlanId &&
      planIdSortingFunction(userSubscriptionPlanId, featuredPlanId) >= 0
    ) {
      return standardDialogDisplay;
    }
    return { dialogVariant: 'simplified', featuredPlanId };
  }

  // 'standard' or any unknown/future variant type: degrade gracefully.
  return standardDialogDisplay;
};

const mergeSubscriptionPlansWithPrices = (
  subscriptionPlans: SubscriptionPlan[],
  subscriptionPlanPricingSystems: SubscriptionPlanPricingSystem[]
): SubscriptionPlanWithPricingSystems[] => {
  return subscriptionPlans
    .map(subscriptionPlan => {
      if (subscriptionPlan.id === 'free') {
        return {
          ...subscriptionPlan,
          // $FlowFixMe[missing-empty-array-annot]
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

export const SubscriptionContext: React.Context<SubscriptionState> = React.createContext<SubscriptionState>(
  {
    getSubscriptionPlansWithPricingSystems: () => null,
    getUserSubscriptionPlanEvenIfLegacy: () => null,
    openSubscriptionDialog: () => {},
    getCouponCode: () => null,
    clearCouponCode: () => {},
    openRedeemCodeDialog: () => {},
  }
);

type SubscriptionProviderProps = {|
  children: React.Node,
  simulateMobileApp?: true,
|};

export const SubscriptionProvider = ({
  children,
  simulateMobileApp,
}: SubscriptionProviderProps): React.MixedElement => {
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
    // $FlowFixMe[missing-local-annot]
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
        const userSubscriptionPlanId = authenticatedUser.subscription
          ? authenticatedUser.subscription.planId
          : null;
        // The A/B test config is served with the user limits (fetched once at
        // startup for authenticated users). Absent for anonymous users or older
        // backends, in which case we fall back to the standard dialog.
        const displayConfig = authenticatedUser.limits
          ? authenticatedUser.limits.subscriptionDialogDisplayConfig
          : null;
        // A caller can force a variant (and featured plan); otherwise resolve
        // it from the backend A/B test configuration.
        const { dialogVariant, featuredPlanId } = metadata.dialogVariant
          ? {
              dialogVariant: metadata.dialogVariant,
              featuredPlanId: metadata.featuredPlanId,
            }
          : resolveSubscriptionDialogDisplay({
              placementId: metadata.placementId,
              displayConfig,
              userSubscriptionPlanId,
            });
        setAnalyticsMetadata({ ...metadata, dialogVariant, featuredPlanId });
        setCouponCode(coupon || null);
      }
    },
    [
      authenticatedUser.subscription,
      authenticatedUser.limits,
      showAlert,
      simulateMobileApp,
    ]
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
        ) : analyticsMetadata.dialogVariant === 'simplified' ? (
          <SimplifiedSubscriptionDialog
            availableSubscriptionPlansWithPrices={getSubscriptionPlansWithPricingSystems()}
            featuredPlanId={analyticsMetadata.featuredPlanId}
            onClose={closeSubscriptionDialog}
            onOpenPendingDialog={openSubscriptionPendingDialog}
            couponCode={couponCode}
          />
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
