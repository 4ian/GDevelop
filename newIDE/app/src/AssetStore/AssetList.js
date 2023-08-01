// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Column } from '../UI/Grid';
import { AssetStoreContext } from './AssetStoreContext';
import { AssetCard } from './AssetCard';
import {
  type AssetShortHeader,
  type PrivateAssetPack,
  isAssetPackAudioOnly,
} from '../Utils/GDevelopServices/Asset';
import AlertMessage from '../UI/AlertMessage';
import { NoResultPlaceholder } from './NoResultPlaceholder';
import { clearAllFilters } from './AssetStoreFilterPanel';
import { GridList } from '@material-ui/core';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from '../UI/Reponsive/ResponsiveWindowMeasurer';
import ScrollView, { type ScrollViewInterface } from '../UI/ScrollView';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';

const getAssetsColumns = (windowWidth: WidthType) => {
  switch (windowWidth) {
    case 'small':
      return 2;
    case 'medium':
      return 3;
    case 'large':
      return 5;
    case 'xlarge':
      return 8;
    default:
      return 2;
  }
};

const cellSpacing = 2;
const styles = {
  grid: {
    margin: '0 10px',
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
};

type Props = {|
  onOpenDetails: (assetShortHeader: AssetShortHeader) => void,
  renderPrivateAssetPackAudioFilesDownloadButton: (
    assetPack: PrivateAssetPack
  ) => React.Node,
|};

const AssetList = ({
  onOpenDetails,
  renderPrivateAssetPackAudioFilesDownloadButton,
}: Props) => {
  const {
    searchResults,
    error,
    fetchAssetsAndFilters,
    assetFiltersState,
    navigationState,
  } = React.useContext(AssetStoreContext);
  const currentPage = navigationState.getCurrentPage();
  const { openedAssetPack } = currentPage;
  const windowWidth = useResponsiveWindowWidth();
  const scrollView = React.useRef<?ScrollViewInterface>(null);

  const assetTiles = React.useMemo(
    () =>
      searchResults
        ? searchResults.map(assetShortHeader => (
            <AssetCard
              id={`asset-card-${assetShortHeader.name.replace(/\s/g, '-')}`}
              onOpenDetails={() => onOpenDetails(assetShortHeader)}
              assetShortHeader={assetShortHeader}
              size={64}
              key={assetShortHeader.id}
            />
          ))
        : null,
    [searchResults, onOpenDetails]
  );

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
        <GridList
          cols={getAssetsColumns(windowWidth)}
          style={styles.grid}
          cellHeight="auto"
          spacing={cellSpacing}
        >
          {assetTiles}
        </GridList>
      ) : openedAssetPack &&
        openedAssetPack.content &&
        isAssetPackAudioOnly(openedAssetPack) ? (
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
        <NoResultPlaceholder
          onClear={() => clearAllFilters(assetFiltersState)}
        />
      )}
    </ScrollView>
  );
};

export default AssetList;
