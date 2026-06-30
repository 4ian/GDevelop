// @flow
import { resolveSubscriptionDialogDisplay } from '../SubscriptionContext';
import {
  type SubscriptionDialogDisplayConfig,
  type SubscriptionDialogVariantConfig,
} from '../../../Utils/GDevelopServices/Usage';

const configWithSimplifiedAiRequests: SubscriptionDialogDisplayConfig = {
  placements: {
    'ai-requests': {
      variants: [
        { type: 'simplified', featuredPlanId: 'gdevelop_gold', weight: 90 },
        { type: 'standard', weight: 10 },
      ],
    },
  },
};

// Picks the first variant, to make the (otherwise random) resolution deterministic.
const pickFirstVariant = (
  variants: Array<SubscriptionDialogVariantConfig>
): ?SubscriptionDialogVariantConfig => variants[0] || null;
// Picks the last variant.
const pickLastVariant = (
  variants: Array<SubscriptionDialogVariantConfig>
): ?SubscriptionDialogVariantConfig => variants[variants.length - 1] || null;

describe('resolveSubscriptionDialogDisplay', () => {
  it('falls back to the standard dialog when there is no config', () => {
    expect(
      resolveSubscriptionDialogDisplay({
        placementId: 'ai-requests',
        displayConfig: null,
        userSubscriptionPlanId: null,
      })
    ).toEqual({ dialogVariant: 'standard' });
  });

  it('falls back to the standard dialog for an unconfigured placement', () => {
    expect(
      resolveSubscriptionDialogDisplay({
        placementId: 'builds',
        displayConfig: configWithSimplifiedAiRequests,
        userSubscriptionPlanId: null,
      })
    ).toEqual({ dialogVariant: 'standard' });
  });

  it('shows the simplified dialog with the featured plan for a free user', () => {
    expect(
      resolveSubscriptionDialogDisplay({
        placementId: 'ai-requests',
        displayConfig: configWithSimplifiedAiRequests,
        userSubscriptionPlanId: null,
        pickVariant: pickFirstVariant,
      })
    ).toEqual({ dialogVariant: 'simplified', featuredPlanId: 'gdevelop_gold' });
  });

  it('respects the picked standard variant', () => {
    expect(
      resolveSubscriptionDialogDisplay({
        placementId: 'ai-requests',
        displayConfig: configWithSimplifiedAiRequests,
        userSubscriptionPlanId: null,
        pickVariant: pickLastVariant,
      })
    ).toEqual({ dialogVariant: 'standard' });
  });

  it('does not show the simplified dialog when the user already has the featured plan', () => {
    expect(
      resolveSubscriptionDialogDisplay({
        placementId: 'ai-requests',
        displayConfig: configWithSimplifiedAiRequests,
        userSubscriptionPlanId: 'gdevelop_gold',
        pickVariant: pickFirstVariant,
      })
    ).toEqual({ dialogVariant: 'standard' });
  });

  it('does not show the simplified dialog when the user has a higher plan', () => {
    expect(
      resolveSubscriptionDialogDisplay({
        placementId: 'ai-requests',
        displayConfig: configWithSimplifiedAiRequests,
        userSubscriptionPlanId: 'gdevelop_startup',
        pickVariant: pickFirstVariant,
      })
    ).toEqual({ dialogVariant: 'standard' });
  });

  it('shows the simplified dialog when the user has a lower plan', () => {
    expect(
      resolveSubscriptionDialogDisplay({
        placementId: 'ai-requests',
        displayConfig: configWithSimplifiedAiRequests,
        userSubscriptionPlanId: 'gdevelop_silver',
        pickVariant: pickFirstVariant,
      })
    ).toEqual({ dialogVariant: 'simplified', featuredPlanId: 'gdevelop_gold' });
  });

  it('falls back to the standard dialog for a lower-tier app-store subscription', () => {
    // App-store subscriptions cannot be managed from the web checkout; the
    // standard dialog blocks them, so the simplified dialog must be skipped.
    expect(
      resolveSubscriptionDialogDisplay({
        placementId: 'ai-requests',
        displayConfig: configWithSimplifiedAiRequests,
        userSubscriptionPlanId: 'gdevelop_silver',
        hasMobileAppStoreSubscription: true,
        pickVariant: pickFirstVariant,
      })
    ).toEqual({ dialogVariant: 'standard' });
  });

  it('falls back to the standard dialog for an unknown (future) variant type', () => {
    const configWithUnknownVariant: SubscriptionDialogDisplayConfig = {
      placements: {
        'ai-requests': {
          variants: [{ type: 'super-simplified', weight: 100 }],
        },
      },
    };
    expect(
      resolveSubscriptionDialogDisplay({
        placementId: 'ai-requests',
        displayConfig: configWithUnknownVariant,
        userSubscriptionPlanId: null,
        pickVariant: pickFirstVariant,
      })
    ).toEqual({ dialogVariant: 'standard' });
  });
});
