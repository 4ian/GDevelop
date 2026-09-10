// @flow
import { resolveCreditsPackageDialogDisplay } from '../CreditsPackagesDialogDisplay';
import {
  type CreditsPackageDialogDisplayConfig,
  type CreditsPackageDialogVariantConfig,
} from '../../Utils/GDevelopServices/Usage';

const config: CreditsPackageDialogDisplayConfig = {
  placements: {
    'ai-requests': {
      variants: [{ type: 'ai', weight: 70 }, { type: 'standard', weight: 30 }],
    },
    'asset-store': {
      variants: [
        { type: 'compact', weight: 50 },
        { type: 'standard', weight: 50 },
      ],
    },
    'game-featuring': {
      variants: [{ type: 'some-variant-added-later', weight: 100 }],
    },
    profile: {
      variants: [],
    },
  },
};

// Picks the first variant, to make the (otherwise random) resolution deterministic.
const pickFirstVariant = (
  variants: Array<CreditsPackageDialogVariantConfig>
): ?CreditsPackageDialogVariantConfig => variants[0] || null;
// Picks the last variant.
const pickLastVariant = (
  variants: Array<CreditsPackageDialogVariantConfig>
): ?CreditsPackageDialogVariantConfig => variants[variants.length - 1] || null;

describe('resolveCreditsPackageDialogDisplay', () => {
  it('falls back to the AI wording for the AI placement when there is no config', () => {
    expect(
      resolveCreditsPackageDialogDisplay({
        placementId: 'ai-requests',
        displayConfig: null,
      })
    ).toEqual({ dialogVariant: 'ai' });
  });

  it('falls back to the standard wording for the other placements when there is no config', () => {
    expect(
      resolveCreditsPackageDialogDisplay({
        placementId: 'asset-store',
        displayConfig: null,
      })
    ).toEqual({ dialogVariant: 'standard' });
    expect(
      resolveCreditsPackageDialogDisplay({
        placementId: 'unknown',
        displayConfig: null,
      })
    ).toEqual({ dialogVariant: 'standard' });
  });

  it('uses the picked variant of a configured placement', () => {
    expect(
      resolveCreditsPackageDialogDisplay({
        placementId: 'ai-requests',
        displayConfig: config,
        pickVariant: pickFirstVariant,
      })
    ).toEqual({ dialogVariant: 'ai' });
    expect(
      resolveCreditsPackageDialogDisplay({
        placementId: 'ai-requests',
        displayConfig: config,
        pickVariant: pickLastVariant,
      })
    ).toEqual({ dialogVariant: 'standard' });
    expect(
      resolveCreditsPackageDialogDisplay({
        placementId: 'asset-store',
        displayConfig: config,
        pickVariant: pickFirstVariant,
      })
    ).toEqual({ dialogVariant: 'compact' });
  });

  it('falls back to the default wording for a variant type added by a newer backend', () => {
    expect(
      resolveCreditsPackageDialogDisplay({
        placementId: 'game-featuring',
        displayConfig: config,
        pickVariant: pickFirstVariant,
      })
    ).toEqual({ dialogVariant: 'standard' });
  });

  it('falls back to the default wording for a placement configured without variants', () => {
    expect(
      resolveCreditsPackageDialogDisplay({
        placementId: 'profile',
        displayConfig: config,
        pickVariant: pickFirstVariant,
      })
    ).toEqual({ dialogVariant: 'standard' });
  });

  it('picks variants proportionally to their weights', () => {
    const counts = { ai: 0, standard: 0, compact: 0 };
    for (let index = 0; index < 3000; index++) {
      const { dialogVariant } = resolveCreditsPackageDialogDisplay({
        placementId: 'ai-requests',
        displayConfig: config,
      });
      counts[dialogVariant]++;
    }
    // 70/30 with a wide margin, so the test can't become flaky.
    expect(counts.ai).toBeGreaterThan(counts.standard);
    expect(counts.standard).toBeGreaterThan(0);
    expect(counts.compact).toBe(0);
  });
});
