// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Dialog from '../../../UI/Dialog';
import AuthenticatedUserContext from '../../AuthenticatedUserContext';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import {
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
  type SimplifiedSubscriptionFeatures,
} from '../../../Utils/GDevelopServices/Usage';
import { selectMessageByLocale } from '../../../Utils/i18n/MessageByLocale';
import Text from '../../../UI/Text';
import { Column, Line, Spacer } from '../../../UI/Grid';
import CheckCircleFilled from '../../../UI/CustomSvgIcons/CheckCircleFilled';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import PlaceholderLoader from '../../../UI/PlaceholderLoader';
import RaisedButton from '../../../UI/RaisedButton';
import LeftLoader from '../../../UI/LeftLoader';
import { formatPriceWithCurrency } from '../PlanSmallCard';
import GoldIcon from '../Icons/Gold';
import Apple from '../../../UI/CustomSvgIcons/Apple';
import GooglePlay from '../../../UI/CustomSvgIcons/GooglePlay';
import Steam from '../../../UI/CustomSvgIcons/Steam';
import { useBuyUpdateOrCancelPlan } from './useBuyUpdateOrCancelPlan';

// Plan featured by this dialog when the backend does not specify one.
const DEFAULT_FEATURED_PLAN_ID = 'gdevelop_gold';
const FREE_PLAN_ID = 'free';

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
    textTransform: 'uppercase',
    padding: '3px 10px',
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
    lineHeight: '15px',
    paddingTop: 2,
  },
  mutedBullet: {
    color: colors.mutedBullet,
    lineHeight: '20px',
    paddingLeft: 3,
    width: 12,
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
    padding: '3px 9px',
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
  topPart: {
    paddingTop: 24,
    paddingLeft: 24,
    paddingRight: 24,
  },
  priceBar: {
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 24,
  },
  strikethrough: { textDecoration: 'line-through', opacity: 0.8 },
  discountBadge: {
    background: colors.green,
    color: '#08231B',
    fontSize: 12,
    padding: '2px 8px',
    borderRadius: 6,
  },
  continueForFree: {
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    font: 'inherit',
    color: 'inherit',
    padding: '2px 4px',
    borderRadius: 4,
    borderBottom: '1px dotted rgba(255, 255, 255, 0.5)',
  },
  continueForFreeDisabled: {
    cursor: 'default',
    opacity: 0.5,
  },
  continueForFreeHovered: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.9)',
  },
  continueForFreeFocused: {
    outline: `2px solid ${colors.green}`,
    outlineOffset: 2,
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
      {enabled ? <CheckCircleFilled fontSize="small" /> : '●'}
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
|}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const isLightTheme = gdevelopTheme.palette.type === 'light';
  return (
    <span
      style={{
        ...styles.storeBadge,
        // The faint white chip is invisible on light themes, so use a dark tint.
        background: isLightTheme
          ? 'rgba(0, 0, 0, 0.08)'
          : 'rgba(255, 255, 255, 0.08)',
      }}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};

// Maps a store badge id (sent by the backend) to its icon and (brand) label.
// Unknown ids are ignored so the dialog degrades gracefully.
const storeBadgesById: {
  [string]: {| icon: React.Node, label: string |},
} = {
  apple: { icon: <Apple style={styles.storeIcon} />, label: 'iOS' },
  'google-play': {
    icon: <GooglePlay style={styles.storeIcon} />,
    label: 'Android',
  },
  steam: { icon: <Steam style={styles.storeIcon} />, label: 'Steam' },
  'gd-games': {
    icon: <span style={styles.gdevelopBadgeSquare} />,
    label: 'gd.games',
  },
};

const renderStoreBadges = (storeBadges: Array<string>): React.Node => {
  const knownBadges = storeBadges
    .map(badgeId => storeBadgesById[badgeId])
    .filter(Boolean);
  if (knownBadges.length === 0) return null;
  return (
    <LineStackLayout noMargin>
      {knownBadges.map((badge, index) => (
        <StoreBadge key={index} icon={badge.icon} label={badge.label} />
      ))}
    </LineStackLayout>
  );
};

/**
 * Renders text with a minimal markdown-ish syntax: words wrapped in `**...**`
 * are shown in bold, optionally using the given emphasis color.
 */
const renderTextWithEmphasis = (
  text: string,
  emphasisColor?: string
): React.Node => {
  // Splitting on the capturing group yields normal text at even indices and the
  // bold content at odd indices.
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <b
        key={index}
        style={emphasisColor ? { color: emphasisColor } : undefined}
      >
        {part}
      </b>
    ) : (
      part
    )
  );
};

