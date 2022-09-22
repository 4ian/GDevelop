// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Tune from '@material-ui/icons/Tune';
import SearchBar, { useShouldAutofocusSearchbar } from '../UI/SearchBar';
import DoubleChevronArrowLeft from '../UI/CustomSvgIcons/DoubleChevronArrowLeft';
import { Column, Line, Spacer } from '../UI/Grid';
import Background from '../UI/Background';
import ScrollView from '../UI/ScrollView';
import Window from '../Utils/Window';
import {
  sendAssetOpened,
  sendAssetPackOpened,
} from '../Utils/Analytics/EventSender';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';
import { BoxSearchResults } from '../UI/Search/BoxSearchResults';
import { type SearchBarInterface } from '../UI/SearchBar';
import {
  AssetStoreFilterPanel,
  clearAllFilters,
} from './AssetStoreFilterPanel';
import { AssetStoreContext } from './AssetStoreContext';
import { AssetCard } from './AssetCard';
import { NoResultPlaceholder } from './NoResultPlaceholder';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import Subheader from '../UI/Subheader';
import { AssetsHome } from './AssetsHome';
import TextButton from '../UI/TextButton';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import { AssetDetails } from './AssetDetails';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import Home from '@material-ui/icons/Home';
import PrivateAssetPackDialog from './PrivateAssetPackDialog';

type Props = {|
  project: gdProject,
|};

