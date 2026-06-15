// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Dialog from '../../../UI/Dialog';
import AuthenticatedUserContext from '../../AuthenticatedUserContext';
import {
  type SubscriptionPlanWithPricingSystems,
  hasValidSubscriptionPlan,
  hasSubscriptionBeenManuallyAdded,
  isSubscriptionComingFromTeam,
  hasMobileAppStoreSubscriptionPlan,
  canUpgradeSubscription,
  validateCoupon,
  type PricingSystemDiscount,
} from '../../../Utils/GDevelopServices/Usage';
import Text from '../../../UI/Text';
import { ColumnStackLayout, LineStackLayout } from '../../../UI/Layout';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';
import { Column, Line, Spacer } from '../../../UI/Grid';
import { SubscriptionContext } from '../SubscriptionContext';
import SubscriptionOptions from './SubscriptionOptions';
import SubscriptionPlan from './SubscriptionPlan';
import AlertMessage from '../../../UI/AlertMessage';
import Paper from '../../../UI/Paper';
import { formatPriceWithCurrency, getPlanIcon } from '../PlanSmallCard';
import { selectMessageByLocale } from '../../../Utils/i18n/MessageByLocale';
import FlatButton from '../../../UI/FlatButton';
import { uniq } from 'lodash';
import { useSubscriptionPlanChange } from './useSubscriptionPlanChange';

const styles = {
  currentPlanPaper: {
    padding: '8px 12px',
    marginBottom: 8,
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
}: Props): React.Node {
  const [
    educationPlanSeatsCount,
    setEducationPlanSeatsCount,
  ] = React.useState<number>(20);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { subscriptionPricingSystem } = authenticatedUser;

  const { clearCouponCode, openRedeemCodeDialog } = React.useContext(
    SubscriptionContext
  );

  const [
    availableRecommendedPlanId,
    setAvailableRecommendedPlanId,
  ] = React.useState(null);
  const [selectedPlanId, setSelectedPlanId] = React.useState(null);

  const {
    buyUpdateOrCancelPlan,
    isChangingSubscription,
    cancelReasonDialog,
  } = useSubscriptionPlanChange({
    onClose,
    onOpenPendingDialog,
    couponCode,
    seatsCount: educationPlanSeatsCount,
  });

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
          // $FlowFixMe[incompatible-type]
          setSelectedPlanId(planIdToSelect);
          // $FlowFixMe[incompatible-type]
          setAvailableRecommendedPlanId(planIdToRecommend);
        } else {
          const firstPlanId = purchasablePlansWithPricingSystems[0].id;
          // $FlowFixMe[incompatible-type]
          setSelectedPlanId(firstPlanId);
          // $FlowFixMe[incompatible-type]
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
              // $FlowFixMe[invalid-compare]
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
                    // $FlowFixMe[incompatible-type]
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
          {cancelReasonDialog}
        </>
      )}
    </I18n>
  );
}
