// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import FlatButton from '../../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import AuthenticatedUserContext from '../AuthenticatedUserContext';
import {
  changeUserSubscription,
  getRedirectToCheckoutUrl,
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
  sendCancelSubscriptionToChange,
} from '../../Utils/Analytics/EventSender';
import {
  type SubscriptionAnalyticsMetadata,
  type SubscriptionType,
} from './SubscriptionSuggestionContext';
import SubscriptionPendingDialog from './SubscriptionPendingDialog';
import Window from '../../Utils/Window';
import Text from '../../UI/Text';
import { ColumnStackLayout } from '../../UI/Layout';
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
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import Link from '../../UI/Link';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';
import uniq from 'lodash/uniq';
import CancelReasonDialog from './CancelReasonDialog';
import { Line } from '../../UI/Grid';
import TwoStatesButton from '../../UI/TwoStatesButton';
import HotMessage from '../../UI/HotMessage';

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
  scrollablePlanCardsContainer: {
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    justifyContent: 'center',
  },
  planCardsContainer: {
    display: 'inline-flex',
    flexDirection: 'column',
    flex: 1,
    gap: 8,
    alignItems: 'center',
    overflowY: 'auto',
  },
  planCardsMobileContainer: {
    display: 'inline-flex',
    flexDirection: 'column',
    flex: 1,
    gap: 8,
    alignItems: 'stretch',
    overflowY: 'auto',
  },
  planCardsLineContainer: {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    overflowY: 'auto',
  },
};

const cancelConfirmationTexts = {
  title: t`Cancel your subscription?`,
  message: t`By canceling your subscription, you will lose all your premium features at the end of the period you already paid for. Continue?`,
  confirmButtonLabel: t`Continue`,
  dismissButtonLabel: t`Keep subscription`,
  maxWidth: 'sm',
};
const cancelImmediatelyConfirmationTexts = {
  title: t`Cancel your subscription?`,
  message: t`By canceling your subscription you will lose all your premium features IMMEDIATELY. Continue?`,
  confirmButtonLabel: t`Cancel my subscription now`,
  dismissButtonLabel: t`Keep subscription`,
  maxWidth: 'sm',
};
const seamlesslyChangeConfirmationTexts = {
  title: t`Update your subscription`,
  message: t`Are you sure you want to change your plan? Your next payment will be pro-rated.`,
  confirmButtonLabel: t`Update my subscription`,
  dismissButtonLabel: t`Go back`,
  maxWidth: 'sm',
};
const cancelAndChangeConfirmationTexts = {
  title: t`Update your subscription`,
  message: t`To get this new subscription, we need to cancel your existing one before you can pay for the new one. The change will be immediate but your payment will NOT be pro-rated (you will have to pay as for a new subscription).`,
  confirmButtonLabel: t`Cancel my subscription`,
  dismissButtonLabel: t`Go back`,
  maxWidth: 'sm',
};
const cancelAndChangeWithValidRedeemedCodeConfirmationTexts = {
  title: t`Update your subscription`,
  message: t`To get this new subscription, we need to cancel your existing one before you can pay for the new one. The change will be immediate. You will also lose your redeemed code.`,
  confirmButtonLabel: t`Update my subscription`,
  dismissButtonLabel: t`Go back`,
  maxWidth: 'sm',
};

const getPlanSpecificRequirements = (
  i18n: I18nType,
  subscriptionPlansWithPricingSystems: ?Array<SubscriptionPlanWithPricingSystems>
): Array<string> => {
  const planSpecificRequirements = subscriptionPlansWithPricingSystems
    ? uniq(
        subscriptionPlansWithPricingSystems
          .map(subscriptionPlanWithPricingSystems => {
            if (!subscriptionPlanWithPricingSystems.specificRequirementByLocale)
              return null;
            return selectMessageByLocale(
              i18n,
              subscriptionPlanWithPricingSystems.specificRequirementByLocale
            );
          })
          .filter(Boolean)
      )
    : [];

  return planSpecificRequirements;
};

type Props = {|
  open: boolean,
  onClose: Function,
  analyticsMetadata: SubscriptionAnalyticsMetadata,
  subscriptionPlansWithPricingSystems: ?(SubscriptionPlanWithPricingSystems[]),
  userLegacySubscriptionPlanWithPricingSystem: ?SubscriptionPlanWithPricingSystems,
  filter: ?SubscriptionType,
|};