/**
 * Renders the bullet points (and optional store badges) of a plan's simplified
 * features, served and translated by the backend.
 */
const SimplifiedBulletPoints = ({
  i18n,
  simplifiedFeatures,
  emphasisColor,
}: {|
  i18n: I18nType,
  simplifiedFeatures: SimplifiedSubscriptionFeatures,
  emphasisColor?: string,
|}) => (
  <ColumnStackLayout noMargin>
    {simplifiedFeatures.bulletPoints.map((bulletPoint, index) => {
      const { storeBadges } = bulletPoint;
      const message = renderTextWithEmphasis(
        selectMessageByLocale(i18n, bulletPoint.messageByLocale),
        emphasisColor
      );
      return (
        <Bullet key={index} enabled={bulletPoint.enabled}>
          {storeBadges && storeBadges.length > 0 ? (
            <ColumnStackLayout noMargin>
              <Text noMargin>{message}</Text>
              {renderStoreBadges(storeBadges)}
            </ColumnStackLayout>
          ) : (
            message
          )}
        </Bullet>
      );
    })}
  </ColumnStackLayout>
);

// Subtle "Not for now" dismiss action. Rendered as a real button so it is
// keyboard-focusable and operable, with visible hover and focus states.
const ContinueForFreeButton = ({
  disabled,
  onClick,
}: {|
  disabled: boolean,
  onClick: () => void,
|}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const stateStyle = disabled
    ? styles.continueForFreeDisabled
    : isHovered && isFocused
    ? { ...styles.continueForFreeHovered, ...styles.continueForFreeFocused }
    : isFocused
    ? styles.continueForFreeFocused
    : isHovered
    ? styles.continueForFreeHovered
    : null;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{ ...styles.continueForFree, ...stateStyle }}
    >
      <Text noMargin color="secondary" size="body-small">
        <Trans>Not for now</Trans>
        {' ›'}
      </Text>
    </button>
  );
};

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
  featuredPlanId?: ?string,
  onOpenPendingDialog: (open: boolean) => void,
  couponCode?: ?string,
|};

