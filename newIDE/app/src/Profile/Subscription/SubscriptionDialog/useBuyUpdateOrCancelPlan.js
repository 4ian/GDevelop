// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import AuthenticatedUserContext from '../../AuthenticatedUserContext';
import {
  getRedirectToCheckoutUrl,
  type SubscriptionPlanPricingSystem,
} from '../../../Utils/GDevelopServices/Usage';
import {
  sendCancelSubscriptionToChange,
  sendChoosePlanClicked,
} from '../../../Utils/Analytics/EventSender';
import Window from '../../../Utils/Window';
import useAlertDialog from '../../../UI/Alert/useAlertDialog';

const cancelConfirmationTexts = {
  level: 'normal',
  dialogTexts: {
    title: t`Cancel your subscription?`,
    message: t`By canceling your subscription, you will lose all your premium features at the end of the period you already paid for. Continue?`,
    confirmButtonLabel: t`Continue`,
    dismissButtonLabel: t`Keep subscription`,
    maxWidth: 'sm',
  },
};
// When changing subscription, the existing one is kept until the payment for the
// new one is completed: it's then replaced by the new one (and cancelled at the payment
// provider by the backend). Nothing is cancelled if the user does not complete the payment.
const changeConfirmationTexts = {
  level: 'normal',
  dialogTexts: {
    title: t`Update your subscription`,
    message: t`Your current subscription will be replaced by the new one as soon as the payment is completed. The remaining time of your current subscription will NOT be refunded or pro-rated (you will pay the full price for the new subscription). You won't lose any project, game or other data.`,
    confirmButtonLabel: t`Continue to payment`,
    dismissButtonLabel: t`Go back`,
    maxWidth: 'sm',
  },
};
const changeWithValidRedeemedCodeConfirmationTexts = {
  level: 'danger',
  dialogTexts: {
    title: t`Update your subscription`,
    message: t`Your current subscription comes from a redemption code. As soon as the payment for the new subscription is completed, it will replace it and the redemption code won't be usable anymore.`,
    confirmButtonLabel: t`Continue and forfeit my redeemed subscription`,
    dismissButtonLabel: t`Go back`,
    maxWidth: 'sm',
  },
};

type Props = {|
  onOpenPendingDialog: (open: boolean) => void,
  couponCode?: ?string,
  // The number of seats to use when subscribing to the education plan. Defaults
  // to 1 when not provided (the simplified dialog does not support the education plan).
  getEducationPlanSeatsCount?: () => number,
  // The variant of the dialog from which the action is triggered, for analytics.
  dialogVariant?: string,
|};

type BuyUpdateOrCancelPlanState = {|
  buyUpdateOrCancelPlan: (
    i18n: I18nType,
    subscriptionPlanPricingSystem: SubscriptionPlanPricingSystem | null
  ) => Promise<void>,
  cancelReasonDialogOpen: boolean,
  setCancelReasonDialogOpen: (open: boolean) => void,
|};

/**
 * Shared logic to buy, update or cancel a subscription plan from a subscription
 * dialog. This ensures the standard and simplified subscription dialogs behave
 * exactly the same when interacting with the checkout/payment flow.
 */
export const useBuyUpdateOrCancelPlan = ({
  onOpenPendingDialog,
  couponCode,
  getEducationPlanSeatsCount,
  dialogVariant,
}: Props): BuyUpdateOrCancelPlanState => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { subscription, profile } = authenticatedUser;
  const { showConfirmation, showDeleteConfirmation } = useAlertDialog();
  const [cancelReasonDialogOpen, setCancelReasonDialogOpen] = React.useState(
    false
  );

  const buyUpdateOrCancelPlan = async (
    i18n: I18nType,
    subscriptionPlanPricingSystem: SubscriptionPlanPricingSystem | null
  ) => {
    if (!profile || !subscription) return;
    sendChoosePlanClicked({
      planId: subscriptionPlanPricingSystem
        ? subscriptionPlanPricingSystem.planId
        : null,
      pricingSystemId: subscriptionPlanPricingSystem
        ? subscriptionPlanPricingSystem.id
        : null,
      dialogVariant,
    });

    // Subscribing from an account without a subscription
    if (!subscription.planId && subscriptionPlanPricingSystem) {
      onOpenPendingDialog(true);
      const isEducationPlan =
        subscriptionPlanPricingSystem &&
        subscriptionPlanPricingSystem.planId === 'gdevelop_education';
      const quantity =
        isEducationPlan && getEducationPlanSeatsCount
          ? getEducationPlanSeatsCount()
          : undefined;
      Window.openExternalURL(
        getRedirectToCheckoutUrl({
          pricingSystemId: subscriptionPlanPricingSystem.id,
          userId: profile.id,
          userEmail: profile.email,
          quantity,
          couponCode: couponCode || undefined,
        })
      );
      return;
    }

    if (!subscriptionPlanPricingSystem) {
      // Cancelling the existing subscription.
      const answer = await showConfirmation(
        // $FlowFixMe[incompatible-type]
        cancelConfirmationTexts.dialogTexts
      );
      if (!answer) return;

      setCancelReasonDialogOpen(true);
      return;
    }

    const hasValidRedeemedSubscription =
      !!subscription.redemptionCodeValidUntil &&
      subscription.redemptionCodeValidUntil > Date.now();
    const hasExpiredRedeemedSubscription =
      !!subscription.redemptionCodeValidUntil &&
      subscription.redemptionCodeValidUntil < Date.now();

    // Changing the existing subscription.
    const confirmDialogTexts = hasExpiredRedeemedSubscription
      ? null // We don't show an alert if the redeemed code is expired.
      : hasValidRedeemedSubscription
      ? changeWithValidRedeemedCodeConfirmationTexts
      : changeConfirmationTexts;

    if (confirmDialogTexts) {
      const { level, dialogTexts } = confirmDialogTexts;

      const answer =
        level === 'danger'
          ? await showDeleteConfirmation({
              title: dialogTexts.title,
              message: dialogTexts.message,
              confirmButtonLabel: dialogTexts.confirmButtonLabel,
              dismissButtonLabel: dialogTexts.dismissButtonLabel,
            })
          : // $FlowFixMe[incompatible-type]
            await showConfirmation(dialogTexts);
      if (!answer) return;
    }

    // Changing the existing subscription: the existing subscription is NOT cancelled
    // here. It's kept until the new one is paid - the backend then replaces it with the
    // new one and cancels it at the payment provider (see the Stripe/PayPal webhooks).
    // If the user does not complete the payment, nothing changes.
    await sendCancelSubscriptionToChange({
      planId: subscriptionPlanPricingSystem.planId,
      pricingSystemId: subscriptionPlanPricingSystem.id,
    });

    // Redirect as if a new subscription is being chosen.
    onOpenPendingDialog(true);
    Window.openExternalURL(
      getRedirectToCheckoutUrl({
        pricingSystemId: subscriptionPlanPricingSystem.id,
        userId: profile.id,
        userEmail: profile.email,
        couponCode: couponCode || undefined,
      })
    );
  };

  return {
    buyUpdateOrCancelPlan,
    cancelReasonDialogOpen,
    setCancelReasonDialogOpen,
  };
};