export default function SubscriptionDialog({
  open,
  onClose,
  analyticsMetadata,
  subscriptionPlansWithPricingSystems,
  userLegacySubscriptionPlanWithPricingSystem,
  filter,
}: Props) {
  const [isChangingSubscription, setIsChangingSubscription] = React.useState(
    false
  );
  const [period, setPeriod] = React.useState<'yearly' | 'monthly'>('yearly');
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
  const { showConfirmation } = useAlertDialog();
  const [cancelReasonDialogOpen, setCancelReasonDialogOpen] = React.useState(
    false
  );

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
    subscriptionPlanPricingSystem: SubscriptionPlanPricingSystem | null
  ) => {
    const { getAuthorizationHeader, subscription, profile } = authenticatedUser;
    if (!profile || !subscription) return;
    if (subscriptionPlanPricingSystem) {
      sendChoosePlanClicked({
        planId: subscriptionPlanPricingSystem.planId,
        pricingSystemId: subscriptionPlanPricingSystem.id,
      });
    }
    // Subscribing from an account without a subscription
    if (!subscription.planId && subscriptionPlanPricingSystem) {
      setSubscriptionPendingDialogOpen(true);
      const isEducationPlan =
        subscriptionPlanPricingSystem &&
        subscriptionPlanPricingSystem.planId === 'gdevelop_education';
      const quantity = isEducationPlan ? educationPlanSeatsCount : undefined;
      Window.openExternalURL(
        getRedirectToCheckoutUrl({
          pricingSystemId: subscriptionPlanPricingSystem.id,
          userId: profile.id,
          userEmail: profile.email,
          quantity,
        })
      );
      return;
    }

    if (!subscriptionPlanPricingSystem) {
      // Cancelling the existing subscription.
      const answer = await showConfirmation(
        canCancelAtEndOfPeriod(subscription)
          ? cancelConfirmationTexts
          : cancelImmediatelyConfirmationTexts
      );
      if (!answer) return;

      setCancelReasonDialogOpen(true);
      return;
    }

    const { planId } = subscriptionPlanPricingSystem;
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
      // TODO: When possible, handle cases when a subscription can be updated seamlessly.
    } else {
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
        getRedirectToCheckoutUrl({
          pricingSystemId: subscriptionPlanPricingSystem.id,
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

  const { windowSize } = useResponsiveWindowSize();

  const displayedSubscriptionPlanWithPricingSystems = subscriptionPlansWithPricingSystems
    ? [
        userLegacySubscriptionPlanWithPricingSystem,
        ...subscriptionPlansWithPricingSystems,
      ]
        .filter(Boolean)
        .filter(plan => {
          if (filter === 'individual') {
            return ['free', 'gdevelop_silver', 'gdevelop_gold'].includes(
              plan.id
            );
          }
          if (filter === 'team') {
            return ['gdevelop_startup', 'gdevelop_enterprise'].includes(
              plan.id
            );
          }
          if (filter === 'education') {
            return ['gdevelop_education'].includes(plan.id);
          }

          return plan.id !== 'gdevelop_education';
        })
    : null;

  const dialogMaxWidth =
    !displayedSubscriptionPlanWithPricingSystems ||
    displayedSubscriptionPlanWithPricingSystems.length === 1
      ? 'md'
      : displayedSubscriptionPlanWithPricingSystems.length < 4
      ? 'lg'
      : displayedSubscriptionPlanWithPricingSystems.length < 5
      ? 'xl'
      : false;

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Dialog
            title={null}
            fullHeight
            maxWidth={dialogMaxWidth}
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
            open={open}
            fixedContent={
              <>
                <Line justifyContent="space-between" alignItems="center">
                  <Text size="block-title">
                    <Trans>Subscription plans</Trans>
                  </Text>
                  <TwoStatesButton
                    value={period}
                    leftButton={{
                      label: <Trans>Monthly</Trans>,
                      value: 'monthly',
                    }}
                    rightButton={{
                      label: <Trans>Yearly</Trans>,
                      value: 'yearly',
                    }}
                    // $FlowIgnore
                    onChange={setPeriod}
                    addDatasetEffective
                  />
                </Line>
                {period !== 'yearly' && (
                  <HotMessage
                    title={<Trans>Up to 40% discount</Trans>}
                    message={
                      <Trans>
                        Get a yearly subscription and enjoy discounts up to 40%!
                      </Trans>
                    }
                    onClickRightButton={() => setPeriod('yearly')}
                    rightButtonLabel={<Trans>See yearly subs</Trans>}
                  />
                )}
              </>
            }
          >
            <ColumnStackLayout noMargin>
              {willCancelAtPeriodEnd && (
                <AlertMessage kind="warning">
                  <Trans>
                    Your subscription is being cancelled: you will lose the
                    benefits at the end of the period you already paid for.
                  </Trans>
                </AlertMessage>
              )}
              {displayedSubscriptionPlanWithPricingSystems ? (
                <div style={styles.scrollablePlanCardsContainer}>
                  <div
                    style={
                      windowSize === 'large' || windowSize === 'xlarge'
                        ? styles.planCardsLineContainer
                        : isMobile
                        ? styles.planCardsMobileContainer
                        : styles.planCardsContainer
                    }
                  >
                    {displayedSubscriptionPlanWithPricingSystems.map(
                      subscriptionPlanWithPricingSystems => {
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
                                <ColumnStackLayout
                                  key="options"
                                  expand
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
                                    floatingLabelText={
                                      <Trans>Engagement</Trans>
                                    }
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
                                </ColumnStackLayout>,
                                <RaisedButton
                                  primary
                                  key="upgrade"
                                  disabled={isLoading}
                                  fullWidth
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
                              fullWidth
                              label={
                                <LeftLoader isLoading={isLoading}>
                                  {willCancelAtPeriodEnd ? (
                                    <Trans>
                                      Already cancelled - will expire in the
                                      future
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
                            subscriptionPlanWithPricingSystems
                              .pricingSystems[0];
                          if (price) {
                            actions = [
                              <RaisedButton
                                primary
                                key="upgrade"
                                disabled={isLoading}
                                fullWidth
                                label={
                                  <LeftLoader isLoading={isLoading}>
                                    <Trans>Choose this plan</Trans>
                                  </LeftLoader>
                                }
                                onClick={() =>
                                  buyUpdateOrCancelPlan(i18n, price)
                                }
                              />,
                            ];
                          }
                        }

                        return (
                          <PlanCard
                            key={
                              subscriptionPlanWithPricingSystems.id || 'free'
                            }
                            subscriptionPlanWithPricingSystems={
                              subscriptionPlanWithPricingSystems
                            }
                            actions={actions}
                            isPending={isLoading}
                            isHighlighted={isUserCurrentOrLegacyPlan} // highlight the plan even if it's expired.
                            background="medium"
                          />
                        );
                      }
                    )}
                  </div>
                </div>
              ) : (
                <PlaceholderLoader />
              )}
              {getPlanSpecificRequirements(
                i18n,
                displayedSubscriptionPlanWithPricingSystems
              ).map(planSpecificRequirements => (
                <AlertMessage kind="info">
                  {planSpecificRequirements}
                </AlertMessage>
              ))}
              <EmptyMessage>
                <Trans>
                  No ties, cancel your subscription anytime. Payments done using
                  Stripe.com and PayPal secure infrastructure.
                </Trans>
                <div>
                  <Trans>
                    Compare all the advantages of the different plans in this{' '}
                    <Link
                      href="https://gdevelop.io/pricing#feature-comparison"
                      onClick={() =>
                        Window.openExternalURL(
                          'https://gdevelop.io/pricing#feature-comparison'
                        )
                      }
                    >
                      big feature comparison table
                    </Link>
                    .
                  </Trans>
                </div>
              </EmptyMessage>
            </ColumnStackLayout>
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
                    Create an account to get started with GDevelop and access to
                    cloud projects, cloud builds, game analytics, leaderboards
                    and more.
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
          {cancelReasonDialogOpen && (
            <CancelReasonDialog
              onClose={() => {
                setCancelReasonDialogOpen(false);
              }}
              onCloseAfterSuccess={() => {
                setCancelReasonDialogOpen(false);
                onClose();
              }}
            />
          )}
        </>
      )}
    </I18n>
  );
}
