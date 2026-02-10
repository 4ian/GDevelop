// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Dialog from '../../../UI/Dialog';
import AuthenticatedUserContext from '../../AuthenticatedUserContext';
import {
  getRedirectToCheckoutUrl,
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
  changeUserSubscription,
  hasValidSubscriptionPlan,
  hasSubscriptionBeenManuallyAdded,
  isSubscriptionComingFromTeam,
  hasMobileAppStoreSubscriptionPlan,
  canUpgradeSubscription,
  validateCoupon,
  type PricingSystemDiscount,
} from '../../../Utils/GDevelopServices/Usage';
import {
  sendCancelSubscriptionToChange,
  sendChoosePlanClicked,
} from '../../../Utils/Analytics/EventSender';
import Window from '../../../Utils/Window';
import Text from '../../../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../../../UI/Layout';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';
import { Column, Line, Spacer } from '../../../UI/Grid';
import { SubscriptionContext } from '../SubscriptionContext';
import SubscriptionOptions from './SubscriptionOptions';
import SubscriptionPlan from './SubscriptionPlan';
import AlertMessage from '../../../UI/AlertMessage';
import useAlertDialog from '../../../UI/Alert/useAlertDialog';
import Paper from '../../../UI/Paper';
import { formatPriceWithCurrency, getPlanIcon } from '../PlanSmallCard';
import { selectMessageByLocale } from '../../../Utils/i18n/MessageByLocale';
import FlatButton from '../../../UI/FlatButton';
import CancelReasonDialog from '../CancelReasonDialog';
import { uniq } from 'lodash';

const styles = {
  currentPlanPaper: {
    padding: '8px 12px',
    marginBottom: 8,
  },
};

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
  availableSubscriptionPlansWithPrices: ?(SubscriptionPlanWithPricingSystems[]),
  userSubscriptionPlanEvenIfLegacy: ?SubscriptionPlanWithPricingSystems,
  recommendedPlanId: ?string,
  onOpenPendingDialog: (open: boolean) => void,
  couponCode?: ?string,
|};

