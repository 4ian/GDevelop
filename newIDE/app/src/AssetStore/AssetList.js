// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { Column } from '../UI/Grid';
import { AssetStoreContext } from './AssetStoreContext';
import { AssetCard } from './AssetCard';
import { BoxSearchResults } from '../UI/Search/BoxSearchResults';
import {
  type AssetShortHeader,
  type PrivateAssetPack,
  isAssetPackAudioOnly,
} from '../Utils/GDevelopServices/Asset';
import AlertMessage from '../UI/AlertMessage';
import { NoResultPlaceholder } from './NoResultPlaceholder';
import { clearAllFilters } from './AssetStoreFilterPanel';

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
  return (
    <BoxSearchResults
      baseSize={128}
      onRetry={fetchAssetsAndFilters}
      error={error}
      searchItems={searchResults}
      spacing={8}
      renderSearchItem={(assetShortHeader, size) => (
        <AssetCard
          id={`asset-card-${assetShortHeader.name.replace(/\s/g, '-')}`}
          size={size}
          onOpenDetails={() => onOpenDetails(assetShortHeader)}
          assetShortHeader={assetShortHeader}
        />
      )}
      noResultPlaceholder={
        openedAssetPack &&
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
        )
      }
    />
  );
};

export default AssetList;
