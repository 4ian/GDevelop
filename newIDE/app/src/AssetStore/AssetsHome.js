// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import GridList from '@material-ui/core/GridList';
import Text from '../UI/Text';
import type {
  PublicAssetPacks,
  PublicAssetPack,
} from '../Utils/GDevelopServices/Asset';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';
import { Line, Column } from '../UI/Grid';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../UI/Reponsive/ResponsiveWindowMeasurer';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { mergeArraysPerGroup } from '../Utils/Array';
import {
  CategoryTile,
  PrivateAssetPackTile,
  PublicAssetPackTile,
} from './AssetPackTiles';

const cellSpacing = 2;

const getCategoryColumns = (windowWidth: WidthType) => {
  switch (windowWidth) {
    case 'small':
      return 2;
    case 'medium':
      return 3;
    case 'large':
      return 4;
    case 'xlarge':
      return 6;
    default:
      return 3;
  }
};

const getAssetPacksColumns = (windowWidth: WidthType) => {
  switch (windowWidth) {
    case 'small':
      return 1;
    case 'medium':
      return 2;
    case 'large':
      return 3;
    case 'xlarge':
      return 5;
    default:
      return 2;
  }
};

export const assetCategories = {
  'full-game-pack': {
    title: <Trans>Full Game Packs</Trans>,
    imageAlt: 'Full game asset packs category',
    imageSource: 'res/asset-categories/Full_game_pack.jpeg',
  },
  character: {
    title: <Trans>Characters</Trans>,
    imageAlt: 'Characters asset packs category',
    imageSource: 'res/asset-categories/Characters.jpeg',
  },
  props: {
    title: <Trans>Props</Trans>,
    imageAlt: 'Props asset packs category',
    imageSource: 'res/asset-categories/Props.jpeg',
  },
  background: {
    title: <Trans>Backgrounds</Trans>,
    imageAlt: 'Backgrounds asset packs category',
    imageSource: 'res/asset-categories/Backgrounds.jpeg',
  },
  'visual-effect': {
    title: <Trans>Visual Effects</Trans>,
    imageAlt: 'Visual effects asset packs category',
    imageSource: 'res/asset-categories/Visual_Effects.jpeg',
  },
  interface: {
    title: <Trans>UI/Interface</Trans>,
    imageAlt: 'User Interface asset packs category',
    imageSource: 'res/asset-categories/Interface.jpeg',
  },
  prefab: {
    title: <Trans>Prefabs (Ready-to-use Objects)</Trans>,
    imageAlt: 'Prefabs asset packs category',
    imageSource: 'res/asset-categories/Prefabs.jpeg',
  },
  sounds: {
    title: <Trans>Sounds and musics</Trans>,
    imageAlt: 'Sounds and musics asset packs category',
    imageSource: 'res/asset-categories/Sounds.jpeg',
  },
};

