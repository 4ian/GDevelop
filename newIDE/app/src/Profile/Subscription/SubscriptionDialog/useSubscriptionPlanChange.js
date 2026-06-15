// @flow
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import {
  getRedirectToCheckoutUrl,
  type SubscriptionPlanPricingSystem,
  changeUserSubscription,
} from '../../../Utils/GDevelopServices/Usage';
import {
  sendCancelSubscriptionToChange,
  sendChoosePlanClicked,
} from '../../../Utils/Analytics/EventSender';
import Window from '../../../Utils/Window';
import AuthenticatedUserContext from '../../AuthenticatedUserContext';
import useAlertDialog from '../../../UI/Alert/useAlertDialog';
import CancelReasonDialog from '../CancelReasonDialog';

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
const cancelAndChangeConfirmationTexts = {
  level: 'normal',
  dialogTexts: {
    title: t`Update your subscription`,
    message: t`To get this new subscription, we need to stop your existing one before you can pay for the new one. This is immediate but your payment will NOT be pro-rated (you will pay the full price for the new subscription). You won't lose any project, game or other data.`,
    confirmButtonLabel: t`Cancel and change my subscription`,
    dismissButtonLabel: t`Go back`,
    maxWidth: 'sm',
  },
};
const cancelAndChangeWithValidRedeemedCodeConfirmationTexts = {
  level: 'danger',
  dialogTexts: {
    title: t`Update your subscription`,
    message: t`To buy this new subscription, we need to stop your existing one before you can pay for the new one. This means the redemption code you're currently used won't be usable anymore.`,
    confirmButtonLabel: t`Forfeit my redeemed subscription and continue`,
    dismissButtonLabel: t`Go back`,
    maxWidth: 'sm',
  },
};

type Props = {|
  onClose: () => void,
  onOpenPendingDialog: (open: boolean) => void,
  couponCode: ?string,
  seatsCount?: number,
|};

type Output = {|
  /**
   * Buy, update or cancel the user's subscription. Pass `null` as the pricing
   * system to cancel the current subscription.
   */
  buyUpdateOrCancelPlan: (
    i18n: I18nType,
    subscriptionPlanPricingSystem: SubscriptionPlanPricingSystem | null
  ) => Promise<void>,
  isChangingSubscription: boolean,
  /**
   * The dialog asking the user why they cancel their subscription. Render it
   * inside the calling component.
   */
  cancelReasonDialog: React.Node,
|};

/**
 * A hook centralizing the logic to buy, update or cancel a subscription plan.
 * Shared between the different subscription dialogs so that the checkout flow
 * (opening the payment link, refreshing the subscription, etc.) stays
 * identical across all of them.
 */
export const useSubscriptionPlanChange = ({
  onClose,
  onOpenPendingDialog,
  couponCode,
  seatsCount,
}: Props): Output => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { getAuthorizationHeader, subscription, profile } = authenticatedUser;
  const {
    showAlert,
    showConfirmation,
    showDeleteConfirmation,
  } = useAlertDialog();
  const [isChangingSubscription, setIsChangingSubscription] = React.useState(
    false
  );
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
    });

    // Subscribing from an account without a subscription
    if (!subscription.planId && subscriptionPlanPricingSystem) {
      onOpenPendingDialog(true);
      const isEducationPlan =
        subscriptionPlanPricingSystem &&
        subscriptionPlanPricingSystem.planId === 'gdevelop_education';
      const quantity = isEducationPlan ? seatsCount : undefined;
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
      ? cancelAndChangeWithValidRedeemedCodeConfirmationTexts
      : cancelAndChangeConfirmationTexts;

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

    // Changing the existing subscription by cancelling first.
    setIsChangingSubscription(true);
    await sendCancelSubscriptionToChange({
      planId: subscriptionPlanPricingSystem.planId,
      pricingSystemId: subscriptionPlanPricingSystem.id,
    });
    try {
      await changeUserSubscription(
        getAuthorizationHeader,
        profile.id,
        {
          planId: null,
        },
        {
          cancelImmediately: true,
          cancelReasons: {
            'changing-subscription': true,
          },
        }
      );
      await authenticatedUser.onRefreshSubscription();
    } catch (rawError) {
      showAlert({
        title: t`Could not change subscription`,
        message: t`Something went wrong while changing your subscription. Please try again.`,
      });
      console.error('Error while changing subscription:', rawError);
      return;
    } finally {
      setIsChangingSubscription(false);
    }

    // Then redirect as if a new subscription is being chosen.
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

  const cancelReasonDialog = cancelReasonDialogOpen ? (
    <CancelReasonDialog
      onClose={() => {
        setCancelReasonDialogOpen(false);
      }}
      onCloseAfterSuccess={() => {
        setCancelReasonDialogOpen(false);
        onClose();
      }}
    />
  ) : null;

  return {
    buyUpdateOrCancelPlan,
    isChangingSubscription,
    cancelReasonDialog,
  };
};
