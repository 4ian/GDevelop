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
  changeUserSubscription,
  getRedirectToCheckoutUrlV2,
  canSeamlesslyChangeSubscription,
  canCancelAtEndOfPeriod,
  hasValidSubscriptionPlan,
  EDUCATION_PLAN_MAX_SEATS,
  EDUCATION_PLAN_MIN_SEATS,
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
} from '../../Utils/GDevelopServices/Usage';
import EmptyMessage from '../../UI/EmptyMessage';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import {
  sendSubscriptionDialogShown,
  sendChoosePlanClicked,
} from '../../Utils/Analytics/EventSender';
import {
  type SubscriptionAnalyticsMetadata,
  type SubscriptionType,
} from './SubscriptionSuggestionContext';
import SubscriptionPendingDialog from './SubscriptionPendingDialog';
import Window from '../../Utils/Window';
import Text from '../../UI/Text';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../UI/Layout';
import RedemptionCodeIcon from '../../UI/CustomSvgIcons/RedemptionCode';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import RedeemCodeDialog from '../RedeemCodeDialog';
import PlanCard from './PlanCard';
import LeftLoader from '../../UI/LeftLoader';
import RaisedButton from '../../UI/RaisedButton';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import AlertMessage from '../../UI/AlertMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';

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
const cancelImmediatelyConfirmationTexts = {
  title: t`Cancel your subscription`,
  message: t`Are you sure you want to cancel your subscription? Your access to GDevelop premium features will end IMMEDIATELY.`,
  confirmButtonLabel: t`Cancel my subscription now`,
  dismissButtonLabel: t`Go back`,
};
const seamlesslyChangeConfirmationTexts = {
  title: t`Update your subscription`,
  message: t`Are you sure you want to change your plan? Your next payment will be pro-rated.`,
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
  analyticsMetadata: SubscriptionAnalyticsMetadata,
  subscriptionPlansWithPricingSystems: ?(SubscriptionPlanWithPricingSystems[]),
  filter: ?SubscriptionType,
|};

