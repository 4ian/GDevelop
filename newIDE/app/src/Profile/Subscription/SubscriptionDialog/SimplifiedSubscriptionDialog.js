// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Dialog from '../../../UI/Dialog';
import AuthenticatedUserContext from '../../AuthenticatedUserContext';
import {
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
} from '../../../Utils/GDevelopServices/Usage';
import Text from '../../../UI/Text';
import { Column, Line, Spacer } from '../../../UI/Grid';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';
import RaisedButton from '../../../UI/RaisedButton';
import FlatButton from '../../../UI/FlatButton';
import LeftLoader from '../../../UI/LeftLoader';
import { formatPriceWithCurrency } from '../PlanSmallCard';
import GoldIcon from '../Icons/Gold';
import Apple from '../../../UI/CustomSvgIcons/Apple';
import GooglePlay from '../../../UI/CustomSvgIcons/GooglePlay';
import Steam from '../../../UI/CustomSvgIcons/Steam';
import { useBuyUpdateOrCancelPlan } from './useBuyUpdateOrCancelPlan';

// The plan featured by this simplified dialog. The benefits below are hardcoded
// to match this plan ("GDevelop Gold").
const FEATURED_PLAN_ID = 'gdevelop_gold';

// Accent colors taken from the design mockup. They are intentionally hardcoded
// (rather than read from the theme) to keep the upsell visuals consistent.
const colors = {
  green: '#1FE0A8',
  goldBorder: 'rgba(255, 194, 75, 0.55)',
  goldText: '#FFD789',
  goldBadgeBackground: '#FFC24B',
  goldBadgeText: '#2A1B00',
  goldColumnBackground: 'rgba(255, 194, 75, 0.08)',
  freeColumnBorder: 'rgba(255, 255, 255, 0.12)',
  freeColumnBackground: 'rgba(255, 255, 255, 0.02)',
  mutedBullet: '#6E6B85',
  gdevelopBadge: 'linear-gradient(135deg, #6C56F0, #8B57F0)',
};

