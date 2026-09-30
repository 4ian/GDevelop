// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import {
  type Subscription,
  type SubscriptionPlanPricingSystem,
  type SubscriptionPlanWithPricingSystems,
  type SimplifiedSubscriptionBulletPoint,
  canUpgradeSubscription,
} from '../../Utils/GDevelopServices/Usage';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';
import {
  formatPriceWithCurrency,
  planIdSortingFunction,
} from './PlanSmallCard';

const GOLD_PLAN_ID = 'gdevelop_gold';
const PRO_PLAN_ID = 'gdevelop_startup';

/**
 * The plan to offer to a user who reached the limits of the one they have:
 * Gold for a user without a subscription (or on a lower plan), and the plan
 * above it for a user already on Gold.
 *
 * Returns null when there is nothing to offer: a user already on the highest
 * plan, or one benefiting from an education plan they don't pay for, must not be
 * sold a plan they already have (or a lower one).
 */
export const getSubscriptionPlanToUpsell = ({
  subscription,
  subscriptionPlansWithPricingSystems,
}: {|
  subscription: ?Subscription,
  subscriptionPlansWithPricingSystems: ?Array<SubscriptionPlanWithPricingSystems>,
|}): ?SubscriptionPlanWithPricingSystems => {
  if (
    !subscriptionPlansWithPricingSystems ||
    subscriptionPlansWithPricingSystems.length === 0
  ) {
    return null;
  }
  if (subscription && !canUpgradeSubscription(subscription)) return null;

  const planId = (subscription && subscription.planId) || null;
  // `planIdSortingFunction` orders the legacy plans with the current ones, so
  // the legacy plan giving the same benefits as Gold is also offered the plan
  // above it (rather than the Gold plan it already has).
  const isAlreadyAtLeastGold =
    !!planId && planIdSortingFunction(planId, GOLD_PLAN_ID) >= 0;
  const planIdToUpsell = isAlreadyAtLeastGold ? PRO_PLAN_ID : GOLD_PLAN_ID;

  return (
    subscriptionPlansWithPricingSystems.find(
      plan => plan.id === planIdToUpsell
    ) || null
  );
};

/**
 * Renders text with a minimal markdown-ish syntax: words wrapped in `**...**`
 * are shown in bold, optionally using the given emphasis color.
 */
export const renderTextWithEmphasis = (
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
 * Compute the monthly-equivalent price of a yearly plan (the price shown as
 * "X / month, billed annually").
 */
export const formatMonthlyEquivalentPrice = (
  yearlyPricingSystem: SubscriptionPlanPricingSystem
): string =>
  formatPriceWithCurrency(
    Math.floor(yearlyPricingSystem.amountInCents / 12),
    yearlyPricingSystem.currency
  );

/**
 * How much cheaper a year of the yearly plan is, compared to twelve months of
 * the monthly one, in percent - or null when there is nothing to save.
 */
export const getYearlyDiscountPercentage = (
  monthlyPricingSystem: SubscriptionPlanPricingSystem,
  yearlyPricingSystem: SubscriptionPlanPricingSystem
): number | null => {
  const monthlyTotalForAYear = monthlyPricingSystem.amountInCents * 12;
  if (monthlyTotalForAYear <= 0) return null;
  const discount = Math.round(
    100 - (yearlyPricingSystem.amountInCents / monthlyTotalForAYear) * 100
  );
  if (discount <= 0) return null;
  return discount;
};

export const getYearlyDiscountText = (
  monthlyPricingSystem: SubscriptionPlanPricingSystem,
  yearlyPricingSystem: SubscriptionPlanPricingSystem
): string | null => {
  const discount = getYearlyDiscountPercentage(
    monthlyPricingSystem,
    yearlyPricingSystem
  );
  return discount === null ? null : `-${discount}%`;
};

export type PlanPricingSummary = {|
  // The pricing system a "buy now" action should use.
  pricingSystemToBuy: ?SubscriptionPlanPricingSystem,
  // The price to display, per month (as the yearly plan is featured when it
  // exists, this is its monthly equivalent).
  monthlyPriceText: ?string,
  // The full monthly price, shown struck through next to the yearly one.
  fullMonthlyPriceText: ?string,
  // For example "-30%", when the yearly plan is cheaper than the monthly one.
  discountText: ?string,
  // The same discount, as a number, for wordings like "Save 30%".
  discountPercentage: ?number,
  isBilledAnnually: boolean,
|};

/**
 * Summarizes what to show (and buy) for a plan: we feature the yearly plan when
 * available, as it is the most advantageous one, and display its monthly
 * equivalent price.
 */
export const getPlanPricingSummary = (
  plan: SubscriptionPlanWithPricingSystems
): PlanPricingSummary => {
  const yearlyPricingSystem = plan.pricingSystems.find(
    pricingSystem => pricingSystem.period === 'year'
  );
  const monthlyPricingSystem = plan.pricingSystems.find(
    pricingSystem => pricingSystem.period === 'month'
  );
  const pricingSystemToBuy =
    yearlyPricingSystem || monthlyPricingSystem || plan.pricingSystems[0];

  return {
    pricingSystemToBuy,
    monthlyPriceText: yearlyPricingSystem
      ? formatMonthlyEquivalentPrice(yearlyPricingSystem)
      : pricingSystemToBuy
      ? formatPriceWithCurrency(
          pricingSystemToBuy.amountInCents,
          pricingSystemToBuy.currency
        )
      : null,
    fullMonthlyPriceText:
      yearlyPricingSystem && monthlyPricingSystem
        ? formatPriceWithCurrency(
            monthlyPricingSystem.amountInCents,
            monthlyPricingSystem.currency
          )
        : null,
    discountText:
      yearlyPricingSystem && monthlyPricingSystem
        ? getYearlyDiscountText(monthlyPricingSystem, yearlyPricingSystem)
        : null,
    discountPercentage:
      yearlyPricingSystem && monthlyPricingSystem
        ? getYearlyDiscountPercentage(monthlyPricingSystem, yearlyPricingSystem)
        : null,
    isBilledAnnually: !!yearlyPricingSystem,
  };
};

/**
 * The bullet points to show when upselling a plan in a compact place (a banner
 * rather than the full dialog): only what the plan *unlocks*, at most
 * `maxCount` of them.
 *
 * These come from the backend (and are translated there), so the wording of an
 * upsell can be changed without shipping a new version of the editor.
 */
export const getPlanUpsellBulletPoints = ({
  i18n,
  plan,
  maxCount = 3,
}: {|
  i18n: I18nType,
  plan: SubscriptionPlanWithPricingSystems,
  maxCount?: number,
|}): Array<string> => {
  const { simplifiedFeatures } = plan;
  if (!simplifiedFeatures) return [];
  return simplifiedFeatures.bulletPoints
    .filter((bulletPoint: SimplifiedSubscriptionBulletPoint) =>
      Boolean(bulletPoint.enabled)
    )
    .slice(0, maxCount)
    .map(bulletPoint =>
      selectMessageByLocale(i18n, bulletPoint.messageByLocale)
    );
};

export const getPlanName = (
  i18n: I18nType,
  plan: SubscriptionPlanWithPricingSystems
): string => selectMessageByLocale(i18n, plan.nameByLocale);
