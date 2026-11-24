// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import {
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
  type PricingSystemDiscount,
  type CouponValidationError,
} from '../../../Utils/GDevelopServices/Usage';
import { formatPriceWithCurrency } from '../PlanSmallCard';
import RedemptionCodeIcon from '../../../UI/CustomSvgIcons/RedemptionCode';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import { Trans } from '@lingui/macro';
import FlatButton from '../../../UI/FlatButton';
import Text from '../../../UI/Text';
import { IconButton } from '@material-ui/core';
import Cross from '../../../UI/CustomSvgIcons/Cross';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import SubscriptionPlanTableSummary from './SubscriptionPlanTableSummary';
import SubscriptionPlanPricingSummary from './SubscriptionPlanPricingSummary';
import SecureCheckout from '../../../AssetStore/SecureCheckout/SecureCheckout';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';

const styles = {
  simpleSizeContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doubleSizeContainer: {
    display: 'flex',
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossIcon: {
    width: 16,
    height: 16,
  },
};

export type CouponError =
  | CouponValidationError
  | {| code: 'validation-request-failed' |};

const getCouponDiscountMessage = (
  pricingSystemDiscount: PricingSystemDiscount
): React.Node => {
  const { discountPercentage } = pricingSystemDiscount;
  const savings = formatPriceWithCurrency(
    pricingSystemDiscount.originalAmountInCents -
      pricingSystemDiscount.discountedAmountInCents,
    pricingSystemDiscount.currency
  );
  return discountPercentage !== null ? (
    <Trans>
      {discountPercentage}% off - Save {savings}
    </Trans>
  ) : (
    <Trans>{savings} off</Trans>
  );
};

const getCouponErrorMessage = (couponError: CouponError): React.Node => {
  switch (couponError.code) {
    case 'missing-code':
      return <Trans>Please enter a coupon code.</Trans>;
    case 'invalid-code':
      return <Trans>This coupon code is not valid.</Trans>;
    case 'inactive':
      return <Trans>This coupon is no longer active.</Trans>;
    case 'not-yet-valid':
      return <Trans>This coupon is not yet valid.</Trans>;
    case 'expired':
      return <Trans>This coupon has expired.</Trans>;
    case 'not-applicable-to-plan':
      return <Trans>This coupon is not applicable to the selected plan.</Trans>;
    case 'not-applicable-to-period':
      if (couponError.period === 'week')
        return (
          <Trans>This coupon is not applicable to weekly subscriptions.</Trans>
        );
      if (couponError.period === 'month')
        return (
          <Trans>This coupon is not applicable to monthly subscriptions.</Trans>
        );
      return (
        <Trans>This coupon is not applicable to yearly subscriptions.</Trans>
      );
    case 'wrong-currency':
      const { currency } = couponError;
      return <Trans>This coupon is only valid for {currency} purchases.</Trans>;
    case 'redemption-code':
      return (
        <Trans>
          To use a redemption code, go to your profile and click "Redeem a
          code".
        </Trans>
      );
    case 'validation-request-failed':
      return <Trans>Error while validating the coupon. Try again later.</Trans>;
    case 'not-applicable':
    default:
      return <Trans>This coupon is not applicable to any subscription.</Trans>;
  }
};

const SubscriptionPlan = ({
  subscriptionPlanWithPricingSystems,
  disabled,
  onClickRedeemCode,
  onClickChoosePlan,
  seatsCount,
  setSeatsCount,
  couponCode,
  pricingSystemDiscounts,
  couponError,
  isValidatingCoupon,
  onClearCoupon,
}: {|
  subscriptionPlanWithPricingSystems: SubscriptionPlanWithPricingSystems,
  disabled?: boolean,
  onClickRedeemCode: () => void,
  onClickChoosePlan: (
    pricingSystem: SubscriptionPlanPricingSystem | null
  ) => Promise<void>,
  seatsCount: number,
  setSeatsCount: (seatsCount: number) => void,
  couponCode: ?string,
  pricingSystemDiscounts: { [pricingSystemId: string]: PricingSystemDiscount },
  couponError: ?CouponError,
  isValidatingCoupon: boolean,
  onClearCoupon: () => void,
|}): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const { windowSize } = useResponsiveWindowSize();
  const isLargeScreen = windowSize === 'large' || windowSize === 'xlarge';
  const [period, setPeriod] = React.useState<'year' | 'month'>('year');

  // Get the pricing system for the current period
  const selectedPricingSystem = subscriptionPlanWithPricingSystems.pricingSystems.find(
    pricingSystem => pricingSystem.period === period
  );

  // Get coupon discount for the selected pricing system
  const pricingSystemDiscount =
    selectedPricingSystem && pricingSystemDiscounts[selectedPricingSystem.id];

  return (
    <I18n>
      {({ i18n }) => (
        <ResponsiveLineStackLayout
          noMargin
          expand
          noColumnMargin
          noResponsiveLandscape
        >
          <div
            style={
              isLargeScreen
                ? styles.doubleSizeContainer
                : styles.simpleSizeContainer
            }
          >
            <SubscriptionPlanTableSummary
              subscriptionPlanWithPricingSystems={
                subscriptionPlanWithPricingSystems
              }
            />
          </div>
          <div style={styles.simpleSizeContainer}>
            <ColumnStackLayout noMargin>
              <SubscriptionPlanPricingSummary
                subscriptionPlanWithPricingSystems={
                  subscriptionPlanWithPricingSystems
                }
                disabled={disabled}
                onClickChoosePlan={onClickChoosePlan}
                seatsCount={seatsCount}
                setSeatsCount={setSeatsCount}
                period={period}
                setPeriod={setPeriod}
                pricingSystemDiscounts={pricingSystemDiscounts}
              />
              <SecureCheckout includeCancelInformation />
              {couponCode && !isValidatingCoupon ? (
                <LineStackLayout
                  alignItems="center"
                  justifyContent="center"
                  noMargin
                >
                  <IconButton size="small" onClick={onClearCoupon}>
                    <Cross style={styles.crossIcon} />
                  </IconButton>
                  <Text color="primary">
                    <b>{couponCode.toUpperCase()}</b>
                  </Text>
                  {pricingSystemDiscount ? (
                    <div style={{ color: gdevelopTheme.message.valid }}>
                      <Text color="inherit">
                        {getCouponDiscountMessage(pricingSystemDiscount)}
                      </Text>
                    </div>
                  ) : (
                    <Text color="error">
                      -{' '}
                      {couponError ? (
                        getCouponErrorMessage(couponError)
                      ) : (
                        <Trans>Not applicable to this plan</Trans>
                      )}
                    </Text>
                  )}
                </LineStackLayout>
              ) : (
                <FlatButton
                  leftIcon={!isValidatingCoupon ? <RedemptionCodeIcon /> : null}
                  label={
                    isValidatingCoupon ? (
                      <Trans>Validating...</Trans>
                    ) : (
                      <Trans>Redeem a code</Trans>
                    )
                  }
                  key="redeem-code"
                  disabled={disabled || isValidatingCoupon}
                  onClick={onClickRedeemCode}
                  primary
                />
              )}
            </ColumnStackLayout>
          </div>
        </ResponsiveLineStackLayout>
      )}
    </I18n>
  );
};

export default SubscriptionPlan;
