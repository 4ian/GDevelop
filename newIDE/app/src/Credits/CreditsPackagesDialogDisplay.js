// @flow
import {
  type CreditsPackageDialogDisplayConfig,
  type CreditsPackageDialogVariantConfig,
} from '../Utils/GDevelopServices/Usage';

/**
 * Where the credits packages dialog was opened from. Used to pick the wording
 * of the dialog (buying credits to keep using the AI is not the same story as
 * buying credits to publish a game) and to follow conversion per placement.
 */
export type CreditsPackagePlacementId =
  | 'ai-requests'
  | 'asset-store'
  | 'game-featuring'
  | 'profile'
  | 'unknown';

/**
 * The variants of the credits packages dialog:
 * - `standard`: what credits unlock, then the packages.
 * - `ai`: same, but told from the point of view of building with the AI.
 * - `compact`: the packages only, for users who already know what credits are.
 */
export type CreditsPackageDialogVariant = 'standard' | 'ai' | 'compact';

/**
 * The variant type sent by the backend, when it is one we know about. A variant
 * added by a newer backend must not break the dialog, so it is treated as
 * unknown here.
 */
const toKnownVariant = (
  variantType: string
): CreditsPackageDialogVariant | null => {
  switch (variantType) {
    case 'standard':
      return 'standard';
    case 'ai':
      return 'ai';
    case 'compact':
      return 'compact';
    default:
      return null;
  }
};

export type CreditsPackageDialogDisplay = {|
  dialogVariant: CreditsPackageDialogVariant,
|};

/**
 * Picks a variant among the given ones, proportionally to their weights.
 */
const pickWeightedVariant = (
  variants: Array<CreditsPackageDialogVariantConfig>
): ?CreditsPackageDialogVariantConfig => {
  const positiveWeightVariants = variants.filter(variant => variant.weight > 0);
  if (positiveWeightVariants.length === 0) return variants[0] || null;

  const totalWeight = positiveWeightVariants.reduce(
    (sum, variant) => sum + variant.weight,
    0
  );
  let remaining = Math.random() * totalWeight;
  for (const variant of positiveWeightVariants) {
    remaining -= variant.weight;
    if (remaining < 0) return variant;
  }
  return positiveWeightVariants[positiveWeightVariants.length - 1];
};

/**
 * The variant to fall back to when nothing else applies: for the AI placement,
 * the AI wording is the one that matches what the user was doing, so it is the
 * sensible default rather than an experiment.
 */
const getDefaultVariant = (
  placementId: CreditsPackagePlacementId
): CreditsPackageDialogVariant =>
  placementId === 'ai-requests' ? 'ai' : 'standard';

/**
 * Decides, from the backend-provided A/B test configuration, which credits
 * packages dialog variant to show for a given placement.
 *
 * Degrades gracefully: unconfigured placements, unknown variant types or a
 * missing config all fall back to the default variant of the placement, so an
 * older editor (or an anonymous user, whose limits are not fetched) still gets
 * a dialog that makes sense.
 */
export const resolveCreditsPackageDialogDisplay = ({
  placementId,
  displayConfig,
  pickVariant = pickWeightedVariant,
}: {|
  placementId: CreditsPackagePlacementId,
  displayConfig: ?CreditsPackageDialogDisplayConfig,
  pickVariant?: (
    variants: Array<CreditsPackageDialogVariantConfig>
  ) => ?CreditsPackageDialogVariantConfig,
|}): CreditsPackageDialogDisplay => {
  const defaultDisplay = { dialogVariant: getDefaultVariant(placementId) };
  if (!displayConfig || !displayConfig.placements) return defaultDisplay;

  const placementConfig = displayConfig.placements[placementId];
  if (
    !placementConfig ||
    !placementConfig.variants ||
    placementConfig.variants.length === 0
  ) {
    return defaultDisplay;
  }

  const variant = pickVariant(placementConfig.variants);
  if (!variant) return defaultDisplay;

  const knownVariant = toKnownVariant(variant.type);
  if (!knownVariant) return defaultDisplay;

  return { dialogVariant: knownVariant };
};