export default function SimplifiedSubscriptionDialog({
  onClose,
  availableSubscriptionPlansWithPrices,
  featuredPlanId,
  onOpenPendingDialog,
  couponCode,
}: Props): React.Node {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const isLightTheme = gdevelopTheme.palette.type === 'light';
  // The white-based accents (gold text, borders) are invisible/unreadable on
  // light themes, so use dark-tinted equivalents there.
  const goldTextColor = isLightTheme ? '#8C6500' : colors.goldText;
  const freeColumnBorderColor = isLightTheme
    ? 'rgba(0, 0, 0, 0.12)'
    : colors.freeColumnBorder;
  const separatorColor = isLightTheme
    ? 'rgba(0, 0, 0, 0.08)'
    : 'rgba(255, 255, 255, 0.08)';

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
        (featuredPlanId &&
          plansWithPricing.find(plan => plan.id === featuredPlanId)) ||
        plansWithPricing.find(plan => plan.id === DEFAULT_FEATURED_PLAN_ID) ||
        plansWithPricing[0] ||
        null
      );
    },
    [availableSubscriptionPlansWithPrices, featuredPlanId]
  );

  const freePlan = React.useMemo(
    () =>
      (availableSubscriptionPlansWithPrices &&
        availableSubscriptionPlansWithPrices.find(
          plan => plan.id === FREE_PLAN_ID
        )) ||
      null,
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
    // most advantageous one.
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

    const featuredPlanName = selectMessageByLocale(
      i18n,
      featuredPlan.nameByLocale
    );
    const freeSimplifiedFeatures = freePlan
      ? freePlan.simplifiedFeatures
      : null;
    const featuredSimplifiedFeatures = featuredPlan.simplifiedFeatures;
    const freeColumnTitle =
      freeSimplifiedFeatures && freeSimplifiedFeatures.titleByLocale
        ? selectMessageByLocale(i18n, freeSimplifiedFeatures.titleByLocale)
        : null;
    const featuredColumnTagline =
      featuredSimplifiedFeatures && featuredSimplifiedFeatures.taglineByLocale
        ? selectMessageByLocale(
            i18n,
            featuredSimplifiedFeatures.taglineByLocale
          )
        : null;
    const upgradeOverline =
      featuredSimplifiedFeatures &&
      featuredSimplifiedFeatures.upgradeOverlineByLocale
        ? selectMessageByLocale(
            i18n,
            featuredSimplifiedFeatures.upgradeOverlineByLocale
          )
        : null;
    const upgradeTitle =
      featuredSimplifiedFeatures &&
      featuredSimplifiedFeatures.upgradeTitleByLocale
        ? selectMessageByLocale(
            i18n,
            featuredSimplifiedFeatures.upgradeTitleByLocale
          )
        : null;
    const upgradeButtonLabel =
      featuredSimplifiedFeatures &&
      featuredSimplifiedFeatures.upgradeButtonLabelByLocale
        ? selectMessageByLocale(
            i18n,
            featuredSimplifiedFeatures.upgradeButtonLabelByLocale
          )
        : null;

    return (
      <ColumnStackLayout noMargin>
        <div style={styles.topPart}>
          <ColumnStackLayout noMargin>
            {/* Header */}
            <LineStackLayout noMargin alignItems="center">
              <GoldIcon style={{ width: 40, height: 40 }} />
              <Column noMargin>
                <Text noMargin size="body-small">
                  <span style={styles.greenLabel}>
                    {upgradeOverline || (
                      <Trans>You've reached your free limit</Trans>
                    )}
                  </span>
                </Text>
                <Text noMargin size="section-title">
                  {upgradeTitle || <Trans>Upgrade to {featuredPlanName}</Trans>}
                </Text>
              </Column>
            </LineStackLayout>
            <Spacer />

            {/* Comparison columns */}
            <ResponsiveLineStackLayout noMargin noColumnMargin>
              {/* Free column */}
              <div
                style={{
                  ...styles.column,
                  ...styles.freeColumn,
                  border: `1px solid ${freeColumnBorderColor}`,
                }}
              >
                {freeColumnTitle && (
                  <Text noMargin size="body-small" color="secondary">
                    <span
                      style={{
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}
                    >
                      <b>{freeColumnTitle}</b>
                    </span>
                  </Text>
                )}
                <Spacer />
                {freeSimplifiedFeatures && (
                  <SimplifiedBulletPoints
                    i18n={i18n}
                    simplifiedFeatures={freeSimplifiedFeatures}
                  />
                )}
              </div>

              {/* Featured plan column */}
              <div style={{ ...styles.column, ...styles.goldColumn }}>
                <span style={styles.goldBadge}>
                  <Text
                    noMargin
                    color="inherit"
                    size="body-small"
                    style={{ fontWeight: 'bold' }}
                  >
                    {featuredPlanName}
                  </Text>
                </span>
                {featuredColumnTagline && (
                  <Text noMargin size="body-small">
                    <span style={{ ...styles.goldLabel, color: goldTextColor }}>
                      {featuredColumnTagline}
                    </span>
                  </Text>
                )}
                <Spacer />
                {featuredSimplifiedFeatures && (
                  <SimplifiedBulletPoints
                    i18n={i18n}
                    simplifiedFeatures={featuredSimplifiedFeatures}
                    emphasisColor={goldTextColor}
                  />
                )}
              </div>
            </ResponsiveLineStackLayout>
          </ColumnStackLayout>
        </div>

        <Spacer />

        {/* Price + CTA bar */}
        <div
          style={{
            ...styles.priceBar,
            borderTop: `1px solid ${separatorColor}`,
          }}
        >
          <ResponsiveLineStackLayout
            noMargin
            justifyContent="space-between"
            alignItems="center"
          >
            <Line noMargin alignItems="baseline">
              <ColumnStackLayout noMargin>
                <LineStackLayout noMargin alignItems="baseline">
                  {mainPriceText && (
                    <Text noMargin size="title">
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
                    <span style={styles.discountBadge}>
                      <Text
                        color="inherit"
                        noMargin
                        style={{ fontWeight: 'bold' }}
                        size="body-small"
                      >
                        {discountText}
                      </Text>
                    </span>
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
                color="premium"
                size="large"
                disabled={isLoading}
                label={
                  <LeftLoader isLoading={isLoading}>
                    {upgradeButtonLabel ? (
                      `${upgradeButtonLabel} →`
                    ) : (
                      <Trans>Upgrade to {featuredPlanName} →</Trans>
                    )}
                  </LeftLoader>
                }
                onClick={onClickUpgrade}
              />
              <Spacer />
              <ContinueForFreeButton disabled={isLoading} onClick={onClose} />
            </Column>
          </ResponsiveLineStackLayout>
        </div>
      </ColumnStackLayout>
    );
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog title={null} open maxWidth="md" flexColumnBody noPadding>
          {renderContent(i18n)}
        </Dialog>
      )}
    </I18n>
  );
}
