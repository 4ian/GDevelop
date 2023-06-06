// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import FlatButton from '../../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import AuthenticatedUserContext from '../AuthenticatedUserContext';
import { Column, Line } from '../../UI/Grid';
import {
  getSubscriptionPlans,
  changeUserSubscription,
  getRedirectToCheckoutUrl,
  canSeamlesslyChangeSubscription,
  businessPlan,
  hasValidSubscriptionPlan,
} from '../../Utils/GDevelopServices/Usage';
import EmptyMessage from '../../UI/EmptyMessage';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import {
  sendSubscriptionDialogShown,
  sendChoosePlanClicked,
  type SubscriptionDialogDisplayReason,
} from '../../Utils/Analytics/EventSender';
import SubscriptionPendingDialog from './SubscriptionPendingDialog';
import Window from '../../Utils/Window';
import Text from '../../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import RedemptionCodeIcon from '../../UI/CustomSvgIcons/RedemptionCode';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import RedeemCodeDialog from '../RedeemCodeDialog';
import PlanCard from './PlanCard';
import LeftLoader from '../../UI/LeftLoader';
import RaisedButton from '../../UI/RaisedButton';

const styles = {
  descriptionText: {
    marginLeft: 16,
    marginRight: 16,
  },
  bulletIcon: { width: 20, height: 20, marginRight: 10 },
  bulletText: { flex: 1 },
  diamondIcon: {
    width: 90,
    height: 90,
    flexShrink: 0,
    objectFit: 'contain',
  },
};

const cancelConfirmationTexts = {
  title: t`Cancel your subscription`,
  message: t`Are you sure you want to cancel your subscription?`,
  confirmButtonLabel: t`Cancel my subscription`,
  dismissButtonLabel: t`Go back`,
};
const seamlesslyChangeConfirmationTexts = {
  title: t`Update your subscription`,
  message: t`Are you sure you want to subscribe to this new plan? Your next payment will be pro-rated.`,
  confirmButtonLabel: t`Update my subscription`,
  dismissButtonLabel: t`Go back`,
};
const cancelAndChangeConfirmationTexts = {
  title: t`Update your subscription`,
  message: t`To get this new subscription, we need to cancel your existing one before you can pay for the new one. The change will be immediate but your payment will NOT be pro-rated (you will have to pay as for a new subscription).`,
  confirmButtonLabel: t`Cancel my subscription`,
  dismissButtonLabel: t`Go back`,
};
const cancelAndChangeWithValidRedeemedCodeConfirmationTexts = {
  title: t`Update your subscription`,
  message: t`To get this new subscription, we need to cancel your existing one before you can pay for the new one. The change will be immediate. You will also lose your redeemed code.`,
  confirmButtonLabel: t`Update my subscription`,
  dismissButtonLabel: t`Go back`,
};

type Props = {|
  open: boolean,
  onClose: Function,
  analyticsMetadata: {|
    reason: SubscriptionDialogDisplayReason,
    preStep?: 'subscriptionChecker',
  |},
|};

