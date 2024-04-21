// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import GridList from '@material-ui/core/GridList';
import Text from '../UI/Text';
import type {
  PublicAssetPacks,
  PublicAssetPack,
} from '../Utils/GDevelopServices/Asset';
import {
  type PrivateAssetPackListingData,
  type PrivateGameTemplateListingData,
} from '../Utils/GDevelopServices/Shop';
import { Line, Column } from '../UI/Grid';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../UI/Responsive/ResponsiveWindowMeasurer';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { mergeArraysPerGroup } from '../Utils/Array';
import {
  CategoryTile,
  PrivateAssetPackTile,
  PublicAssetPackTile,
  PrivateGameTemplateTile,
} from './ShopTiles';
import { useDebounce } from '../Utils/UseDebounce';
import PromotionsSlideshow from '../Promotions/PromotionsSlideshow';
import { ColumnStackLayout } from '../UI/Layout';

const cellSpacing = 2;

const getCategoryColumns = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 4 : 2;
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

const getShopItemsColumns = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 3 : 1;
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

export const shopCategories = {
  'game-template': {
    title: <Trans>Ready-made games</Trans>,
    imageAlt: 'Premium game templates category',
    imageSource: 'res/shop-categories/Game_Templates.jpeg',
  },
  'full-game-pack': {
    title: <Trans>Full Game Asset Packs</Trans>,
    imageAlt: 'Full game asset packs category',
    imageSource: 'res/shop-categories/Full_game_pack.jpeg',
  },
  character: {
    title: <Trans>Characters</Trans>,
    imageAlt: 'Characters asset packs category',
    imageSource: 'res/shop-categories/Characters.jpeg',
  },
  props: {
    title: <Trans>Props</Trans>,
    imageAlt: 'Props asset packs category',
    imageSource: 'res/shop-categories/Props.jpeg',
  },
  background: {
    title: <Trans>Backgrounds</Trans>,
    imageAlt: 'Backgrounds asset packs category',
    imageSource: 'res/shop-categories/Backgrounds.jpeg',
  },
  'visual-effect': {
    title: <Trans>Visual Effects</Trans>,
    imageAlt: 'Visual effects asset packs category',
    imageSource: 'res/shop-categories/Visual_Effects.jpeg',
  },
  interface: {
    title: <Trans>UI/Interface</Trans>,
    imageAlt: 'User Interface asset packs category',
    imageSource: 'res/shop-categories/Interface.jpeg',
  },
  prefab: {
    title: <Trans>Prefabs (Ready-to-use Objects)</Trans>,
    imageAlt: 'Prefabs asset packs category',
    imageSource: 'res/shop-categories/Prefabs.jpeg',
  },
  sounds: {
    title: <Trans>Sounds and musics</Trans>,
    imageAlt: 'Sounds and musics asset packs category',
    imageSource: 'res/shop-categories/Sounds.jpeg',
  },
};

