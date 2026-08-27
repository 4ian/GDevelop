// @flow
import {
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
} from '../../Utils/GDevelopServices/Usage';

// Kept minimal on purpose: only what the components upselling a plan read
// (name, simplified features and pricing systems) is filled with realistic
// values, so the stories don't need the real API.

export const fakeGoldMonthlyPricingSystem: SubscriptionPlanPricingSystem = {
  id: 'gold_1month_5eur',
  planId: 'gdevelop_gold',
  period: 'month',
  currency: 'EUR',
  region: 'eurozone',
  amountInCents: 599,
  periodCount: 1,
  status: 'active',
};

export const fakeGoldYearlyPricingSystem: SubscriptionPlanPricingSystem = {
  id: 'gold_1year_50eur',
  planId: 'gdevelop_gold',
  period: 'year',
  currency: 'EUR',
  region: 'eurozone',
  amountInCents: 4999,
  periodCount: 1,
  status: 'active',
};

export const fakeGoldSubscriptionPlanWithPricingSystems: SubscriptionPlanWithPricingSystems = {
  id: 'gdevelop_gold',
  isLegacy: false,
  nameByLocale: { en: 'GDevelop Gold' },
  descriptionByLocale: { en: 'For ambitious game creators.' },
  bulletPointsByLocale: [],
  targetAudiences: ['CASUAL'],
  simplifiedFeatures: {
    taglineByLocale: { en: 'Supercharged game creation' },
    upgradeOverlineByLocale: { en: "You've reached your free limit" },
    upgradeTitleByLocale: { en: 'Build anything, publish everywhere' },
    upgradeButtonLabelByLocale: { en: 'Upgrade to Gold' },
    bulletPoints: [
      {
        enabled: true,
        messageByLocale: {
          en:
            'AI assistant — **high intelligence mode** and **higher usage limits**',
        },
      },
      {
        enabled: true,
        messageByLocale: { en: '**1000 credits** every month' },
      },
      {
        enabled: true,
        messageByLocale: { en: 'Publish to **all stores**' },
      },
    ],
  },
  fullFeatures: [],
  pillarNamesPerLocale: {},
  featureNamesByLocale: {},
  pricingSystems: [fakeGoldMonthlyPricingSystem, fakeGoldYearlyPricingSystem],
};

export const fakeProSubscriptionPlanWithPricingSystems: SubscriptionPlanWithPricingSystems = {
  ...fakeGoldSubscriptionPlanWithPricingSystems,
  id: 'gdevelop_startup',
  nameByLocale: { en: 'GDevelop Pro' },
  simplifiedFeatures: {
    bulletPoints: [
      {
        enabled: true,
        messageByLocale: {
          en: 'AI assistant — **the highest usage limits**',
        },
      },
      {
        enabled: true,
        messageByLocale: { en: '**5000 credits** every month' },
      },
    ],
  },
  pricingSystems: [
    {
      ...fakeGoldMonthlyPricingSystem,
      id: 'startup_1month_30eur',
      planId: 'gdevelop_startup',
      amountInCents: 2999,
    },
  ],
};

// A plan the backend didn't describe with simplified features (an older
// backend): the components upselling it must fall back to their own wording.
export const fakePlanWithoutSimplifiedFeatures: SubscriptionPlanWithPricingSystems = {
  ...fakeGoldSubscriptionPlanWithPricingSystems,
  simplifiedFeatures: undefined,
};