export default function SubscriptionDialog({
  open,
  onClose,
  analyticsMetadata,
  subscriptionPlansWithPricingSystems,
  filter,
}: Props) {
  const [isChangingSubscription, setIsChangingSubscription] = React.useState(
    false
  );
  const [
    educationPlanPeriodicity,
    setEducationPlanPeriodicity,
  ] = React.useState<'yearly' | 'monthly'>('yearly');
  const [
    educationPlanSeatsCount,
    setEducationPlanSeatsCount,
  ] = React.useState<number>(20);
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
    subscriptionPlanPrice: SubscriptionPlanPricingSystem | null
  ) => {
    const { getAuthorizationHeader, subscription, profile } = authenticatedUser;
    if (!profile || !subscription) return;
    if (subscriptionPlanPrice) {
      sendChoosePlanClicked(subscriptionPlanPrice.planId);
    }
    // Subscribing from an account without a subscription
    if (!subscription.planId && subscriptionPlanPrice) {
      setSubscriptionPendingDialogOpen(true);
      const isEducationPlan =
        subscriptionPlanPrice &&
        subscriptionPlanPrice.planId === 'gdevelop_education';
      const quantity = isEducationPlan ? educationPlanSeatsCount : undefined;
      Window.openExternalURL(
        getRedirectToCheckoutUrlV2({
          pricingSystemId: subscriptionPlanPrice.id,
          userId: profile.id,
          userEmail: profile.email,
          quantity,
        })
      );
      return;
    }

    if (!subscriptionPlanPrice) {
      // Cancelling the existing subscription.
      const answer = await showConfirmation(
        canCancelAtEndOfPeriod(subscription)
          ? cancelConfirmationTexts
          : cancelImmediatelyConfirmationTexts
      );
      if (!answer) return;

      setIsChangingSubscription(true);
      try {
        await changeUserSubscription(getAuthorizationHeader, profile.id, {
          planId: null,
        });
        await authenticatedUser.onRefreshSubscription();
        showAlert({
          title: t`Subscription cancelled`,
          message: t`Your subscription is now cancelled.`,
        });
      } catch (rawError) {
        await authenticatedUser.onRefreshSubscription();
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
      return;
    }

    const { planId } = subscriptionPlanPrice;
    const needToCancelSubscription = !canSeamlesslyChangeSubscription(
      subscription,
      planId
    );
    const hasValidRedeemedSubscription =
      !!subscription.redemptionCodeValidUntil &&
      subscription.redemptionCodeValidUntil > Date.now();
    const hasExpiredRedeemedSubscription =
      !!subscription.redemptionCodeValidUntil &&
      subscription.redemptionCodeValidUntil < Date.now();
    const shouldSkipAlert = hasExpiredRedeemedSubscription; // we don't show an alert if the redeemed code is expired

    // Changing the existing subscription.
    const confirmDialogTexts =
      !needToCancelSubscription || hasExpiredRedeemedSubscription
        ? seamlesslyChangeConfirmationTexts
        : hasValidRedeemedSubscription
        ? cancelAndChangeWithValidRedeemedCodeConfirmationTexts
        : cancelAndChangeConfirmationTexts;

    if (!shouldSkipAlert) {
      const answer = await showConfirmation(confirmDialogTexts);
      if (!answer) return;
    }

    if (!needToCancelSubscription) {
      // Changing the existing subscription without asking for payment details again.
      setIsChangingSubscription(true);
      try {
        await changeUserSubscription(getAuthorizationHeader, profile.id, {
          planId,
        });
        await authenticatedUser.onRefreshSubscription();
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
          planId: null,
        });
        await authenticatedUser.onRefreshSubscription();
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
        getRedirectToCheckoutUrlV2({
          pricingSystemId: subscriptionPlanPrice.id,
          userId: profile.id,
          userEmail: profile.email,
        })
      );
    }
  };

  const isLoading =
    !authenticatedUser.subscription ||
    !authenticatedUser.profile ||
    isChangingSubscription;

  const isPlanValid = hasValidSubscriptionPlan(authenticatedUser.subscription);

  const willCancelAtPeriodEnd =
    !!authenticatedUser.subscription &&
    !!authenticatedUser.subscription.cancelAtPeriodEnd;
  const userPlanId = authenticatedUser.subscription
    ? authenticatedUser.subscription.planId
    : null;

  return (
    <I18n>
      {({ i18n }) => (
        <>
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
            {subscriptionPlansWithPricingSystems ? (
              <ColumnStackLayout noMargin expand>
                <LineStackLayout noMargin alignItems="center">
                  <img
                    src="res/diamond.svg"
                    style={styles.diamondIcon}
                    alt=""
                  />
                  <Text>
                    <Trans>
                      Get a subscription to unlock more one-click exports and
                      other exclusive features as a premium creator in our
                      community. With a subscription, you're also supporting the
                      development of GDevelop, which is an open-source software.
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
                {willCancelAtPeriodEnd && (
                  <AlertMessage kind="warning">
                    <Trans>
                      Your subscription is being cancelled: you will lose the
                      benefits at the end of the period you already paid for.
                    </Trans>
                  </AlertMessage>
                )}
                {subscriptionPlansWithPricingSystems
                  .filter(plan => {
                    if (filter === 'individual') {
                      return [
                        'free',
                        'gdevelop_silver',
                        'gdevelop_gold',
                      ].includes(plan.id);
                    }
                    if (filter === 'team') {
                      return [
                        'free',
                        'gdevelop_startup',
                        'gdevelop_enterprise',
                      ].includes(plan.id);
                    }
                    if (filter === 'education') {
                      return ['free', 'gdevelop_education'].includes(plan.id);
                    }
                    // No filter, show all plans.
                    return true;
                  })
                  .map(subscriptionPlanWithPricingSystems => {
                    const isFreePlan =
                      subscriptionPlanWithPricingSystems.id === 'free';
                    const isUserCurrentOrLegacyPlan =
                      userPlanId === subscriptionPlanWithPricingSystems.id;
                    let actions: React.Node = null;
                    if (isFreePlan) {
                      // If no plan (free usage), do not display button.
                    } else if (
                      subscriptionPlanWithPricingSystems.id ===
                      'gdevelop_education'
                    ) {
                      if (!isUserCurrentOrLegacyPlan) {
                        const yearlyPlanPrice = subscriptionPlanWithPricingSystems.pricingSystems.find(
                          price => price.period === 'year'
                        );
                        const monthlyPlanPrice = subscriptionPlanWithPricingSystems.pricingSystems.find(
                          price => price.period === 'month'
                        );
                        if (yearlyPlanPrice && monthlyPlanPrice) {
                          actions = [
                            <ResponsiveLineStackLayout
                              key="options"
                              expand
                              noColumnMargin
                              noMargin
                            >
                              <SemiControlledTextField
                                value={educationPlanSeatsCount.toString()}
                                floatingLabelFixed
                                fullWidth
                                floatingLabelText={
                                  <Trans>Number of seats</Trans>
                                }
                                commitOnBlur
                                type="number"
                                onChange={value => {
                                  const newValue = parseInt(value);
                                  setEducationPlanSeatsCount(
                                    Math.min(
                                      EDUCATION_PLAN_MAX_SEATS,
                                      Math.max(
                                        Number.isNaN(newValue)
                                          ? EDUCATION_PLAN_MIN_SEATS
                                          : newValue,
                                        EDUCATION_PLAN_MIN_SEATS
                                      )
                                    )
                                  );
                                }}
                                min={EDUCATION_PLAN_MIN_SEATS}
                                max={EDUCATION_PLAN_MAX_SEATS}
                                step={1}
                                helperMarkdownText={i18n._(
                                  t`As a teacher, you will use one seat in the plan so make sure to include yourself!`
                                )}
                              />
                              <SelectField
                                value={educationPlanPeriodicity}
                                floatingLabelText={<Trans>Engagement</Trans>}
                                fullWidth
                                onChange={(e, i, newValue) => {
                                  // $FlowExpectedError - Flow does not infer the type given the select options.
                                  setEducationPlanPeriodicity(newValue);
                                }}
                              >
                                <SelectOption
                                  value="yearly"
                                  label={t`Per year`}
                                />
                                <SelectOption
                                  value="monthly"
                                  label={t`Per month`}
                                />
                              </SelectField>
                            </ResponsiveLineStackLayout>,
                            <RaisedButton
                              primary
                              key="upgrade"
                              disabled={isLoading}
                              label={
                                <LeftLoader isLoading={isLoading}>
                                  <Trans>Choose this plan</Trans>
                                </LeftLoader>
                              }
                              onClick={() =>
                                buyUpdateOrCancelPlan(
                                  i18n,
                                  educationPlanPeriodicity === 'yearly'
                                    ? yearlyPlanPrice
                                    : monthlyPlanPrice
                                )
                              }
                            />,
                          ];
                        }
                      } else {
                        actions = [
                          <Text key="contact">
                            <Trans>Contact us for more information.</Trans>
                          </Text>,
                        ];
                      }
                    } else if (isUserCurrentOrLegacyPlan && isPlanValid) {
                      actions = [
                        <FlatButton
                          key="cancel"
                          disabled={isLoading || willCancelAtPeriodEnd}
                          label={
                            <LeftLoader isLoading={isLoading}>
                              {willCancelAtPeriodEnd ? (
                                <Trans>
                                  Already cancelled - will expire in the future
                                </Trans>
                              ) : (
                                <Trans>Cancel your subscription</Trans>
                              )}
                            </LeftLoader>
                          }
                          onClick={() => buyUpdateOrCancelPlan(i18n, null)}
                        />,
                      ];
                    } else if (
                      subscriptionPlanWithPricingSystems.id ===
                      'gdevelop_enterprise'
                    ) {
                      return (
                        <PlanCard
                          key={subscriptionPlanWithPricingSystems.id}
                          subscriptionPlanWithPricingSystems={
                            subscriptionPlanWithPricingSystems
                          }
                          actions={
                            <RaisedButton
                              primary
                              label={<Trans>Learn more</Trans>}
                              onClick={() => {
                                Window.openExternalURL(
                                  'https://gdevelop.io/pricing'
                                );
                              }}
                            />
                          }
                          isPending={false}
                          isHighlighted={false}
                          background="medium"
                        />
                      );
                    } else {
                      const price =
                        subscriptionPlanWithPricingSystems.pricingSystems[0];
                      if (price) {
                        actions = [
                          <RaisedButton
                            primary
                            key="upgrade"
                            disabled={isLoading}
                            label={
                              <LeftLoader isLoading={isLoading}>
                                <Trans>Choose this plan</Trans>
                              </LeftLoader>
                            }
                            onClick={() => buyUpdateOrCancelPlan(i18n, price)}
                          />,
                        ];
                      }
                    }

                    return (
                      <PlanCard
                        key={subscriptionPlanWithPricingSystems.id || 'free'}
                        subscriptionPlanWithPricingSystems={
                          subscriptionPlanWithPricingSystems
                        }
                        actions={actions}
                        isPending={isLoading}
                        isHighlighted={isUserCurrentOrLegacyPlan} // highlight the plan even if it's expired.
                        background="medium"
                      />
                    );
                  })}

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
              </ColumnStackLayout>
            ) : (
              <PlaceholderLoader />
            )}
          </Dialog>
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
                    onClick={authenticatedUser.onOpenLoginDialog}
                  />,
                  <DialogPrimaryButton
                    key="create-account"
                    label={<Trans>Create my account</Trans>}
                    primary
                    onClick={authenticatedUser.onOpenCreateAccountDialog}
                  />,
                ]}
              >
                <Text>
                  <Trans>
                    It is free and you will get access to online services: cloud
                    projects, leaderboards, player feedbacks, cloud builds...
                  </Trans>
                </Text>
              </Dialog>
            )}
          {subscriptionPendingDialogOpen && (
            <SubscriptionPendingDialog
              authenticatedUser={authenticatedUser}
              onClose={() => {
                setSubscriptionPendingDialogOpen(false);
                authenticatedUser.onRefreshSubscription();
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
                    await authenticatedUser.onRefreshSubscription();
                  } finally {
                    setIsChangingSubscription(false);
                    setSubscriptionPendingDialogOpen(true);
                  }
                }
              }}
            />
          )}
        </>
      )}
    </I18n>
  );
}