export default function SubscriptionDialog({
  open,
  onClose,
  analyticsMetadata,
}: Props) {
  const [isChangingSubscription, setIsChangingSubscription] = React.useState(
    false
  );
  const [
    subscriptionPendingDialogOpen,
    setSubscriptionPendingDialogOpen,
  ] = React.useState(false);
  const [redeemCodeDialogOpen, setRedeemCodeDialogOpen] = React.useState(false);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { showConfirmation, showAlert } = useAlertDialog();

  React.useEffect(
    () => {
      if (open) {
        sendSubscriptionDialogShown(analyticsMetadata);
      }
    },
    [open, analyticsMetadata]
  );

  const buyUpdateOrCancelPlan = async (
    i18n: I18nType,
    plan: { planId: null | string }
  ) => {
    const { getAuthorizationHeader, subscription, profile } = authenticatedUser;
    if (!profile || !subscription) return;
    sendChoosePlanClicked(plan.planId);

    // Subscribing from an account without a subscription
    if (!subscription.planId) {
      setSubscriptionPendingDialogOpen(true);
      Window.openExternalURL(
        getRedirectToCheckoutUrl(plan.planId || '', profile.id, profile.email)
      );
      return;
    }

    const { planId } = plan;
    if (!planId) {
      // Cancelling the existing subscription.
      const answer = await showConfirmation(cancelConfirmationTexts);
      if (!answer) return;

      setIsChangingSubscription(true);
      try {
        await changeUserSubscription(getAuthorizationHeader, profile.id, {
          planId: null,
        });
        await authenticatedUser.onSubscriptionUpdated();
        showAlert({
          title: t`Subscription cancelled`,
          message: t`Your subscription is now cancelled.`,
        });
      } catch (rawError) {
        await authenticatedUser.onSubscriptionUpdated();
        showErrorBox({
          message: i18n._(
            t`Your subscription could not be cancelled. Please try again later!`
          ),
          rawError,
          errorId: 'subscription-update-error',
        });
      } finally {
        setIsChangingSubscription(false);
      }
    } else {
      const needToCancelSubscription = !canSeamlesslyChangeSubscription(
        subscription
      );
      const hasValidRedeemedSubscription =
        !!subscription.redemptionCodeValidUntil &&
        subscription.redemptionCodeValidUntil > Date.now();
      const hasExpiredRedeemedSubscription =
        !!subscription.redemptionCodeValidUntil &&
        subscription.redemptionCodeValidUntil < Date.now();
      const shouldShowAlert =
        (needToCancelSubscription && !hasExpiredRedeemedSubscription) || // we don't show an alert if the redeemed code is expired
        hasValidRedeemedSubscription;

      // Changing the existing subscription.
      const confirmDialogTexts =
        !needToCancelSubscription || hasExpiredRedeemedSubscription
          ? seamlesslyChangeConfirmationTexts
          : hasValidRedeemedSubscription
          ? cancelAndChangeWithValidRedeemedCodeConfirmationTexts
          : cancelAndChangeConfirmationTexts;

      if (shouldShowAlert) {
        const answer = await showConfirmation(confirmDialogTexts);
        if (!answer) return;
      }

      if (!needToCancelSubscription) {
        // Changing the existing subscription without asking for payment details again.
        setIsChangingSubscription(true);
        try {
          await changeUserSubscription(getAuthorizationHeader, profile.id, {
            planId: plan.planId,
          });
          await authenticatedUser.onSubscriptionUpdated();
          showAlert({
            title: t`Subscription updated`,
            message: t`Congratulations, your new subscription is now active! You can now use the services unlocked with this plan.`,
          });
        } catch (rawError) {
          showErrorBox({
            message: i18n._(
              t`Your subscription could not be updated. Please try again later!`
            ),
            rawError,
            errorId: 'subscription-update-error',
          });
        } finally {
          setIsChangingSubscription(false);
        }
      } else {
        // Changing the existing subscription by cancelling first.
        setIsChangingSubscription(true);
        try {
          await changeUserSubscription(getAuthorizationHeader, profile.id, {
            planId: '',
          });
          await authenticatedUser.onSubscriptionUpdated();
        } catch (rawError) {
          showErrorBox({
            message: i18n._(
              t`Your subscription could not be cancelled. Please try again later!`
            ),
            rawError,
            errorId: 'subscription-update-error',
          });
        } finally {
          setIsChangingSubscription(false);
        }

        // Then redirect as if a new subscription is being chosen.
        setSubscriptionPendingDialogOpen(true);
        Window.openExternalURL(
          getRedirectToCheckoutUrl(planId, profile.id, profile.email)
        );
      }
    }
  };

  const isLoading =
    !authenticatedUser.subscription ||
    !authenticatedUser.profile ||
    isChangingSubscription;

  const isPlanValid = hasValidSubscriptionPlan(authenticatedUser.subscription);

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>GDevelop Premium</Trans>}
          actions={[
            <FlatButton
              label={<Trans>Close</Trans>}
              key="close"
              primary={false}
              onClick={onClose}
            />,
          ]}
          secondaryActions={[
            <FlatButton
              leftIcon={<RedemptionCodeIcon />}
              label={<Trans>Redeem a code</Trans>}
              key="redeem-code"
              disabled={!authenticatedUser.authenticated || isLoading}
              primary={false}
              onClick={() => setRedeemCodeDialogOpen(true)}
            />,
          ]}
          onRequestClose={onClose}
          open={open}
        >
          <ColumnStackLayout noMargin expand>
            <LineStackLayout noMargin alignItems="center">
              <img src="res/diamond.svg" style={styles.diamondIcon} alt="" />
              <Text>
                <Trans>
                  Get a subscription to unlock more one-click exports and other
                  exclusive features as a premium creator in our community. With
                  a subscription, you're also supporting the development of
                  GDevelop, which is an open-source software.
                </Trans>
              </Text>
              <FlatButton
                style={{ flexShrink: 0 }}
                label={<Trans>Read more</Trans>}
                onClick={() =>
                  Window.openExternalURL('https://gdevelop.io/pricing')
                }
              />
            </LineStackLayout>
            {getSubscriptionPlans().map(plan => {
              const userPlanId =
                authenticatedUser.subscription &&
                authenticatedUser.subscription.planId;
              const isFreePlan = !plan.planId;
              const isUserCurrentOrLegacyPlan =
                userPlanId === plan.planId ||
                (!!userPlanId && userPlanId === plan.legacyPlanId);
              // If no plan (free usage), do not display button.
              const button = isFreePlan ? null : isUserCurrentOrLegacyPlan &&
                isPlanValid ? (
                <React.Fragment key="cancel">
                  <LeftLoader isLoading={isLoading}>
                    <FlatButton
                      disabled={isLoading}
                      label={<Trans>Cancel your subscription</Trans>}
                      onClick={() =>
                        buyUpdateOrCancelPlan(i18n, { planId: null })
                      }
                    />
                  </LeftLoader>
                </React.Fragment>
              ) : (
                <React.Fragment key="upgrade">
                  <LeftLoader isLoading={isLoading}>
                    <RaisedButton
                      primary
                      disabled={isLoading}
                      label={<Trans>Choose this plan</Trans>}
                      onClick={() => buyUpdateOrCancelPlan(i18n, plan)}
                    />
                  </LeftLoader>
                </React.Fragment>
              );
              return (
                <PlanCard
                  key={plan.planId || 'free'}
                  plan={plan}
                  actions={[button]}
                  isPending={isLoading}
                  isHighlighted={isUserCurrentOrLegacyPlan} // highlight the plan even if it's expired.
                  background="medium"
                />
              );
            })}
            <PlanCard
              plan={businessPlan}
              actions={
                <RaisedButton
                  primary
                  label={<Trans>Learn more</Trans>}
                  onClick={() => {
                    Window.openExternalURL('https://gdevelop.io/pricing');
                  }}
                />
              }
              isPending={false}
              isHighlighted={false}
              background="dark"
            />
            <Column>
              <Line>
                <EmptyMessage>
                  <Trans>
                    Subscriptions can be stopped at any time. GDevelop uses
                    Stripe.com and PayPal for secure payment. No credit card
                    data is stored by GDevelop: everything is managed by
                    Stripe.com or PayPal secure infrastructure.
                  </Trans>
                </EmptyMessage>
              </Line>
            </Column>
            {!authenticatedUser.authenticated &&
              authenticatedUser.loginState !== 'loggingIn' && (
                <Dialog
                  open
                  title={<Trans>Create a GDevelop account to continue</Trans>}
                  maxWidth="sm"
                  cannotBeDismissed
                  secondaryActions={[
                    <FlatButton
                      key="later"
                      label={<Trans>Maybe later</Trans>}
                      onClick={onClose}
                    />,
                  ]}
                  actions={[
                    <FlatButton
                      key="login"
                      label={<Trans>Login</Trans>}
                      onClick={authenticatedUser.onLogin}
                    />,
                    <DialogPrimaryButton
                      key="create-account"
                      label={<Trans>Create my account</Trans>}
                      primary
                      onClick={authenticatedUser.onCreateAccount}
                    />,
                  ]}
                >
                  <Text>
                    <Trans>
                      It is free and you will get access to online services:
                      cloud projects, leaderboards, player feedbacks, cloud
                      builds...
                    </Trans>
                  </Text>
                </Dialog>
              )}
            {subscriptionPendingDialogOpen && (
              <SubscriptionPendingDialog
                authenticatedUser={authenticatedUser}
                onClose={() => {
                  setSubscriptionPendingDialogOpen(false);
                  authenticatedUser.onSubscriptionUpdated();
                }}
              />
            )}
            {redeemCodeDialogOpen && (
              <RedeemCodeDialog
                authenticatedUser={authenticatedUser}
                onClose={async hasJustRedeemedCode => {
                  setRedeemCodeDialogOpen(false);

                  if (hasJustRedeemedCode) {
                    try {
                      setIsChangingSubscription(true);
                      await authenticatedUser.onSubscriptionUpdated();
                    } finally {
                      setIsChangingSubscription(false);
                      setSubscriptionPendingDialogOpen(true);
                    }
                  }
                }}
              />
            )}
          </ColumnStackLayout>
        </Dialog>
      )}
    </I18n>
  );
}
