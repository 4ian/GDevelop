// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Column } from '../UI/Grid';
import { AssetStoreContext } from './AssetStoreContext';
import { AssetCard } from './AssetCard';
import {
  type AssetShortHeader,
  type PrivateAssetPack,
  type PublicAssetPack,
  isAssetPackAudioOnly,
} from '../Utils/GDevelopServices/Asset';
import AlertMessage from '../UI/AlertMessage';
import { NoResultPlaceholder } from './NoResultPlaceholder';
import { clearAllFilters } from './AssetStoreFilterPanel';
import {
  GridList,
  GridListTile,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../UI/Reponsive/ResponsiveWindowMeasurer';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import { shouldValidate } from '../UI/KeyboardShortcuts/InteractionKeys';

const getAssetSize = (windowWidth: WidthType) => {
  switch (windowWidth) {
    case 'small':
      return 80;
    case 'medium':
      return 120;
    case 'large':
    case 'xlarge':
      return 130;
    default:
      return 120;
  }
};

const cellSpacing = 8;
const styles = {
  grid: {
    margin: 0, // Remove the default margin of the grid.
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
};

const useStylesForGridListItem = makeStyles(theme =>
  createStyles({
    root: {
      '&:focus': {
        outline: `2px solid ${theme.palette.primary.main}`,
      },
    },
  })
);

const AssetCardTile = ({
  assetShortHeader,
  onOpenDetails,
  size,
}: {|
  assetShortHeader: AssetShortHeader,
  onOpenDetails: () => void,
  size: number,
|}) => {
  const classesForGridListItem = useStylesForGridListItem();

  return (
    <GridListTile
      classes={classesForGridListItem}
      tabIndex={0}
      onKeyPress={(event: SyntheticKeyboardEvent<HTMLLIElement>): void => {
        if (shouldValidate(event)) {
          onOpenDetails();
        }
      }}
      onClick={onOpenDetails}
      style={{
        margin: cellSpacing / 2,
      }}
    >
      <AssetCard
        id={`asset-card-${assetShortHeader.name.replace(/\s/g, '-')}`}
        onOpenDetails={onOpenDetails}
        assetShortHeader={assetShortHeader}
        size={size}
      />
    </GridListTile>
  );
};

export type AssetsListInterface = {|
  getScrollPosition: () => number,
  scrollToPosition: (y: number) => void,
|};

type Props = {|
  assets: ?Array<AssetShortHeader>,
  privateAssetPacks?: ?Array<PrivateAssetPack>,
  publicAssetPacks?: ?Array<PublicAssetPack>,
  onOpenDetails: (assetShortHeader: AssetShortHeader) => void,
  renderPrivateAssetPackAudioFilesDownloadButton?: (
    assetPack: PrivateAssetPack
  ) => React.Node,
  noResultsPlaceHolder?: React.Node,
  error?: ?Error,
|};

const AssetsList = React.forwardRef<Props, AssetsListInterface>(
  (
    {
      assets,
      onOpenDetails,
      renderPrivateAssetPackAudioFilesDownloadButton,
      noResultsPlaceHolder,
      privateAssetPacks,
      publicAssetPacks,
    }: Props,
    ref
  ) => {
    const {
      error,
      fetchAssetsAndFilters,
      assetFiltersState,
      navigationState,
    } = React.useContext(AssetStoreContext);
    const currentPage = navigationState.getCurrentPage();
    const { openedAssetPack } = currentPage;
    const windowWidth = useResponsiveWindowWidth();
    const scrollView = React.useRef<?ScrollViewInterface>(null);
    React.useImperativeHandle(ref, () => ({
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

    const assetTiles = React.useMemo(
      () =>
        assets
          ? assets
              .map(assetShortHeader => (
                <AssetCardTile
                  assetShortHeader={assetShortHeader}
                  onOpenDetails={() => onOpenDetails(assetShortHeader)}
                  size={getAssetSize(windowWidth)}
                  key={assetShortHeader.id}
                />
              ))
              .splice(0, 200) // Limit the number of displayed assets to avoid performance issues
          : null,
      [assets, onOpenDetails, windowWidth]
    );

    console.log(assetTiles);

    return (
      <ScrollView ref={scrollView} id="asset-store-listing">
        {!assetTiles && !error && <PlaceholderLoader />}
        {!assetTiles && error && (
          <PlaceholderError onRetry={fetchAssetsAndFilters}>
            <Trans>
              Can't load the results. Verify your internet connection or retry
              later.
            </Trans>
          </PlaceholderError>
        )}

        {assetTiles && assetTiles.length ? (
          <GridList style={styles.grid} cellHeight="auto">
            {assetTiles}
          </GridList>
        ) : openedAssetPack &&
          openedAssetPack.content &&
          isAssetPackAudioOnly(openedAssetPack) &&
          renderPrivateAssetPackAudioFilesDownloadButton ? (
          <Column expand justifyContent="center" alignItems="center">
            <AlertMessage
              kind="info"
              renderRightButton={() =>
                renderPrivateAssetPackAudioFilesDownloadButton(openedAssetPack)
              }
            >
              <Trans>
                Download all the sounds of the asset pack in one click and use
                them in your project.
              </Trans>
            </AlertMessage>
          </Column>
        ) : (
          noResultsPlaceHolder || (
            <NoResultPlaceholder
              onClear={() => clearAllFilters(assetFiltersState)}
            />
          )
        )}
      </ScrollView>
    );
  }
);

export default AssetsList;
