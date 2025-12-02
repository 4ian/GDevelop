// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import {
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
} from '../../../Utils/GDevelopServices/Usage';
import RedemptionCodeIcon from '../../../UI/CustomSvgIcons/RedemptionCode';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import { Trans } from '@lingui/macro';
import FlatButton from '../../../UI/FlatButton';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import SubscriptionPlanTableSummary from './SubscriptionPlanTableSummary';
import SubscriptionPlanPricingSummary from './SubscriptionPlanPricingSummary';
import SecureCheckout from '../../../AssetStore/SecureCheckout/SecureCheckout';

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
};

const PromotionSubscriptionPlan = ({
  subscriptionPlanWithPricingSystems,
  disabled,
  onClickRedeemCode,
  onClickChoosePlan,
  seatsCount,
  setSeatsCount,
}: {|
  subscriptionPlanWithPricingSystems: SubscriptionPlanWithPricingSystems,
  disabled?: boolean,
  onClickRedeemCode: () => void,
  onClickChoosePlan: (
    pricingSystem: SubscriptionPlanPricingSystem
  ) => Promise<void>,
  seatsCount: number,
  setSeatsCount: (seatsCount: number) => void,
|}) => {
  const { windowSize } = useResponsiveWindowSize();
  const isLargeScreen = windowSize === 'large' || windowSize === 'xlarge';
  const [period, setPeriod] = React.useState<'year' | 'month'>('year');

  return (
    <I18n>
      {({ i18n }) => (
        <ResponsiveLineStackLayout expand noColumnMargin>
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
            <ColumnStackLayout expand noMargin>
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
              />
              <SecureCheckout includeCancelInformation />
              <FlatButton
                leftIcon={<RedemptionCodeIcon />}
                label={<Trans>Redeem a code</Trans>}
                key="redeem-code"
                disabled={disabled}
                onClick={onClickRedeemCode}
                primary
              />
            </ColumnStackLayout>
          </div>
        </ResponsiveLineStackLayout>
      )}
    </I18n>
  );
};

export default PromotionSubscriptionPlan;