const styles = {
  column: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  freeColumn: {
    border: `1px solid ${colors.freeColumnBorder}`,
    background: colors.freeColumnBackground,
  },
  goldColumn: {
    border: `1.5px solid ${colors.goldBorder}`,
    background: colors.goldColumnBackground,
    position: 'relative',
  },
  goldBadge: {
    position: 'absolute',
    top: -11,
    left: 16,
    background: colors.goldBadgeBackground,
    color: colors.goldBadgeText,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '4px 10px',
    borderRadius: 999,
  },
  bulletLine: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
  check: {
    color: colors.green,
    fontWeight: 'bold',
    lineHeight: '20px',
  },
  mutedBullet: {
    color: colors.mutedBullet,
    lineHeight: '20px',
  },
  greenLabel: {
    color: colors.green,
    fontWeight: 'bold',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  goldLabel: {
    color: colors.goldText,
    fontWeight: 'bold',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  storeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: '5px 9px',
    fontSize: 12,
    fontWeight: 600,
  },
  storeIcon: { width: 14, height: 14 },
  gdevelopBadgeSquare: {
    width: 14,
    height: 14,
    borderRadius: 4,
    background: colors.gdevelopBadge,
    display: 'inline-block',
  },
  priceBar: {
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
  },
  strikethrough: { textDecoration: 'line-through' },
  discountBadge: {
    background: colors.green,
    color: '#08231B',
    fontSize: 12,
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: 6,
  },
};

const Bullet = ({
  enabled,
  children,
}: {|
  enabled: boolean,
  children: React.Node,
|}) => (
  <div style={styles.bulletLine}>
    <span style={enabled ? styles.check : styles.mutedBullet}>
      {enabled ? '✓' : '●'}
    </span>
    <Text noMargin color={enabled ? 'primary' : 'secondary'}>
      {children}
    </Text>
  </div>
);

const StoreBadge = ({
  icon,
  label,
}: {|
  icon: React.Node,
  label: React.Node,
|}) => (
  <span style={styles.storeBadge}>
    {icon}
    <span>{label}</span>
  </span>
);

/**
 * Compute the monthly-equivalent price of a yearly plan (the price shown as
 * "X / month, billed annually").
 */
const formatMonthlyEquivalentPrice = (
  yearlyPricingSystem: SubscriptionPlanPricingSystem
): string =>
  formatPriceWithCurrency(
    Math.floor(yearlyPricingSystem.amountInCents / 12),
    yearlyPricingSystem.currency
  );

const getYearlyDiscountText = (
  monthlyPricingSystem: SubscriptionPlanPricingSystem,
  yearlyPricingSystem: SubscriptionPlanPricingSystem
): string | null => {
  const monthlyTotalForAYear = monthlyPricingSystem.amountInCents * 12;
  if (monthlyTotalForAYear <= 0) return null;
  const discount = Math.round(
    100 - (yearlyPricingSystem.amountInCents / monthlyTotalForAYear) * 100
  );
  if (discount <= 0) return null;
  return `-${discount}%`;
};

type Props = {|
  onClose: Function,
  availableSubscriptionPlansWithPrices: ?(SubscriptionPlanWithPricingSystems[]),
  onOpenPendingDialog: (open: boolean) => void,
  couponCode?: ?string,
|};

export default function SimplifiedSubscriptionDialog({
  onClose,
  availableSubscriptionPlansWithPrices,
  onOpenPendingDialog,
  couponCode,
}: Props): React.Node {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const {
    buyUpdateOrCancelPlan,
    isChangingSubscription,
  } = useBuyUpdateOrCancelPlan({
    onOpenPendingDialog,
    couponCode,
    dialogVariant: 'simplified',
  });

  const featuredPlan = React.useMemo(
    () => {
      if (!availableSubscriptionPlansWithPrices) return null;
      const plansWithPricing = availableSubscriptionPlansWithPrices.filter(
        plan => plan.pricingSystems.length > 0
      );
      return (
        plansWithPricing.find(plan => plan.id === FEATURED_PLAN_ID) ||
        plansWithPricing[0] ||
        null
      );
    },
    [availableSubscriptionPlansWithPrices]
  );

  const isLoading =
    authenticatedUser.loginState === 'loggingIn' || isChangingSubscription;

  const renderContent = (i18n: I18nType) => {
    if (!availableSubscriptionPlansWithPrices || !featuredPlan) {
      return <PlaceholderLoader />;
    }

    const yearlyPricingSystem = featuredPlan.pricingSystems.find(
      pricingSystem => pricingSystem.period === 'year'
    );
    const monthlyPricingSystem = featuredPlan.pricingSystems.find(
      pricingSystem => pricingSystem.period === 'month'
    );

    // We feature the yearly plan (billed annually) when available, as it is the
    // most advantageous one and matches the mockup.
    const pricingSystemToBuy =
      yearlyPricingSystem ||
      monthlyPricingSystem ||
      featuredPlan.pricingSystems[0];

    const mainPriceText =
      yearlyPricingSystem != null
        ? formatMonthlyEquivalentPrice(yearlyPricingSystem)
        : pricingSystemToBuy
        ? formatPriceWithCurrency(
            pricingSystemToBuy.amountInCents,
            pricingSystemToBuy.currency
          )
        : null;

    const discountText =
      yearlyPricingSystem && monthlyPricingSystem
        ? getYearlyDiscountText(monthlyPricingSystem, yearlyPricingSystem)
        : null;

    const onClickUpgrade = () => {
      if (!authenticatedUser.authenticated) {
        authenticatedUser.onOpenCreateAccountDialog();
        return;
      }
      if (pricingSystemToBuy) {
        buyUpdateOrCancelPlan(i18n, pricingSystemToBuy);
      }
    };

    return (
      <ColumnStackLayout noMargin>
        {/* Header */}
        <LineStackLayout noMargin alignItems="center">
          <GoldIcon style={{ width: 40, height: 40 }} />
          <Column noMargin>
            <Text noMargin size="body-small">
              <span style={styles.greenLabel}>
                <Trans>You've reached your free limit</Trans>
              </span>
            </Text>
            <Text noMargin size="bold-title">
              <Trans>Upgrade to GDevelop Gold</Trans>
            </Text>
          </Column>
        </LineStackLayout>

        {/* Comparison columns */}
        <ResponsiveLineStackLayout noMargin noColumnMargin>
          {/* Free column */}
          <div style={{ ...styles.column, ...styles.freeColumn }}>
            <Text noMargin size="body-small" color="secondary">
              <span
                style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                <b>
                  <Trans>Free</Trans>
                </b>
              </span>
            </Text>
            <Spacer />
            <ColumnStackLayout noMargin>
              <Bullet enabled>
                <Trans>Unlimited game creation in the editor</Trans>
              </Bullet>
              <Bullet enabled={false}>
                <Trans>
                  AI assistant — <b>3 prompts</b>
                </Trans>
              </Bullet>
              <Bullet enabled={false}>
                <Trans>
                  Publishing on the <b>GDevelop store</b> only
                </Trans>
              </Bullet>
            </ColumnStackLayout>
          </div>

          {/* Gold column */}
          <div style={{ ...styles.column, ...styles.goldColumn }}>
            <span style={styles.goldBadge}>Gold</span>
            <Text noMargin size="body-small">
              <span style={styles.goldLabel}>
                <Trans>Everything unlocked</Trans>
              </span>
            </Text>
            <Spacer />
            <ColumnStackLayout noMargin>
              <Bullet enabled>
                <Trans>Unlimited game creation in the editor</Trans>
              </Bullet>
              <Bullet enabled>
                <Trans>
                  Extended AI assistant —{' '}
                  <b style={{ color: colors.goldText }}>1,000 prompts</b>
                </Trans>
              </Bullet>
              <Bullet enabled>
                <ColumnStackLayout noMargin>
                  <Text noMargin>
                    <Trans>
                      Publish to{' '}
                      <b style={{ color: colors.goldText }}>all stores</b>
                    </Trans>
                  </Text>
                  <LineStackLayout noMargin>
                    <StoreBadge
                      icon={<Apple style={styles.storeIcon} />}
                      label="iOS"
                    />
                    <StoreBadge
                      icon={<GooglePlay style={styles.storeIcon} />}
                      label="Android"
                    />
                    <StoreBadge
                      icon={<Steam style={styles.storeIcon} />}
                      label="Steam"
                    />
                    <StoreBadge
                      icon={<span style={styles.gdevelopBadgeSquare} />}
                      label="GDevelop"
                    />
                  </LineStackLayout>
                </ColumnStackLayout>
              </Bullet>
            </ColumnStackLayout>
          </div>
        </ResponsiveLineStackLayout>

        {/* Price + CTA bar */}
        <div style={styles.priceBar}>
          <ResponsiveLineStackLayout
            noMargin
            justifyContent="space-between"
            alignItems="center"
          >
            <Line noMargin alignItems="baseline">
              <ColumnStackLayout noMargin>
                <LineStackLayout noMargin alignItems="baseline">
                  {mainPriceText && (
                    <Text noMargin size="bold-title">
                      {mainPriceText}
                    </Text>
                  )}
                  <Text noMargin color="secondary">
                    <Trans>/ month</Trans>
                  </Text>
                  {yearlyPricingSystem && monthlyPricingSystem && (
                    <Text noMargin color="secondary">
                      <span style={styles.strikethrough}>
                        {formatPriceWithCurrency(
                          monthlyPricingSystem.amountInCents,
                          monthlyPricingSystem.currency
                        )}
                      </span>
                    </Text>
                  )}
                  {discountText && (
                    <span style={styles.discountBadge}>{discountText}</span>
                  )}
                </LineStackLayout>
                {yearlyPricingSystem && (
                  <Text noMargin color="secondary" size="body-small">
                    <Trans>Billed annually · cancel anytime</Trans>
                  </Text>
                )}
              </ColumnStackLayout>
            </Line>
            <Column noMargin alignItems="flex-end">
              <RaisedButton
                color="success"
                size="large"
                disabled={isLoading}
                label={
                  <LeftLoader isLoading={isLoading}>
                    <Trans>Upgrade to Gold →</Trans>
                  </LeftLoader>
                }
                onClick={onClickUpgrade}
              />
              <FlatButton
                label={<Trans>Continue for free</Trans>}
                onClick={onClose}
                disabled={isLoading}
              />
            </Column>
          </ResponsiveLineStackLayout>
        </div>
      </ColumnStackLayout>
    );
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={null}
          open
          onRequestClose={onClose}
          maxWidth="md"
          flexColumnBody
        >
          {renderContent(i18n)}
        </Dialog>
      )}
    </I18n>
  );
}
