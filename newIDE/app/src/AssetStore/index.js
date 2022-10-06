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
import {
  type AssetShortHeader,
  type PublicAssetPack,
} from '../Utils/GDevelopServices/Asset';
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
import PrivateAssetPackDialog from './PrivateAssets/PrivateAssetPackDialog';
import PlaceholderError from '../UI/PlaceholderError';
import AlertMessage from '../UI/AlertMessage';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

type Props = {|
  project: gdProject,
|};

export const AssetStore = ({ project }: Props) => {
  const {
    publicAssetPacks,
    privateAssetPacks,
    searchResults,
    error,
    fetchAssetsAndFilters,
    navigationState,
    searchText,
    setSearchText,
    assetFiltersState,
    assetPackRandomOrdering,
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
    selectedPrivateAssetPackListingData,
    setSelectedPrivateAssetPackListingData,
  ] = React.useState<?PrivateAssetPackListingData>(null);
  const { receivedAssetPacks } = React.useContext(AuthenticatedUserContext);

  const onOpenDetails = (assetShortHeader: AssetShortHeader) => {
    sendAssetOpened({
      id: assetShortHeader.id,
      name: assetShortHeader.name,
    });
    navigationState.openDetailPage(assetShortHeader);
  };

  // When a pack is selected from the home page,
  // we set it as the chosen category and open the filters panel.
  const selectPublicAssetPack = (assetPack: PublicAssetPack) => {
    sendAssetPackOpened(assetPack.tag);

    if (assetPack.externalWebLink) {
      Window.openExternalURL(assetPack.externalWebLink);
    } else {
      navigationState.openPackPage(assetPack);
      setIsFiltersPanelOpen(true);
    }
  };

  // When a private pack is selected from the home page,
  // if the user owns it, we set it as the chosen category,
  // otherwise we open the dialog to buy it.
  const selectPrivateAssetPack = (
    assetPackListingData: PrivateAssetPackListingData
  ) => {
    sendAssetPackOpened(assetPackListingData.name);

    const receivedAssetPack = receivedAssetPacks
      ? receivedAssetPacks.find(pack => pack.id === assetPackListingData.id)
      : null;

    if (!receivedAssetPack) {
      // The user has not received the pack, open the dialog to buy it.
      setSelectedPrivateAssetPackListingData(assetPackListingData);
      return;
    }

    // The user has received the pack, open it.
    navigationState.openPackPage(receivedAssetPack);
    setIsFiltersPanelOpen(true);
  };

  // When a tag is selected from the asset details page,
  // first determine if it's a public or private pack,
  // then set it as the chosen category, clear old filters and open the filters panel.
  const selectTag = (tag: string) => {
    const privateAssetPack =
      receivedAssetPacks && receivedAssetPacks.find(pack => pack.tag === tag);
    const publicAssetPack =
      publicAssetPacks &&
      publicAssetPacks.starterPacks.find(pack => pack.tag === tag);
    if (privateAssetPack) {
      navigationState.openPackPage(privateAssetPack);
    } else if (publicAssetPack) {
      navigationState.openPackPage(publicAssetPack);
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

  console.log('openedAssetPack', openedAssetPack);
  console.log('filtersState', filtersState);

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
                              {openedAssetPack
                                ? openedAssetPack.name
                                : filtersState.chosenCategory
                                ? capitalize(
                                    filtersState.chosenCategory.node.name
                                  )
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
                {isOnHomePage &&
                  !(publicAssetPacks && privateAssetPacks) &&
                  !error && <PlaceholderLoader />}
                {isOnHomePage &&
                  publicAssetPacks &&
                  privateAssetPacks &&
                  assetPackRandomOrdering && (
                    <AssetsHome
                      publicAssetPacks={publicAssetPacks}
                      privateAssetPacksListingData={privateAssetPacks}
                      assetPackRandomOrdering={assetPackRandomOrdering}
                      onPublicAssetPackSelection={selectPublicAssetPack}
                      onPrivateAssetPackSelection={selectPrivateAssetPack}
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
                {isOnHomePage && error && (
                  <PlaceholderError onRetry={fetchAssetsAndFilters}>
                    <AlertMessage kind="error">
                      <Trans>
                        An error occurred when fetching the asset store content.
                        Please try again later.
                      </Trans>
                    </AlertMessage>
                  </PlaceholderError>
                )}
                {openedAssetShortHeader && (
                  <AssetDetails
                    project={project}
                    onTagSelection={selectTag}
                    assetShortHeader={openedAssetShortHeader}
                    onOpenDetails={onOpenDetails}
                  />
                )}
                {selectedPrivateAssetPackListingData && (
                  <PrivateAssetPackDialog
                    privateAssetPackListingData={
                      selectedPrivateAssetPackListingData
                    }
                    onClose={() => setSelectedPrivateAssetPackListingData(null)}
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