export default function SubscriptionDialog({
  onClose,
  availableSubscriptionPlansWithPrices,
  userSubscriptionPlanEvenIfLegacy,
  recommendedPlanId,
  onOpenPendingDialog,
  couponCode,
}: Props) {
  const [isChangingSubscription, setIsChangingSubscription] = React.useState(
    false
  );
  const [
    educationPlanSeatsCount,
    setEducationPlanSeatsCount,
  ] = React.useState<number>(20);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    getAuthorizationHeader,
    subscription,
    profile,
    subscriptionPricingSystem,
  } = authenticatedUser;

  const { clearCouponCode, openRedeemCodeDialog } = React.useContext(
    SubscriptionContext
  );

  const [
    availableRecommendedPlanId,
    setAvailableRecommendedPlanId,
  ] = React.useState(null);
  const [selectedPlanId, setSelectedPlanId] = React.useState(null);

  const {
    showAlert,
    showConfirmation,
    showDeleteConfirmation,
  } = useAlertDialog();
  const [cancelReasonDialogOpen, setCancelReasonDialogOpen] = React.useState(
    false
  );
  const [pricingSystemDiscounts, setPricingSystemDiscounts] = React.useState<{
    [pricingSystemId: string]: PricingSystemDiscount,
  }>({});
  const [isValidatingCoupon, setIsValidatingCoupon] = React.useState(false);
  const [couponErrorMessage, setCouponErrorMessage] = React.useState<?string>(
    null
  );

  const onClearCoupon = React.useCallback(
    () => {
      clearCouponCode();
      setPricingSystemDiscounts({});
      setCouponErrorMessage(null);
    },
    [clearCouponCode]
  );

  const buyUpdateOrCancelPlan = async (
    i18n: I18nType,
    subscriptionPlanPricingSystem: SubscriptionPlanPricingSystem | null
  ) => {
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
          couponCode: couponCode || undefined,
        })
      );
      return;
    }

    if (!subscriptionPlanPricingSystem) {
      // Cancelling the existing subscription.
      const answer = await showConfirmation(
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
          : await showConfirmation(dialogTexts);
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

  const isLoading =
    authenticatedUser.loginState === 'loggingIn' || isChangingSubscription;

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

  const purchasablePlansWithPricingSystems = React.useMemo(
    () =>
      availableSubscriptionPlansWithPrices
        ? [...availableSubscriptionPlansWithPrices].filter(Boolean).filter(
            subscriptionPlanWithPricingSystems =>
              // Hide free plan
              subscriptionPlanWithPricingSystems.pricingSystems.length > 0
          )
        : null,
    [availableSubscriptionPlansWithPrices]
  );

  React.useEffect(
    () => {
      // Only set the selected plan on initial load, not when subscription updates
      if (purchasablePlansWithPricingSystems && selectedPlanId === null) {
        // We recommend a planId only if the user doesn't have a plan yet,
        // or has a plan that can be upgraded.
        let planIdToRecommend = null;
        if (
          !authenticatedUser.subscription ||
          canUpgradeSubscription(authenticatedUser.subscription)
        ) {
          planIdToRecommend = recommendedPlanId;
        }
        const planIdToSelect = planIdToRecommend || userPlanId;
        const foundPlanPricingSystem = purchasablePlansWithPricingSystems.find(
          purchasablePlanWithPricingSystems =>
            purchasablePlanWithPricingSystems.id === planIdToSelect
        );
        if (foundPlanPricingSystem) {
          setSelectedPlanId(planIdToSelect);
          setAvailableRecommendedPlanId(planIdToRecommend);
        } else {
          const firstPlanId = purchasablePlansWithPricingSystems[0].id;
          setSelectedPlanId(firstPlanId);
          setAvailableRecommendedPlanId(firstPlanId);
        }
      }
    },
    [
      purchasablePlansWithPricingSystems,
      recommendedPlanId,
      userPlanId,
      authenticatedUser.subscription,
      selectedPlanId,
    ]
  );

  const displayedPlan = React.useMemo(
    () =>
      purchasablePlansWithPricingSystems
        ? purchasablePlansWithPricingSystems.find(
            purchasablePlanWithPricingSystems =>
              purchasablePlanWithPricingSystems.id === selectedPlanId
          )
        : null,
    [purchasablePlansWithPricingSystems, selectedPlanId]
  );

  // Validate coupon when coupon code is provided
  React.useEffect(
    () => {
      if (!couponCode) {
        // Clear local state when coupon is removed
        setPricingSystemDiscounts({});
        setCouponErrorMessage(null);
        setIsValidatingCoupon(false);
        return;
      }

      const validateCouponCode = async () => {
        setIsValidatingCoupon(true);
        setCouponErrorMessage(null);

        try {
          const result = await validateCoupon(couponCode);

          if (result.isValid) {
            // Convert array to map for easier lookup by pricingSystemId
            const discountsMap: {
              [pricingSystemId: string]: PricingSystemDiscount,
            } = {};
            result.pricingSystemDiscounts.forEach(discount => {
              discountsMap[discount.pricingSystemId] = discount;
            });
            setPricingSystemDiscounts(discountsMap);
          } else {
            setCouponErrorMessage(result.errorMessage || null);
            setPricingSystemDiscounts({});
          }
        } catch (error) {
          console.error('Error validating coupon:', error);
          setCouponErrorMessage('Error validating coupon');
          setPricingSystemDiscounts({});
        } finally {
          setIsValidatingCoupon(false);
        }
      };

      validateCouponCode();
    },
    [couponCode]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Dialog
            title={<Trans>Get GDevelop Premium</Trans>}
            subtitle={
              <Trans>
                Choose a subscription to enjoy the best of game creation.
              </Trans>
            }
            open
            onRequestClose={onClose}
            minHeight="lg"
            maxWidth="lg"
            flexColumnBody
            topBackgroundSrc={'res/premium/premium_dialog_background.png'}
          >
            {isPlanValid && userSubscriptionPlanEvenIfLegacy && (
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
                        planId: userSubscriptionPlanEvenIfLegacy.id,
                        logoSize: 20,
                      })}
                      <Text size="block-title">
                        {selectMessageByLocale(
                          i18n,
                          userSubscriptionPlanEvenIfLegacy.nameByLocale
                        )}
                      </Text>
                      <Spacer />
                      {subscriptionPricingSystem && (
                        <Text color="secondary" size="sub-title">
                          (
                          {subscriptionPricingSystem.period === 'year' ? (
                            !subscriptionPricingSystem.isPerUser ? (
                              <Trans>
                                Yearly,
                                {formatPriceWithCurrency(
                                  subscriptionPricingSystem.amountInCents,
                                  subscriptionPricingSystem.currency
                                )}
                              </Trans>
                            ) : (
                              <Trans>
                                Yearly,
                                {formatPriceWithCurrency(
                                  subscriptionPricingSystem.amountInCents,
                                  subscriptionPricingSystem.currency
                                )}{' '}
                                per seat
                              </Trans>
                            )
                          ) : subscriptionPricingSystem.period === 'month' ? (
                            !subscriptionPricingSystem.isPerUser ? (
                              <Trans>
                                Monthly,
                                {formatPriceWithCurrency(
                                  subscriptionPricingSystem.amountInCents,
                                  subscriptionPricingSystem.currency
                                )}
                              </Trans>
                            ) : (
                              <Trans>
                                Monthly,
                                {formatPriceWithCurrency(
                                  subscriptionPricingSystem.amountInCents,
                                  subscriptionPricingSystem.currency
                                )}{' '}
                                per seat
                              </Trans>
                            )
                          ) : (
                            formatPriceWithCurrency(
                              subscriptionPricingSystem.amountInCents,
                              subscriptionPricingSystem.currency
                            )
                          )}
                          )
                        </Text>
                      )}
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
                    {authenticatedUser.subscription &&
                      authenticatedUser.subscription.pricingSystemId ===
                        'REDEMPTION_CODE' &&
                      authenticatedUser.subscription
                        .redemptionCodeValidUntil && (
                        <Text color="secondary">
                          <Trans>
                            Redeemed code valid until{' '}
                            {new Date(
                              authenticatedUser.subscription.redemptionCodeValidUntil
                            ).toLocaleDateString()}
                            .
                          </Trans>
                        </Text>
                      )}
                    {willCancelAtPeriodEnd && (
                      <Text color="secondary">
                        <Trans>
                          Cancelled - Your subscription will end at the end of
                          the paid period.
                        </Trans>
                      </Text>
                    )}
                  </Line>
                </Paper>
              </Column>
            )}
            {!purchasablePlansWithPricingSystems ||
            !displayedPlan ||
            !selectedPlanId ||
            authenticatedUser.loginState === 'loggingIn' ? (
              <PlaceholderLoader />
            ) : (
              <ColumnStackLayout noMargin justifyContent="space-between" expand>
                <ColumnStackLayout expand noMargin>
                  <SubscriptionPlan
                    onClickRedeemCode={
                      !authenticatedUser.authenticated
                        ? authenticatedUser.onOpenCreateAccountDialog
                        : () => openRedeemCodeDialog()
                    }
                    subscriptionPlanWithPricingSystems={displayedPlan}
                    disabled={isLoading}
                    onClickChoosePlan={async pricingSystem => {
                      if (!authenticatedUser.authenticated) {
                        authenticatedUser.onOpenCreateAccountDialog();
                      } else {
                        await buyUpdateOrCancelPlan(i18n, pricingSystem);
                      }
                    }}
                    seatsCount={educationPlanSeatsCount}
                    setSeatsCount={setEducationPlanSeatsCount}
                    couponCode={couponCode}
                    pricingSystemDiscounts={pricingSystemDiscounts}
                    couponErrorMessage={couponErrorMessage}
                    isValidatingCoupon={isValidatingCoupon}
                    onClearCoupon={onClearCoupon}
                  />
                  <SubscriptionOptions
                    subscriptionPlansWithPricingSystems={
                      purchasablePlansWithPricingSystems
                    }
                    ownedPlanId={userPlanId}
                    selectedPlanId={selectedPlanId}
                    recommendedPlanId={availableRecommendedPlanId}
                    onClick={setSelectedPlanId}
                    disabled={isLoading}
                  />
                </ColumnStackLayout>
                <Line>
                  <ColumnStackLayout noMargin>
                    <Column noMargin>
                      <LineStackLayout noMargin>
                        <Text size="sub-title">❤️</Text>
                        <Text size="sub-title">
                          <Trans>Support What You Love</Trans>
                        </Text>
                      </LineStackLayout>
                      <Text size="body" color="secondary">
                        <Trans>
                          The GDevelop project is open-source, powered by
                          passion and community. Your membership helps the
                          GDevelop company maintain servers, build new features,
                          develop commercial offerings and keep the open-source
                          project thriving. Our goal: make game development
                          fast, fun and accessible to all.
                        </Trans>
                      </Text>
                    </Column>
                    {getPlanSpecificRequirements(
                      i18n,
                      availableSubscriptionPlansWithPrices
                    ).map(planSpecificRequirements => (
                      <AlertMessage
                        kind="info"
                        key={planSpecificRequirements.substring(0, 25)}
                      >
                        {planSpecificRequirements}
                      </AlertMessage>
                    ))}
                  </ColumnStackLayout>
                </Line>
              </ColumnStackLayout>
            )}
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