export const AssetStore = ({ project }: Props) => {
  const {
    assetPacks,
    privateAssetPacks,
    searchResults,
    error,
    fetchAssetsAndFilters,
    navigationState,
    searchText,
    setSearchText,
    assetFiltersState,
  } = React.useContext(AssetStoreContext);
  const {
    isOnHomePage,
    openedAssetPack,
    openedAssetShortHeader,
    filtersState,
  } = navigationState.getCurrentPage();
  const searchBar = React.useRef<?SearchBarInterface>(null);
  const shouldAutofocusSearchbar = useShouldAutofocusSearchbar();
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = React.useState(false);
  const [
    selectedPrivateAssetPack,
    setSelectedPrivateAssetPack,
  ] = React.useState<?PrivateAssetPackListingData>(null);

  const onOpenDetails = (assetShortHeader: AssetShortHeader) => {
    sendAssetOpened({
      id: assetShortHeader.id,
      name: assetShortHeader.name,
    });
    navigationState.openDetailPage(assetShortHeader);
  };

  // When a pack is selected from the home page,
  // we set it as the chosen category and open the filters panel.
  const selectPack = (tag: string) => {
    if (!assetPacks) return;

    sendAssetPackOpened(tag);

    const assetPack = assetPacks.starterPacks.find(pack => pack.tag === tag);
    if (!assetPack) {
      // This can't actually happen.
      return;
    }

    if (assetPack.externalWebLink) {
      Window.openExternalURL(assetPack.externalWebLink);
    } else {
      navigationState.openPackPage(assetPack);
      setIsFiltersPanelOpen(true);
    }
  };

  // When a tag is selected from the asset details page,
  // we set it as the chosen category, clear old filters and open the filters panel.
  const selectTag = (tag: string) => {
    const assetPack =
      assetPacks && assetPacks.starterPacks.find(pack => pack.tag === tag);
    if (assetPack) {
      navigationState.openPackPage(assetPack);
    } else {
      navigationState.openTagPage(tag);
    }
    clearAllFilters(assetFiltersState);
    setIsFiltersPanelOpen(true);
  };

  const capitalize = (str: string) => {
    return str ? str[0].toUpperCase() + str.substr(1) : '';
  };

  React.useEffect(
    () => {
      if (shouldAutofocusSearchbar && searchBar.current) {
        searchBar.current.focus();
      }
    },
    [shouldAutofocusSearchbar]
  );

  return (
    <>
      <ResponsiveWindowMeasurer>
        {windowWidth => (
          <>
            <Column expand noMargin useFullHeight>
              <Line>
                <Spacer />
                <IconButton
                  key="back-discover"
                  tooltip={t`Back to discover`}
                  onClick={() => {
                    navigationState.openHome();
                    clearAllFilters(assetFiltersState);
                    setIsFiltersPanelOpen(false);
                  }}
                  size="small"
                >
                  <Home />
                </IconButton>
                <Column expand useFullHeight>
                  <SearchBar
                    placeholder={t`Search assets`}
                    value={searchText}
                    onChange={setSearchText}
                    onRequestSearch={() => {
                      // Clear the history
                      navigationState.activateTextualSearch();
                      navigationState.clearHistory();
                      setIsFiltersPanelOpen(true);
                    }}
                    ref={searchBar}
                    id="asset-store-search-bar"
                  />
                </Column>
              </Line>
              {!isOnHomePage && <Spacer />}
              <Column>
                <Line
                  justifyContent="space-between"
                  noMargin
                  alignItems="center"
                >
                  {isOnHomePage ? (
                    <Text size="block-title">
                      <Trans>Discover</Trans>
                    </Text>
                  ) : (
                    <>
                      <Column expand alignItems="flex-start" noMargin>
                        <TextButton
                          icon={<ArrowBack />}
                          label={<Trans>Back</Trans>}
                          primary={false}
                          onClick={() => {
                            navigationState.backToPreviousPage();
                            if (navigationState.getCurrentPage().isOnHomePage) {
                              clearAllFilters(assetFiltersState);
                              setIsFiltersPanelOpen(false);
                            }
                          }}
                        />
                      </Column>
                      {(openedAssetPack || filtersState.chosenCategory) && (
                        <>
                          <Column expand alignItems="center">
                            <Text size="block-title" noMargin>
                              {filtersState.chosenCategory
                                ? capitalize(
                                    filtersState.chosenCategory.node.name
                                  )
                                : openedAssetPack
                                ? openedAssetPack.name
                                : ''}
                            </Text>
                          </Column>
                          {/* to center the title */}
                          <Column expand alignItems="flex-end" noMargin />
                        </>
                      )}
                    </>
                  )}
                </Line>
              </Column>
              <Line
                expand
                overflow={
                  'hidden' /* Somehow required on Chrome/Firefox to avoid children growing (but not on Safari) */
                }
              >
                {!openedAssetShortHeader && ( // Don't show filters on asset page.
                  <Background
                    noFullHeight
                    noExpand
                    width={
                      !isFiltersPanelOpen
                        ? 50
                        : windowWidth === 'small'
                        ? 205
                        : 250
                    }
                  >
                    {!isFiltersPanelOpen ? (
                      <Line justifyContent="center">
                        <IconButton onClick={() => setIsFiltersPanelOpen(true)}>
                          <Tune />
                        </IconButton>
                      </Line>
                    ) : (
                      <ScrollView>
                        <Line
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Column>
                            <Line alignItems="center">
                              <Tune />
                              <Subheader>
                                <Trans>Object filters</Trans>
                              </Subheader>
                            </Line>
                          </Column>
                          <IconButton
                            onClick={() => setIsFiltersPanelOpen(false)}
                          >
                            <DoubleChevronArrowLeft />
                          </IconButton>
                        </Line>
                        <Line
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <AssetStoreFilterPanel
                            assetFiltersState={assetFiltersState}
                            onChoiceChange={() => {
                              navigationState.openSearchIfNeeded();
                            }}
                          />
                        </Line>
                      </ScrollView>
                    )}
                  </Background>
                )}
                {isOnHomePage && !(assetPacks && privateAssetPacks) && (
                  <PlaceholderLoader />
                )}
                {isOnHomePage && assetPacks && privateAssetPacks && (
                  <AssetsHome
                    assetPacks={assetPacks}
                    privateAssetPacks={privateAssetPacks}
                    onPackSelection={selectPack}
                    onPrivateAssetPackSelection={setSelectedPrivateAssetPack}
                  />
                )}
                {!isOnHomePage && !openedAssetShortHeader && (
                  <BoxSearchResults
                    baseSize={128}
                    onRetry={fetchAssetsAndFilters}
                    error={error}
                    searchItems={searchResults}
                    renderSearchItem={(assetShortHeader, size) => (
                      <AssetCard
                        size={size}
                        onOpenDetails={() => onOpenDetails(assetShortHeader)}
                        assetShortHeader={assetShortHeader}
                      />
                    )}
                    noResultPlaceholder={
                      <NoResultPlaceholder
                        onClear={() => clearAllFilters(assetFiltersState)}
                      />
                    }
                  />
                )}
                {openedAssetShortHeader && (
                  <AssetDetails
                    project={project}
                    onTagSelection={selectTag}
                    assetShortHeader={openedAssetShortHeader}
                    onOpenDetails={onOpenDetails}
                  />
                )}
                {selectedPrivateAssetPack && (
                  <PrivateAssetPackDialog
                    privateAssetPack={selectedPrivateAssetPack}
                    onClose={() => setSelectedPrivateAssetPack(null)}
                  />
                )}
              </Line>
            </Column>
          </>
        )}
      </ResponsiveWindowMeasurer>
    </>
  );
};