const styles = {
  grid: {
    margin: '0 10px',
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
};

const useProgressiveReveal = <T>({
  list,
  numberPerPage,
}: {|
  list: Array<T>,
  numberPerPage: number,
|}): {|
  displayedList: Array<T>,
  onShowMore: () => void,
|} => {
  const [pageCount, setPageCount] = React.useState(1);
  const onShowMore = useDebounce(() => {
    setPageCount(pageCount + 1);
  }, 20);

  return {
    displayedList: list.slice(0, pageCount * numberPerPage),
    onShowMore,
  };
};

export type AssetsHomeInterface = {|
  getScrollPosition: () => number,
  scrollToPosition: (y: number) => void,
|};

type Props = {|
  publicAssetPacks: PublicAssetPacks,
  privateAssetPackListingDatas: Array<PrivateAssetPackListingData>,
  privateGameTemplateListingDatas: Array<PrivateGameTemplateListingData>,
  onPublicAssetPackSelection: PublicAssetPack => void,
  onPrivateAssetPackSelection: PrivateAssetPackListingData => void,
  onPrivateGameTemplateSelection: PrivateGameTemplateListingData => void,
  onCategorySelection: string => void,
  openedShopCategory: string | null,
  hideGameTemplates?: boolean,
  displayPromotions?: boolean,
|};

export const AssetsHome = React.forwardRef<Props, AssetsHomeInterface>(
  (
    {
      publicAssetPacks: { starterPacks },
      privateAssetPackListingDatas,
      privateGameTemplateListingDatas,
      onPublicAssetPackSelection,
      onPrivateAssetPackSelection,
      onPrivateGameTemplateSelection,
      onCategorySelection,
      openedShopCategory,
      hideGameTemplates,
      displayPromotions,
    }: Props,
    ref
  ) => {
    const { windowSize, isLandscape } = useResponsiveWindowSize();
    const { receivedAssetPacks, receivedGameTemplates } = React.useContext(
      AuthenticatedUserContext
    );

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

    const categoryTiles = React.useMemo(
      () =>
        Object.entries(shopCategories).map(
          // $FlowExpectedError - Object.entries does not infer well the type of the value.
          ([id, { title, imageSource, imageAlt }]) =>
            hideGameTemplates && id === 'game-template' ? null : (
              <CategoryTile
                // This id would be more appropriate if it was shop-category-...
                // but it is kept as is to avoid breaking some guided lessons using this
                // id to add prefabs for instance.
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
      [onCategorySelection, hideGameTemplates]
    );

    const openedShopCategoryTitle = openedShopCategory
      ? shopCategories[openedShopCategory].title
      : null;

    const starterPacksTiles: Array<React.Node> = starterPacks
      .filter(
        assetPack =>
          !openedShopCategory ||
          assetPack.categories.includes(openedShopCategory)
      )
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
              !openedShopCategory ||
              assetPackListingData.categories.includes(openedShopCategory)
          )
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
        openedShopCategory,
        onPrivateAssetPackSelection,
        starterPacksTiles,
        receivedAssetPacks,
      ]
    );

    const gameTemplateTiles = React.useMemo(
      () => {
        // Only show game templates if the category is not set or is set to "game-template".
        return privateGameTemplateListingDatas
          .filter(
            privateGameTemplateListingData =>
              !openedShopCategory || openedShopCategory === 'game-template'
          )
          .map((privateGameTemplateListingData, index) => (
            <PrivateGameTemplateTile
              privateGameTemplateListingData={privateGameTemplateListingData}
              onSelect={() => {
                onPrivateGameTemplateSelection(privateGameTemplateListingData);
              }}
              owned={
                !!receivedGameTemplates &&
                !!receivedGameTemplates.find(
                  pack => pack.id === privateGameTemplateListingData.id
                )
              }
              key={privateGameTemplateListingData.id}
            />
          ));
      },
      [
        privateGameTemplateListingDatas,
        openedShopCategory,
        onPrivateGameTemplateSelection,
        receivedGameTemplates,
      ]
    );

    const {
      displayedList: displayedStandAloneTiles,
      onShowMore: onShowMoreStandAloneTiles,
    } = useProgressiveReveal({
      list: allStandAloneTiles,
      numberPerPage: 25,
    });

    return (
      <ScrollView
        ref={scrollView}
        id="asset-store-home"
        data={{ isFiltered: !!openedShopCategory ? 'true' : 'false' }}
        onScroll={({ remainingScreensToBottom }) => {
          if (remainingScreensToBottom <= 1.5) {
            onShowMoreStandAloneTiles();
          }
        }}
      >
        {openedShopCategory ? null : (
          <>
            <Column>
              <Line>
                <Text size="block-title">
                  <Trans>Explore by category</Trans>
                </Text>
              </Line>
            </Column>
            <GridList
              cols={getCategoryColumns(windowSize, isLandscape)}
              style={styles.grid}
              cellHeight="auto"
              spacing={cellSpacing}
            >
              {categoryTiles}
            </GridList>
          </>
        )}
        {displayPromotions ? (
          <ColumnStackLayout>
            <Text size="block-title">
              <Trans>Promotions</Trans>
            </Text>

            <PromotionsSlideshow />
          </ColumnStackLayout>
        ) : null}
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
              cols={getShopItemsColumns(windowSize, isLandscape)}
              style={styles.grid}
              cellHeight="auto"
              spacing={cellSpacing}
            >
              {allBundleTiles}
            </GridList>
          </>
        ) : null}
        {openedShopCategoryTitle && (
          <Column>
            <Line>
              <Text size="block-title">{openedShopCategoryTitle}</Text>
            </Line>
          </Column>
        )}
        {!hideGameTemplates && (
          <>
            {!openedShopCategoryTitle && (
              <Column>
                <Line>
                  <Text size="block-title">
                    <Trans>All game templates</Trans>
                  </Text>
                </Line>
              </Column>
            )}
            <GridList
              cols={getShopItemsColumns(windowSize, isLandscape)}
              style={styles.grid}
              cellHeight="auto"
              spacing={cellSpacing}
            >
              {gameTemplateTiles}
            </GridList>
          </>
        )}
        {!openedShopCategoryTitle && (
          <Column>
            <Line>
              <Text size="block-title">
                <Trans>All asset packs</Trans>
              </Text>
            </Line>
          </Column>
        )}
        <GridList
          cols={getShopItemsColumns(windowSize, isLandscape)}
          style={styles.grid}
          cellHeight="auto"
          spacing={cellSpacing}
        >
          {displayedStandAloneTiles}
        </GridList>
      </ScrollView>
    );
  }
);
