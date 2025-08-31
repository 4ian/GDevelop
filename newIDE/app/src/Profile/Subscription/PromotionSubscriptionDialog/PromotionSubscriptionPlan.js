// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import Text from '../../../UI/Text';
import {
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
} from '../../../Utils/GDevelopServices/Usage';
import RedemptionCodeIcon from '../../../UI/CustomSvgIcons/RedemptionCode';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import { Trans } from '@lingui/macro';
import FlatButton from '../../../UI/FlatButton';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import ShieldChecked from '../../../UI/CustomSvgIcons/ShieldChecked';
import ThumbsUp from '../../../UI/CustomSvgIcons/ThumbsUp';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import SubscriptionPlanTableSummary from './SubscriptionPlanTableSummary';
import SubscriptionPlanPricingSummary from './SubscriptionPlanPricingSummary';

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
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
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
              <LineStackLayout justifyContent="center" alignItems="center">
                <ShieldChecked style={{ color: gdevelopTheme.message.valid }} />
                <Text color="secondary">
                  <Trans>Paypal secure</Trans>
                </Text>
                <ShieldChecked style={{ color: gdevelopTheme.message.valid }} />
                <Text color="secondary">
                  <Trans>Stripe secure</Trans>
                </Text>
                <ThumbsUp
                  style={{
                    color: gdevelopTheme.message.valid,
                    width: 20,
                    height: 20,
                  }}
                />
                <Text color="secondary">
                  <Trans>Cancel anytime</Trans>
                </Text>
              </LineStackLayout>
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
