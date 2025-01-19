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
  hasValidSubscriptionPlan,
  EDUCATION_PLAN_MAX_SEATS,
  EDUCATION_PLAN_MIN_SEATS,
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
  type Subscription,
  hasMobileAppStoreSubscriptionPlan,
  hasSubscriptionBeenManuallyAdded,
  isSubscriptionComingFromTeam,
} from '../../Utils/GDevelopServices/Usage';
import { showErrorBox } from '../../UI/Messages/MessageBox';
import {
  sendChoosePlanClicked,
  sendCancelSubscriptionToChange,
} from '../../Utils/Analytics/EventSender';
import { type SubscriptionType } from './SubscriptionSuggestionContext';
import Window from '../../Utils/Window';
import Text from '../../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import RedemptionCodeIcon from '../../UI/CustomSvgIcons/RedemptionCode';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import RedeemCodeDialog from '../RedeemCodeDialog';
import PlanCard, { getPlanIcon } from './PlanCard';
import LeftLoader from '../../UI/LeftLoader';
import RaisedButton from '../../UI/RaisedButton';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import AlertMessage from '../../UI/AlertMessage';
import PlaceholderLoader from '../../UI/PlaceholderLoader';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import Link from '../../UI/Link';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';
import uniq from 'lodash/uniq';
import CancelReasonDialog from './CancelReasonDialog';
import { Column, Line } from '../../UI/Grid';
import TwoStatesButton from '../../UI/TwoStatesButton';
import HotMessage from '../../UI/HotMessage';
import Paper from '../../UI/Paper';

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
  currentPlanPaper: {
    padding: '8px 12px',
  },
};

const cancelConfirmationTexts = {
  title: t`Cancel your subscription?`,
  message: t`By canceling your subscription, you will lose all your premium features at the end of the period you already paid for. Continue?`,
  confirmButtonLabel: t`Continue`,
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
  message: t`To get this new subscription, we need to stop your existing one before you can pay for the new one. This is immediate but your payment will NOT be pro-rated (you will pay the full price for the new subscription). You won't lose any project, game or other data.`,
  confirmButtonLabel: t`Cancel and upgrade my subscription`,
  dismissButtonLabel: t`Go back`,
  maxWidth: 'sm',
};
const cancelAndChangeWithValidRedeemedCodeConfirmationTexts = {
  title: t`Update your subscription`,
  message: t`To get this new subscription, we need to stop your existing one before you can pay for the new one. The change will be immediate. You will also lose your redeemed code.`,
  confirmButtonLabel: t`Update my subscription`,
  dismissButtonLabel: t`Go back`,
  maxWidth: 'sm',
};

const getSubscriptionPricingSystemPeriod = (
  subscription: ?Subscription,
  subscriptionPlansWithPricingSystems: ?(SubscriptionPlanWithPricingSystems[])
): null | 'year' | 'month' => {
  if (!subscription || !subscriptionPlansWithPricingSystems) return null;
  const allPricingSystems = subscriptionPlansWithPricingSystems
    .map(
      subscriptionPlanWithPricingSystems =>
        subscriptionPlanWithPricingSystems.pricingSystems
    )
    .flat();
  const subscriptionPricingSystem = allPricingSystems.find(
    pricingSystem => pricingSystem.id === subscription.pricingSystemId
  );
  if (
    !subscriptionPricingSystem ||
    // TODO: Add support for weekly subscriptions when needed.
    subscriptionPricingSystem.period === 'week'
  ) {
    return null;
  }
  return subscriptionPricingSystem.period;
};

const getMaximumYearlyDiscountOverPlans = ({
  subscriptionPlansWithPricingSystems,
}: {|
  subscriptionPlansWithPricingSystems: ?Array<SubscriptionPlanWithPricingSystems>,
|}): number => {
  if (!subscriptionPlansWithPricingSystems) return 0;
  let maximumDiscount = 0;
  subscriptionPlansWithPricingSystems.forEach(
    subscriptionPlanWithPricingSystems => {
      if (subscriptionPlanWithPricingSystems.isLegacy) return;
      const { pricingSystems } = subscriptionPlanWithPricingSystems;
      const monthlyPricingSystem = pricingSystems.find(
        pricingSystem => pricingSystem.period === 'month'
      );
      const yearlyPricingSystem = pricingSystems.find(
        pricingSystem => pricingSystem.period === 'year'
      );
      if (!monthlyPricingSystem || !yearlyPricingSystem) return;
      const discount =
        100 -
        (yearlyPricingSystem.amountInCents /
          (monthlyPricingSystem.amountInCents * 12)) *
          100;
      if (discount > maximumDiscount) {
        maximumDiscount = discount;
      }
    }
  );
  return maximumDiscount;
};

export const getPlanSpecificRequirements = (
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
  onClose: Function,
  subscriptionPlansWithPricingSystems: ?(SubscriptionPlanWithPricingSystems[]),
  userLegacySubscriptionPlanWithPricingSystem: ?SubscriptionPlanWithPricingSystems,
  filter: ?SubscriptionType,
  onOpenPendingDialog: (open: boolean) => void,
|};

