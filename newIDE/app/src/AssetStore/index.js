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
import PrivateAssetPackInformationDialog from './PrivateAssets/PrivateAssetPackInformationDialog';
import PlaceholderError from '../UI/PlaceholderError';
import AlertMessage from '../UI/AlertMessage';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import PrivateAssetPackPurchaseDialog from './PrivateAssets/PrivateAssetPackPurchaseDialog';

type Props = {|
  project: gdProject,
|};

export const AssetStore = ({ project }: Props) => {
  const {
    publicAssetPacks,
    privateAssetPacks,
    loadedReceivedAssetPackInStore,
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
  const [
    purchasingPrivateAssetPackListingData,
    setPurchasingPrivateAssetPackListingData,
  ] = React.useState<?PrivateAssetPackListingData>(null);
  const { onPurchaseSuccessful } = React.useContext(AuthenticatedUserContext);

  const onOpenDetails = React.useCallback(
    (assetShortHeader: AssetShortHeader) => {
      sendAssetOpened({
        id: assetShortHeader.id,
        name: assetShortHeader.name,
      });
      navigationState.openDetailPage(assetShortHeader);
    },
    [navigationState]
  );

  // When a pack is selected from the home page,
  // we set it as the chosen category and open the filters panel.
  const selectPublicAssetPack = React.useCallback(
    (assetPack: PublicAssetPack) => {
      sendAssetPackOpened(assetPack.tag);

      if (assetPack.externalWebLink) {
        Window.openExternalURL(assetPack.externalWebLink);
      } else {
        navigationState.openPackPage(assetPack);
        setIsFiltersPanelOpen(true);
      }
    },
    [navigationState]
  );

  // When a private pack is selected from the home page,
  // if the user owns it, we set it as the chosen category,
  // otherwise we open the dialog to buy it.
  const selectPrivateAssetPack = React.useCallback(
    (assetPackListingData: PrivateAssetPackListingData) => {
      sendAssetPackOpened(assetPackListingData.name);

      const receivedAssetPack = loadedReceivedAssetPackInStore
        ? loadedReceivedAssetPackInStore.find(
            pack => pack.id === assetPackListingData.id
          )
        : null;

      if (!receivedAssetPack) {
        // The user has not received the pack, open the dialog to buy it.
        setSelectedPrivateAssetPackListingData(assetPackListingData);
        return;
      }

      // The user has received the pack, open it.
      navigationState.openPackPage(receivedAssetPack);
      setIsFiltersPanelOpen(true);
    },
    [navigationState, loadedReceivedAssetPackInStore]
  );

  // If the user has received the pack they are currently viewing,
  // we update the window to show it if they are not already on the pack page.
  React.useEffect(
    () => {
      if (!purchasingPrivateAssetPackListingData) return;
      // Ensure the user is not already on the pack page, to trigger the effect only once.
      const currentPage = navigationState.getCurrentPage();
      const isOnPrivatePackPage =
        currentPage.openedAssetPack &&
        currentPage.openedAssetPack.id &&
        currentPage.openedAssetPack.id ===
          purchasingPrivateAssetPackListingData.id;
      if (loadedReceivedAssetPackInStore && !isOnPrivatePackPage) {
        const receivedAssetPack = loadedReceivedAssetPackInStore.find(
          pack => pack.id === purchasingPrivateAssetPackListingData.id
        );
        if (receivedAssetPack) {
          // The user has received the pack, close the pack information dialog, and open the pack in the search.
          setIsFiltersPanelOpen(true);
          navigationState.openPackPage(receivedAssetPack);
          setSelectedPrivateAssetPackListingData(null);
        }
      }
    },
    [
      loadedReceivedAssetPackInStore,
      purchasingPrivateAssetPackListingData,
      navigationState,
    ]
  );

  // When a tag is selected from the asset details page,
  // first determine if it's a public or private pack,
  // then set it as the chosen category, clear old filters and open the filters panel.
  const selectTag = React.useCallback(
    (tag: string) => {
      const privateAssetPack =
        loadedReceivedAssetPackInStore &&
        loadedReceivedAssetPackInStore.find(pack => pack.tag === tag);
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
    },
    [
      publicAssetPacks,
      loadedReceivedAssetPackInStore,
      navigationState,
      assetFiltersState,
    ]
  );

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
            <Column expand noMargin useFullHeight id="asset-store">
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
                {!!selectedPrivateAssetPackListingData && (
                  <PrivateAssetPackInformationDialog
                    privateAssetPackListingData={
                      selectedPrivateAssetPackListingData
                    }
                    onClose={() => {
                      setSelectedPrivateAssetPackListingData(null);
                    }}
                    onOpenPurchaseDialog={() =>
                      setPurchasingPrivateAssetPackListingData(
                        selectedPrivateAssetPackListingData
                      )
                    }
                    isPurchaseDialogOpen={
                      !!purchasingPrivateAssetPackListingData
                    }
                  />
                )}
                {!!purchasingPrivateAssetPackListingData && (
                  <PrivateAssetPackPurchaseDialog
                    privateAssetPackListingData={
                      purchasingPrivateAssetPackListingData
                    }
                    onClose={() =>
                      setPurchasingPrivateAssetPackListingData(null)
                    }
                    onSuccessfulPurchase={onPurchaseSuccessful}
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
