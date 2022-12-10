// @flow
import {
  type PublicAssetPacks,
  type PrivateAssetPack,
  type PublicAssetPack,
} from '../Utils/GDevelopServices/Asset';

const slug = (incString: string): string => {
  const p = ['.', '=', '-'];
  const s = '-';

  return incString
    .toLowerCase()
    .replace(/ü/g, 'ue')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ß/g, 'ss')
    .replace(new RegExp('[' + p.join('') + ']', 'g'), ' ') //  replace preserved characters with spaces
    .replace(/-{2,}/g, ' ') //  remove duplicate spaces
    .replace(/^\s\s*/, '')
    .replace(/\s\s*$/, '') //  trim both sides of string
    .replace(/[^\w ]/gi, '') //  replaces all non-alphanumeric with empty string
    .replace(/[ ]/gi, s); //  Convert spaces to dashes
};

const getPublicAssetPackUserFriendlySlug = (
  publicAssetPack: PublicAssetPack
) => {
  return `${slug(publicAssetPack.name)}-${slug(publicAssetPack.tag)}`;
};

const getIdFromPrivateAssetPackUserFriendlySlug = (slug: string) =>
  slug.slice(-36);

const findPublicAssetPackWithUserFriendlySlug = (
  publisAssetPacks: PublicAssetPacks,
  userFriendlySlug: string
): PublicAssetPack | null => {
  for (const publicAssetPack of publisAssetPacks.starterPacks) {
    const publicAssetPackUserFriendlySlug = getPublicAssetPackUserFriendlySlug(
      publicAssetPack
    );
    if (publicAssetPackUserFriendlySlug === userFriendlySlug)
      return publicAssetPack;
  }

  return null;
};

export const getAssetPackFromUserFriendlySlug = ({
  receivedAssetPacks,
  publicAssetPacks,
  userFriendlySlug,
}: {|
  receivedAssetPacks: Array<PrivateAssetPack>,
  publicAssetPacks: PublicAssetPacks,
  userFriendlySlug: string,
|}): PublicAssetPack | PrivateAssetPack | null => {
  const receivedAssetPackId = getIdFromPrivateAssetPackUserFriendlySlug(
    userFriendlySlug
  );
  const receivedAssetPack = receivedAssetPacks.find(
    privateAssetPack => receivedAssetPackId === privateAssetPack.id
  );
  if (receivedAssetPack) return receivedAssetPack;

  const publicAssetPack = findPublicAssetPackWithUserFriendlySlug(
    publicAssetPacks,
    userFriendlySlug
  );
  if (publicAssetPack) return publicAssetPack;

  return null;
};
