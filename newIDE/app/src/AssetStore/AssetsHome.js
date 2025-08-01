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
  type BundleListingData,
} from '../Utils/GDevelopServices/Shop';
import { Line, Column } from '../UI/Grid';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../UI/Responsive/ResponsiveWindowMeasurer';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { CategoryTile } from './ShopTiles';
import { useDebounce } from '../Utils/UseDebounce';
import PromotionsSlideshow from '../Promotions/PromotionsSlideshow';
import { ColumnStackLayout } from '../UI/Layout';
import { EarnCredits } from '../GameDashboard/Wallet/EarnCredits';
import { LARGE_WIDGET_SIZE } from '../MainFrame/EditorContainers/HomePage/CardWidget';
import {
  getBundleTiles,
  getGameTemplateTiles,
  getAssetPackTiles,
  getPublicAssetPackTiles,
} from './AssetStoreUtils';

const cellSpacing = 10;

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
      return 5;
    case 'xlarge':
      return 7;
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
      return isLandscape ? 3 : 2;
    case 'medium':
      return 3;
    case 'large':
      return 4;
    case 'xlarge':
      return 6;
    default:
      return 2;
  }
};

export const gameTemplatesCategoryId = 'game-template';

export const shopCategories = {
  [gameTemplatesCategoryId]: {
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

const MAX_COLUMNS = getShopItemsColumns('xlarge', true);
const MAX_SECTION_WIDTH = (LARGE_WIDGET_SIZE + 2 * 5) * MAX_COLUMNS; // widget size + 5 padding per side
const styles = {
  grid: {
    // Avoid tiles taking too much space on large screens.
    maxWidth: MAX_SECTION_WIDTH,
    width: `calc(100% + ${cellSpacing}px)`, // This is needed to compensate for the `margin: -5px` added by MUI related to spacing.
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
  bundleListingDatas: Array<BundleListingData>,
  onPublicAssetPackSelection: PublicAssetPack => void,
  onPrivateAssetPackSelection: PrivateAssetPackListingData => void,
  onPrivateGameTemplateSelection: PrivateGameTemplateListingData => void,
  onBundleSelection: BundleListingData => void,
  onCategorySelection: string => void,
  openedShopCategory: string | null,
  onlyShowAssets?: boolean,
  displayPromotions?: boolean,
  onOpenProfile?: () => void,
|};

export const AssetsHome = React.forwardRef<Props, AssetsHomeInterface>(
  (
    {
      publicAssetPacks: { starterPacks },
      privateAssetPackListingDatas,
      privateGameTemplateListingDatas,
      bundleListingDatas,
      onPublicAssetPackSelection,
      onPrivateAssetPackSelection,
      onPrivateGameTemplateSelection,
      onBundleSelection,
      onCategorySelection,
      openedShopCategory,
      onlyShowAssets,
      displayPromotions,
      onOpenProfile,
    }: Props,
    ref
  ) => {
    const { windowSize, isLandscape } = useResponsiveWindowSize();
    const {
      receivedAssetPacks,
      receivedGameTemplates,
      receivedBundles,
      badges,
      achievements,
    } = React.useContext(AuthenticatedUserContext);

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
            onlyShowAssets && id === 'game-template' ? null : (
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
      [onCategorySelection, onlyShowAssets]
    );

    const openedShopCategoryTitle = openedShopCategory
      ? shopCategories[openedShopCategory].title
      : null;

    const publicPackTiles: Array<React.Node> = React.useMemo(
      () =>
        getPublicAssetPackTiles({
          publicAssetPacks: starterPacks,
          onPublicAssetPackSelection,
          openedShopCategory,
        }),
      [starterPacks, onPublicAssetPackSelection, openedShopCategory]
    );

    const {
      allAssetPackStandAloneTiles,
      allAssetPackBundleTiles,
    } = React.useMemo(
      () =>
        getAssetPackTiles({
          allPrivateAssetPackListingDatas: privateAssetPackListingDatas,
          displayedPrivateAssetPackListingDatas: privateAssetPackListingDatas,
          onPrivateAssetPackSelection,
          publicAssetPackTiles: publicPackTiles,
          receivedAssetPacks,
          openedShopCategory,
        }),
      [
        privateAssetPackListingDatas,
        openedShopCategory,
        onPrivateAssetPackSelection,
        publicPackTiles,
        receivedAssetPacks,
      ]
    );

    const allBundleTiles = React.useMemo(
      () =>
        getBundleTiles({
          allBundleListingDatas: bundleListingDatas,
          displayedBundleListingDatas: bundleListingDatas,
          onBundleSelection,
          receivedBundles,
          openedShopCategory,
        }),
      [
        bundleListingDatas,
        openedShopCategory,
        onBundleSelection,
        receivedBundles,
      ]
    );

    const gameTemplateTiles = React.useMemo(
      () =>
        getGameTemplateTiles({
          allPrivateGameTemplateListingDatas: privateGameTemplateListingDatas,
          displayedPrivateGameTemplateListingDatas: privateGameTemplateListingDatas,
          onPrivateGameTemplateSelection,
          receivedGameTemplates,
          openedShopCategory,
        }),
      [
        privateGameTemplateListingDatas,
        openedShopCategory,
        onPrivateGameTemplateSelection,
        receivedGameTemplates,
      ]
    );

    const {
      displayedList: displayedAssetPackStandAloneTiles,
      onShowMore: onShowMoreStandAloneTiles,
    } = useProgressiveReveal({
      list: allAssetPackStandAloneTiles,
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
            <Column noMargin>
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
        {displayPromotions && !openedShopCategory ? (
          <ColumnStackLayout noMargin>
            <Text size="block-title">
              <Trans>Promotions + Earn credits</Trans>
            </Text>

            <PromotionsSlideshow />
            {onOpenProfile && (
              <EarnCredits
                achievements={achievements}
                badges={badges}
                onOpenProfile={onOpenProfile}
              />
            )}
          </ColumnStackLayout>
        ) : null}
        {allBundleTiles.length && !onlyShowAssets ? (
          <>
            <Column noMargin>
              <Line>
                <Text size="block-title">
                  <Trans>GDevelop Bundles</Trans>
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
        {allAssetPackBundleTiles.length ? (
          <>
            <Column noMargin>
              <Line>
                <Text size="block-title">
                  <Trans>Asset pack bundles</Trans>
                </Text>
              </Line>
            </Column>
            <GridList
              cols={getShopItemsColumns(windowSize, isLandscape)}
              style={styles.grid}
              cellHeight="auto"
              spacing={cellSpacing}
            >
              {allAssetPackBundleTiles}
            </GridList>
          </>
        ) : null}
        {openedShopCategoryTitle && (
          <Column noMargin>
            <Line>
              <Text size="block-title">{openedShopCategoryTitle}</Text>
            </Line>
          </Column>
        )}
        {!onlyShowAssets && (
          <>
            {!openedShopCategoryTitle && (
              <Column noMargin>
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
          <Column noMargin>
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
          {displayedAssetPackStandAloneTiles}
        </GridList>
      </ScrollView>
    );
  }
);