export default function SubscriptionDialog({
  onClose,
  subscriptionPlansWithPricingSystems,
  userLegacySubscriptionPlanWithPricingSystem,
  filter,
  onOpenPendingDialog,
}: Props) {
  const [isChangingSubscription, setIsChangingSubscription] = React.useState(
    false
  );
  const [
    educationPlanSeatsCount,
    setEducationPlanSeatsCount,
  ] = React.useState<number>(20);
  const [redeemCodeDialogOpen, setRedeemCodeDialogOpen] = React.useState(false);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const [period, setPeriod] = React.useState<'year' | 'month'>(
    getSubscriptionPricingSystemPeriod(
      authenticatedUser.subscription,
      subscriptionPlansWithPricingSystems
    ) || 'year'
  );

  const { showConfirmation } = useAlertDialog();
  const [cancelReasonDialogOpen, setCancelReasonDialogOpen] = React.useState(
    false
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
      onOpenPendingDialog(true);
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
      const answer = await showConfirmation(cancelConfirmationTexts);
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
      onOpenPendingDialog(true);
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
  const userPricingSystemId = authenticatedUser.subscription
    ? authenticatedUser.subscription.pricingSystemId
    : null;
  const userSubscriptionPlanWithPricingSystems =
    userPlanId && subscriptionPlansWithPricingSystems
      ? subscriptionPlansWithPricingSystems.find(
          subscriptionPlanWithPricingSystems =>
            subscriptionPlanWithPricingSystems.id === userPlanId
        )
      : null;

  const { windowSize, isMobile } = useResponsiveWindowSize();

  const displayedSubscriptionPlanWithPricingSystems = subscriptionPlansWithPricingSystems
    ? [
        userLegacySubscriptionPlanWithPricingSystem,
        ...subscriptionPlansWithPricingSystems,
      ]
        .filter(Boolean)
        .filter(plan => {
          if (filter === 'individual') {
            if (isPlanValid) {
              return ['free', 'gdevelop_silver', 'gdevelop_gold'].includes(
                plan.id
              );
            } else {
              return ['gdevelop_silver', 'gdevelop_gold'].includes(plan.id);
            }
          }
          if (filter === 'team') {
            return ['gdevelop_startup', 'gdevelop_enterprise'].includes(
              plan.id
            );
          }
          if (filter === 'education') {
            return ['gdevelop_education'].includes(plan.id);
          }

          return !['gdevelop_education', 'free'].includes(plan.id);
        })
    : null;

  const dialogMaxWidth =
    !displayedSubscriptionPlanWithPricingSystems ||
    displayedSubscriptionPlanWithPricingSystems.length === 1
      ? 'sm'
      : displayedSubscriptionPlanWithPricingSystems.length < 3
      ? 'md'
      : displayedSubscriptionPlanWithPricingSystems.length < 4
      ? 'lg'
      : displayedSubscriptionPlanWithPricingSystems.length < 5
      ? 'xl'
      : false;
  const maximumDiscount = getMaximumYearlyDiscountOverPlans({
    subscriptionPlansWithPricingSystems,
  });

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
            open
          >
            {isPlanValid && userSubscriptionPlanWithPricingSystems && (
              <Column noMargin>
                <Text>
                  <Trans>Your plan:</Trans>
                </Text>
                <Paper
                  background="medium"
                  variant="outlined"
                  style={styles.currentPlanPaper}
                >
                  <Line
                    justifyContent="space-between"
                    alignItems="center"
                    noMargin
                  >
                    <Line alignItems="center" noMargin>
                      {getPlanIcon({
                        subscriptionPlan: userSubscriptionPlanWithPricingSystems,
                        logoSize: 20,
                      })}
                      <Text size="block-title">
                        {selectMessageByLocale(
                          i18n,
                          userSubscriptionPlanWithPricingSystems.nameByLocale
                        )}
                      </Text>
                    </Line>
                    {!hasSubscriptionBeenManuallyAdded(
                      authenticatedUser.subscription
                    ) &&
                      !isSubscriptionComingFromTeam(
                        authenticatedUser.subscription
                      ) &&
                      !willCancelAtPeriodEnd &&
                      userPricingSystemId !== 'REDEMPTION_CODE' && (
                        <FlatButton
                          primary
                          label={<Trans>Cancel subscription</Trans>}
                          onClick={() => buyUpdateOrCancelPlan(i18n, null)}
                        />
                      )}
                  </Line>
                </Paper>
              </Column>
            )}
            <ColumnStackLayout noMargin>
              <Line justifyContent="space-between" alignItems="center">
                <Text size="block-title">
                  <Trans>Get GDevelop Premium</Trans>
                </Text>
                <TwoStatesButton
                  value={period}
                  leftButton={{
                    label: <Trans>Monthly</Trans>,
                    value: 'month',
                  }}
                  rightButton={{
                    label: <Trans>Yearly</Trans>,
                    value: 'year',
                  }}
                  // $FlowIgnore
                  onChange={setPeriod}
                />
              </Line>
              {period !== 'year' && maximumDiscount > 0 && (
                <HotMessage
                  title={
                    <Trans>Up to {maximumDiscount.toFixed(0)}% discount</Trans>
                  }
                  message={
                    <Trans>
                      Get a yearly subscription and enjoy discounts up to
                      {maximumDiscount.toFixed(0)}%!
                    </Trans>
                  }
                  onClickRightButton={() => setPeriod('year')}
                  rightButtonLabel={
                    isMobile ? (
                      <Trans>Check out</Trans>
                    ) : (
                      <Trans>See yearly subs</Trans>
                    )
                  }
                />
              )}
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
                        const pricingSystem = isFreePlan
                          ? null
                          : subscriptionPlanWithPricingSystems.pricingSystems.find(
                              _pricingSystem => _pricingSystem.period === period
                            );
                        let actions: React.Node = null;
                        if (isFreePlan || !pricingSystem) {
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
                                      period === 'year'
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
                          const isUserCurrentPricingSystem = pricingSystem
                            ? pricingSystem.id === userPricingSystemId
                            : false;
                          if (willCancelAtPeriodEnd) {
                            actions = [
                              <FlatButton
                                key="cancel"
                                disabled
                                fullWidth
                                label={
                                  <LeftLoader isLoading={isLoading}>
                                    <Trans>
                                      Already cancelled - will expire in the
                                      future
                                    </Trans>
                                  </LeftLoader>
                                }
                                onClick={() => {}}
                              />,
                            ];
                          } else if (isUserCurrentPricingSystem) {
                            actions = [
                              <FlatButton
                                key="cancel"
                                disabled={isLoading}
                                fullWidth
                                label={
                                  <LeftLoader isLoading={isLoading}>
                                    <Trans>Cancel your subscription</Trans>
                                  </LeftLoader>
                                }
                                onClick={() =>
                                  buyUpdateOrCancelPlan(i18n, null)
                                }
                              />,
                            ];
                          } else {
                            actions = [
                              <RaisedButton
                                key="switch"
                                disabled={isLoading}
                                fullWidth
                                label={
                                  <LeftLoader isLoading={isLoading}>
                                    {period === 'year' ? (
                                      <Trans>Switch to yearly pricing</Trans>
                                    ) : (
                                      <Trans>Switch to monthly pricing</Trans>
                                    )}
                                  </LeftLoader>
                                }
                                onClick={() =>
                                  buyUpdateOrCancelPlan(i18n, pricingSystem)
                                }
                              />,
                            ];
                          }
                        } else {
                          const pricingSystem = subscriptionPlanWithPricingSystems.pricingSystems.find(
                            _pricingSystem => _pricingSystem.period === period
                          );
                          if (pricingSystem) {
                            actions = [
                              <RaisedButton
                                color="premium"
                                key="upgrade"
                                disabled={isLoading}
                                fullWidth
                                label={
                                  <LeftLoader isLoading={isLoading}>
                                    <Trans>Choose this plan</Trans>
                                  </LeftLoader>
                                }
                                onClick={() =>
                                  buyUpdateOrCancelPlan(i18n, pricingSystem)
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
                            periodToDisplay={period}
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
              <Line noMargin justifyContent="center">
                <Text size="body" color="secondary">
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
                </Text>
              </Line>
              <Column noMargin>
                <LineStackLayout noMargin>
                  <Text size="sub-title">❤️</Text>
                  <Text size="sub-title">
                    <Trans>Support What You Love</Trans>
                  </Text>
                </LineStackLayout>
                <Text size="body" color="secondary">
                  <Trans>
                    The GDevelop project is open-source, powered by passion and
                    community. Your membership helps the GDevelop company
                    maintain servers, build new features, develop commercial
                    offerings and keep the open-source project thriving. Our
                    goal: make game development fast, fun and accessible to all.
                  </Trans>
                </Text>
              </Column>
              {getPlanSpecificRequirements(
                i18n,
                displayedSubscriptionPlanWithPricingSystems
              ).map(planSpecificRequirements => (
                <AlertMessage
                  kind="info"
                  key={planSpecificRequirements.substring(0, 25)}
                >
                  {planSpecificRequirements}
                </AlertMessage>
              ))}
            </ColumnStackLayout>
          </Dialog>
          {hasMobileAppStoreSubscriptionPlan(
            authenticatedUser.subscription
          ) && (
            <Dialog
              open
              title={
                <Trans>
                  Subscription with the Apple App store or Google Play store
                </Trans>
              }
              maxWidth="sm"
              cannotBeDismissed
              actions={[
                <FlatButton
                  key="close"
                  label={
                    <Trans>
                      Understood, I'll check my Apple or Google account
                    </Trans>
                  }
                  onClick={onClose}
                />,
              ]}
            >
              <Text>
                <Trans>
                  The subscription of this account was done using Apple or
                  Google Play. Connect on your account on your Apple or Google
                  device to manage it.
                </Trans>
              </Text>
            </Dialog>
          )}
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
                    onOpenPendingDialog(true);
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
