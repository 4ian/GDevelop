// @flow
import * as React from 'react';
import {
  type PublicAssetPacks,
  type PrivateAssetPack,
  type PublicAssetPack,
} from '../Utils/GDevelopServices/Asset';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
  type BundleListingData,
  getArchivedBundleListingData,
  getArchivedPrivateGameTemplateListingData,
  getArchivedPrivateAssetPackListingData,
} from '../Utils/GDevelopServices/Shop';
import {
  PrivateAssetPackTile,
  PublicAssetPackTile,
  PrivateGameTemplateTile,
  BundleTile,
} from './ShopTiles';
import { mergeArraysPerGroup } from '../Utils/Array';

/**
 * A simple slug generator that allows to link to asset packs on
 * the app and on the website.
 *
 * The website has a similar implementation (which is at least retro-compatible),
 * so that asset packs can be opened from an URL containing their slug.
 */
const slugify = (incString: string): string => {
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
  return `${slugify(publicAssetPack.name)}-${slugify(publicAssetPack.tag)}`;
};

const getIdFromPrivateProductUserFriendlySlug = (slug: string) =>
  slug.slice(-36);

const findPublicAssetPackWithUserFriendlySlug = (
  publicAssetPacks: PublicAssetPacks,
  userFriendlySlug: string
): PublicAssetPack | null => {
  for (const publicAssetPack of publicAssetPacks.starterPacks) {
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
  const receivedAssetPackId = getIdFromPrivateProductUserFriendlySlug(
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

export const getPrivateAssetPackListingDataFromUserFriendlySlug = ({
  privateAssetPackListingDatas,
  userFriendlySlug,
}: {|
  privateAssetPackListingDatas: Array<PrivateAssetPackListingData>,
  userFriendlySlug: string,
|}): ?PrivateAssetPackListingData => {
  const privateAssetPackId = getIdFromPrivateProductUserFriendlySlug(
    userFriendlySlug
  );
  const privateAssetPackListingData = privateAssetPackListingDatas.find(
    privateAssetPack => privateAssetPackId === privateAssetPack.id
  );
  if (privateAssetPackListingData) return privateAssetPackListingData;

  return null;
};

export const getPrivateGameTemplateListingDataFromUserFriendlySlug = ({
  privateGameTemplateListingDatas,
  userFriendlySlug,
}: {|
  privateGameTemplateListingDatas: Array<PrivateGameTemplateListingData>,
  userFriendlySlug: string,
|}): ?PrivateGameTemplateListingData => {
  const privateGameTemplateId = getIdFromPrivateProductUserFriendlySlug(
    userFriendlySlug
  );
  const privateGameTemplateListingData = privateGameTemplateListingDatas.find(
    privateGameTemplate => privateGameTemplateId === privateGameTemplate.id
  );
  if (privateGameTemplateListingData) return privateGameTemplateListingData;

  return null;
};

export const getBundleListingDataFromUserFriendlySlug = ({
  bundleListingDatas,
  userFriendlySlug,
}: {|
  bundleListingDatas: Array<BundleListingData>,
  userFriendlySlug: string,
|}): ?BundleListingData => {
  const bundleId = getIdFromPrivateProductUserFriendlySlug(userFriendlySlug);
  const bundleListingData = bundleListingDatas.find(
    bundle => bundleId === bundle.id
  );
  if (bundleListingData) return bundleListingData;

  return null;
};

export const getBundleTiles = ({
  allBundleListingDatas,
  displayedBundleListingDatas,
  onBundleSelection,
  receivedBundles,
  openedShopCategory,
  hasAssetFiltersApplied,
  onlyShowAssets,
}: {|
  allBundleListingDatas: ?Array<BundleListingData>,
  displayedBundleListingDatas: ?Array<BundleListingData>,
  onBundleSelection: ?(BundleListingData) => void,
  receivedBundles: ?Array<any>,
  openedShopCategory?: ?string,
  hasAssetFiltersApplied?: boolean,
  onlyShowAssets?: boolean,
|}): Array<React.Node> => {
  if (
    !allBundleListingDatas ||
    !displayedBundleListingDatas ||
    !onBundleSelection ||
    hasAssetFiltersApplied ||
    onlyShowAssets
  )
    return [];

  const bundleTiles: Array<React.Node> = [];
  const ownedBundleTiles: Array<React.Node> = [];

  displayedBundleListingDatas
    .filter(
      bundleListingData =>
        !openedShopCategory ||
        bundleListingData.categories.includes(openedShopCategory)
    )
    .forEach(bundleListingData => {
      const isBundleOwned =
        !!receivedBundles &&
        !!receivedBundles.find(bundle => bundle.id === bundleListingData.id);
      const tile = (
        <BundleTile
          bundleListingData={bundleListingData}
          onSelect={() => {
            onBundleSelection(bundleListingData);
          }}
          owned={isBundleOwned}
          key={bundleListingData.id}
        />
      );
      if (isBundleOwned) {
        ownedBundleTiles.push(tile);
      } else {
        bundleTiles.push(tile);
      }
    });

  // Handle archived bundles that are owned by the user.
  // These are bundles that are not listed in the shop anymore,
  // but that the user has already purchased.
  const archivedOwnedBundleTiles = (receivedBundles || [])
    .filter(
      bundle =>
        !allBundleListingDatas.find(
          bundleListingData => bundleListingData.id === bundle.id
        )
    )
    .map(bundle => {
      const archivedBundleListingData = getArchivedBundleListingData({
        bundle,
      });
      return (
        <BundleTile
          bundleListingData={archivedBundleListingData}
          onSelect={() => {
            onBundleSelection(archivedBundleListingData);
          }}
          owned={true}
          key={bundle.id}
        />
      );
    });

  return [...ownedBundleTiles, ...archivedOwnedBundleTiles, ...bundleTiles];
};

export const getGameTemplateTiles = ({
  allPrivateGameTemplateListingDatas,
  displayedPrivateGameTemplateListingDatas,
  onPrivateGameTemplateSelection,
  receivedGameTemplates,
  openedShopCategory,
  hasAssetFiltersApplied,
  hasAssetPackFiltersApplied,
  onlyShowAssets,
}: {|
  allPrivateGameTemplateListingDatas: ?Array<PrivateGameTemplateListingData>,
  displayedPrivateGameTemplateListingDatas: ?Array<PrivateGameTemplateListingData>,
  onPrivateGameTemplateSelection: ?(PrivateGameTemplateListingData) => void,
  receivedGameTemplates: ?Array<any>,
  openedShopCategory?: ?string,
  hasAssetFiltersApplied?: boolean,
  hasAssetPackFiltersApplied?: boolean,
  onlyShowAssets?: boolean,
|}): Array<React.Node> => {
  if (
    !allPrivateGameTemplateListingDatas ||
    !displayedPrivateGameTemplateListingDatas ||
    !onPrivateGameTemplateSelection ||
    hasAssetFiltersApplied ||
    hasAssetPackFiltersApplied ||
    onlyShowAssets
  )
    return [];

  const gameTemplateTiles: Array<React.Node> = [];
  const ownedGameTemplateTiles: Array<React.Node> = [];

  const filteredGameTemplates = displayedPrivateGameTemplateListingDatas.filter(
    privateGameTemplateListingData =>
      !openedShopCategory || openedShopCategory === 'game-template'
  );

  filteredGameTemplates.forEach(privateGameTemplateListingData => {
    const isGameTemplateOwned =
      !!receivedGameTemplates &&
      !!receivedGameTemplates.find(
        pack => pack.id === privateGameTemplateListingData.id
      );
    const tile = (
      <PrivateGameTemplateTile
        privateGameTemplateListingData={privateGameTemplateListingData}
        onSelect={() => {
          onPrivateGameTemplateSelection(privateGameTemplateListingData);
        }}
        owned={isGameTemplateOwned}
        key={privateGameTemplateListingData.id}
      />
    );

    if (isGameTemplateOwned) {
      ownedGameTemplateTiles.push(tile);
    } else {
      gameTemplateTiles.push(tile);
    }
  });

  // Handle archived game templates that are owned by the user.
  // These are game templates that are not listed in the shop anymore,
  // but that the user has already purchased.
  const archivedOwnedGameTemplateTiles = (receivedGameTemplates || [])
    .filter(
      gameTemplate =>
        !allPrivateGameTemplateListingDatas.find(
          privateGameTemplateListingData =>
            privateGameTemplateListingData.id === gameTemplate.id
        )
    )
    .map(gameTemplate => {
      const archivedGameTemplateListingData = getArchivedPrivateGameTemplateListingData(
        {
          gameTemplate,
        }
      );
      return (
        <PrivateGameTemplateTile
          privateGameTemplateListingData={archivedGameTemplateListingData}
          onSelect={() => {
            onPrivateGameTemplateSelection(archivedGameTemplateListingData);
          }}
          owned={true}
          key={gameTemplate.id}
        />
      );
    });

  return [
    ...ownedGameTemplateTiles,
    ...archivedOwnedGameTemplateTiles,
    ...gameTemplateTiles,
  ];
};

export const getPublicAssetPackTiles = ({
  publicAssetPacks,
  onPublicAssetPackSelection,
  openedShopCategory,
  hasAssetFiltersApplied,
}: {|
  publicAssetPacks: ?(PublicAssetPack[]),
  onPublicAssetPackSelection: ?(PublicAssetPack) => void,
  openedShopCategory?: ?string,
  hasAssetFiltersApplied?: boolean,
|}): Array<React.Node> => {
  if (
    !publicAssetPacks ||
    !onPublicAssetPackSelection ||
    hasAssetFiltersApplied
  )
    return [];

  const filteredAssetPacks = publicAssetPacks.filter(
    assetPack =>
      !openedShopCategory || assetPack.categories.includes(openedShopCategory)
  );

  return filteredAssetPacks.map((assetPack, index) => (
    <PublicAssetPackTile
      assetPack={assetPack}
      onSelect={() => onPublicAssetPackSelection(assetPack)}
      key={`${assetPack.tag}-${index}`}
    />
  ));
};

export const getAssetPackTiles = ({
  allPrivateAssetPackListingDatas,
  displayedPrivateAssetPackListingDatas,
  onPrivateAssetPackSelection,
  publicAssetPackTiles,
  receivedAssetPacks,
  openedShopCategory,
  hasAssetFiltersApplied,
}: {|
  allPrivateAssetPackListingDatas: ?Array<PrivateAssetPackListingData>,
  displayedPrivateAssetPackListingDatas: ?Array<PrivateAssetPackListingData>,
  onPrivateAssetPackSelection: ?(PrivateAssetPackListingData) => void,
  publicAssetPackTiles?: Array<React.Node>,
  receivedAssetPacks: ?Array<any>,
  openedShopCategory?: ?string,
  hasAssetFiltersApplied?: boolean,
|}): {|
  allAssetPackStandAloneTiles: Array<React.Node>,
  allAssetPackBundleTiles: Array<React.Node>,
|} => {
  if (
    !allPrivateAssetPackListingDatas ||
    !displayedPrivateAssetPackListingDatas ||
    hasAssetFiltersApplied
  ) {
    return {
      allAssetPackStandAloneTiles: [],
      allAssetPackBundleTiles: [],
    };
  }

  const privateAssetPackStandAloneTiles: Array<React.Node> = [];
  const privateOwnedAssetPackStandAloneTiles: Array<React.Node> = [];
  const privateAssetPackBundleTiles: Array<React.Node> = [];
  const privateOwnedAssetPackBundleTiles: Array<React.Node> = [];

  const filteredAssetPacks = displayedPrivateAssetPackListingDatas.filter(
    assetPackListingData =>
      !openedShopCategory ||
      assetPackListingData.categories.includes(openedShopCategory)
  );

  !!onPrivateAssetPackSelection &&
    filteredAssetPacks.forEach(assetPackListingData => {
      const isPackOwned =
        !!receivedAssetPacks &&
        !!receivedAssetPacks.find(pack => pack.id === assetPackListingData.id);
      const tile = (
        <PrivateAssetPackTile
          assetPackListingData={assetPackListingData}
          onSelect={() => {
            onPrivateAssetPackSelection(assetPackListingData);
          }}
          owned={isPackOwned}
          key={assetPackListingData.id}
        />
      );
      if (
        assetPackListingData.includedListableProductIds &&
        !!assetPackListingData.includedListableProductIds.length
      ) {
        if (isPackOwned) {
          privateOwnedAssetPackBundleTiles.push(tile);
        } else {
          privateAssetPackBundleTiles.push(tile);
        }
      } else {
        if (isPackOwned) {
          privateOwnedAssetPackStandAloneTiles.push(tile);
        } else {
          privateAssetPackStandAloneTiles.push(tile);
        }
      }
    });

  // Handle archived asset packs that are owned by the user.
  // These are asset packs that are not listed in the shop anymore,
  // but that the user has already purchased.
  const archivedOwnedAssetPackStandAloneTiles: Array<React.Node> = [];
  const archivedOwnedAssetPackBundleTiles: Array<React.Node> = [];
  !!onPrivateAssetPackSelection &&
    (receivedAssetPacks || [])
      .filter(
        assetPack =>
          !allPrivateAssetPackListingDatas.find(
            privateAssetPackListingData =>
              privateAssetPackListingData.id === assetPack.id
          )
      )
      .forEach(assetPack => {
        const archivedAssetPackListingData = getArchivedPrivateAssetPackListingData(
          {
            assetPack,
          }
        );
        const tile = (
          <PrivateAssetPackTile
            assetPackListingData={archivedAssetPackListingData}
            onSelect={() => {
              onPrivateAssetPackSelection(archivedAssetPackListingData);
            }}
            owned={true}
            key={assetPack.id}
          />
        );

        if (
          archivedAssetPackListingData.includedListableProductIds &&
          !!archivedAssetPackListingData.includedListableProductIds.length
        ) {
          archivedOwnedAssetPackBundleTiles.push(tile);
        } else {
          archivedOwnedAssetPackStandAloneTiles.push(tile);
        }
      });

  const allAssetPackBundleTiles = [
    ...privateOwnedAssetPackBundleTiles,
    ...archivedOwnedAssetPackBundleTiles,
    ...privateAssetPackBundleTiles,
  ];

  const allAssetPackStandAloneTiles = [
    ...privateOwnedAssetPackStandAloneTiles,
    ...archivedOwnedAssetPackStandAloneTiles,
    ...mergeArraysPerGroup(
      privateAssetPackStandAloneTiles,
      publicAssetPackTiles || [],
      2,
      1
    ),
  ];

  return { allAssetPackStandAloneTiles, allAssetPackBundleTiles };
};
