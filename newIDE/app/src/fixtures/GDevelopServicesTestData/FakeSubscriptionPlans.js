// @flow
import {
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlanPricingSystem,
} from '../../Utils/GDevelopServices/Usage';

// Kept minimal on purpose: only what the components upselling a plan read
// (name, simplified features and pricing systems) is filled with realistic
// values, so the stories don't need the real API. The names are the ones the
// backend really serves ('Gold', 'Pro'), not prefixed with 'GDevelop'.

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
  nameByLocale: { en: 'Gold' },
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
  nameByLocale: { en: 'Pro' },
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

// A plan sold monthly only: the upsells must then show the monthly price,
// without the "billed annually" mention nor a saving to advertise.
export const fakePlanWithMonthlyPricingOnly: SubscriptionPlanWithPricingSystems = {
  ...fakeGoldSubscriptionPlanWithPricingSystems,
  pricingSystems: [fakeGoldMonthlyPricingSystem],
};

// A plan whose prices could not be loaded: the upsells must then show no price
// at all rather than a broken one.
export const fakePlanWithoutPricingSystems: SubscriptionPlanWithPricingSystems = {
  ...fakeGoldSubscriptionPlanWithPricingSystems,
  pricingSystems: [],
};

// The plan below Gold, and the one the backend describes as free: they are part
// of the list served to the editor, so the code picking a plan to upsell must
// never end up offering one of them.
export const fakeSilverSubscriptionPlanWithPricingSystems: SubscriptionPlanWithPricingSystems = {
  ...fakeGoldSubscriptionPlanWithPricingSystems,
  id: 'gdevelop_silver',
  nameByLocale: { en: 'Silver' },
  pricingSystems: [
    {
      ...fakeGoldMonthlyPricingSystem,
      id: 'silver_1month_3eur',
      planId: 'gdevelop_silver',
      amountInCents: 299,
    },
  ],
};

export const fakeFreeSubscriptionPlanWithPricingSystems: SubscriptionPlanWithPricingSystems = {
  ...fakeGoldSubscriptionPlanWithPricingSystems,
  id: 'free',
  nameByLocale: { en: 'Free' },
  pricingSystems: [],
};

// The plans the editor is served, in the order the backend sends them.
export const fakeSubscriptionPlansWithPricingSystems: Array<SubscriptionPlanWithPricingSystems> = [
  fakeFreeSubscriptionPlanWithPricingSystems,
  fakeSilverSubscriptionPlanWithPricingSystems,
  fakeGoldSubscriptionPlanWithPricingSystems,
  fakeProSubscriptionPlanWithPricingSystems,
];