const styles = {
  grid: {
    margin: '0 10px',
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
};

export type AssetsHomeInterface = {|
  getScrollPosition: () => number,
  scrollToPosition: (y: number) => void,
|};

type Props = {|
  publicAssetPacks: PublicAssetPacks,
  privateAssetPackListingDatas: Array<PrivateAssetPackListingData>,
  assetPackRandomOrdering: {|
    starterPacks: Array<number>,
    privateAssetPacks: Array<number>,
  |},
  onPublicAssetPackSelection: PublicAssetPack => void,
  onPrivateAssetPackSelection: PrivateAssetPackListingData => void,
  onCategorySelection: string => void,
  openedAssetCategory: string | null,
|};

export const AssetsHome = React.forwardRef<Props, AssetsHomeInterface>(
  (
    {
      publicAssetPacks: { starterPacks },
      privateAssetPackListingDatas,
      assetPackRandomOrdering,
      onPublicAssetPackSelection,
      onPrivateAssetPackSelection,
      onCategorySelection,
      openedAssetCategory,
    }: Props,
    ref
  ) => {
    const windowWidth = useResponsiveWindowWidth();
    const { receivedAssetPacks } = React.useContext(AuthenticatedUserContext);

    const scrollView = React.useRef<?ScrollViewInterface>(null);
    React.useImperativeHandle(ref, () => ({
      /**
       * Return the scroll position.
       */
      getScrollPosition: () => {
        const scrollViewElement = scrollView.current;
        if (!scrollViewElement) return 0;

        return scrollViewElement.getScrollPosition();
      },
      scrollToPosition: (y: number) => {
        const scrollViewElement = scrollView.current;
        if (!scrollViewElement) return;

        scrollViewElement.scrollToPosition(y);
      },
    }));

    const starterPacksTiles: Array<React.Node> = starterPacks
      .filter(
        assetPack =>
          !openedAssetCategory ||
          assetPack.categories.includes(openedAssetCategory)
      )
      .map((pack, index) => ({
        pos: assetPackRandomOrdering.starterPacks[index],
        pack,
      }))
      .sort((a, b) => a.pos - b.pos)
      .map(sortObject => sortObject.pack)
      .map((assetPack, index) => (
        <PublicAssetPackTile
          assetPack={assetPack}
          onSelect={() => onPublicAssetPackSelection(assetPack)}
          key={`${assetPack.tag}-${index}`}
        />
      ));

    const { allStandAloneTiles, allBundleTiles } = React.useMemo(
      () => {
        const privateAssetPackStandAloneTiles: Array<React.Node> = [];
        const privateOwnedAssetPackStandAloneTiles: Array<React.Node> = [];
        const privateAssetPackBundleTiles: Array<React.Node> = [];
        const privateOwnedAssetPackBundleTiles: Array<React.Node> = [];

        privateAssetPackListingDatas
          .filter(
            assetPackListingData =>
              !openedAssetCategory ||
              assetPackListingData.categories.includes(openedAssetCategory)
          )
          .map((listingData, index) => ({
            pos: assetPackRandomOrdering.privateAssetPacks[index],
            listingData,
          }))
          .sort((a, b) => a.pos - b.pos)
          .map(sortObject => sortObject.listingData)
          .filter(Boolean)
          .forEach(assetPackListingData => {
            const isPackOwned =
              !!receivedAssetPacks &&
              !!receivedAssetPacks.find(
                pack => pack.id === assetPackListingData.id
              );
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

        const allBundleTiles = [
          ...privateOwnedAssetPackBundleTiles, // Display owned bundles first.
          ...privateAssetPackBundleTiles,
        ];

        const allStandAloneTiles = [
          ...privateOwnedAssetPackStandAloneTiles, // Display owned packs first.
          ...mergeArraysPerGroup(
            privateAssetPackStandAloneTiles,
            starterPacksTiles,
            2,
            1
          ),
        ];

        return { allStandAloneTiles, allBundleTiles };
      },
      [
        privateAssetPackListingDatas,
        openedAssetCategory,
        assetPackRandomOrdering,
        onPrivateAssetPackSelection,
        starterPacksTiles,
        receivedAssetPacks,
      ]
    );

    const categoryTiles = React.useMemo(
      () =>
        Object.entries(assetCategories).map(
          // $FlowExpectedError - Object.entries does not infer well the type of the value.
          ([id, { title, imageSource, imageAlt }]) => (
            <CategoryTile
              id={`asset-pack-category-${id.replace(/\s/g, '-')}`}
              key={id}
              imageSource={imageSource}
              imageAlt={imageAlt}
              title={title}
              onSelect={() => {
                onCategorySelection(id);
              }}
            />
          )
        ),
      [onCategorySelection]
    );

    const openedAssetCategoryTitle = openedAssetCategory
      ? assetCategories[openedAssetCategory].title
      : null;

    return (
      <ScrollView
        ref={scrollView}
        id="asset-store-home"
        data={{ isFiltered: !!openedAssetCategory ? 'true' : 'false' }}
      >
        {openedAssetCategory ? null : (
          <>
            <Column>
              <Line>
                <Text size="block-title">
                  <Trans>Explore by category</Trans>
                </Text>
              </Line>
            </Column>
            <GridList
              cols={getCategoryColumns(windowWidth)}
              style={styles.grid}
              cellHeight="auto"
              spacing={cellSpacing}
            >
              {categoryTiles}
            </GridList>
          </>
        )}
        {allBundleTiles.length ? (
          <>
            <Column>
              <Line>
                <Text size="block-title">
                  <Trans>Bundles</Trans>
                </Text>
              </Line>
            </Column>
            <GridList
              cols={getAssetPacksColumns(windowWidth)}
              style={styles.grid}
              cellHeight="auto"
              spacing={cellSpacing}
            >
              {allBundleTiles}
            </GridList>
          </>
        ) : null}
        <Column>
          <Line>
            <Text size="block-title">
              {openedAssetCategoryTitle ? (
                openedAssetCategoryTitle
              ) : (
                <Trans>All asset packs</Trans>
              )}
            </Text>
          </Line>
        </Column>
        <GridList
          cols={getAssetPacksColumns(windowWidth)}
          style={styles.grid}
          cellHeight="auto"
          spacing={cellSpacing}
        >
          {allStandAloneTiles}
        </GridList>
      </ScrollView>
    );
  }
);
