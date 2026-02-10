// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import {
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
  type PricingSystemDiscount,
} from '../../../Utils/GDevelopServices/Usage';
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

const SubscriptionPlan = ({
  subscriptionPlanWithPricingSystems,
  disabled,
  onClickRedeemCode,
  onClickChoosePlan,
  seatsCount,
  setSeatsCount,
  couponCode,
  pricingSystemDiscounts,
  couponErrorMessage,
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
  couponErrorMessage: ?string,
  isValidatingCoupon: boolean,
  onClearCoupon: () => void,
|}) => {
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
                        {pricingSystemDiscount.discountMessage}
                      </Text>
                    </div>
                  ) : (
                    <Text color="error">
                      -{' '}
                      {couponErrorMessage || (
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
