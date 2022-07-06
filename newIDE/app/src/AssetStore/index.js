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
  sendAssetAddedToProject,
  sendAssetOpened,
  sendAssetPackOpened,
} from '../Utils/Analytics/EventSender';
import RaisedButton from '../UI/RaisedButton';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
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
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { installAsset } from './InstallAsset';
import { useResourceFetcher } from '../ProjectsStorage/ResourceFetcher';
import { showErrorBox } from '../UI/Messages/MessageBox';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { enumerateObjects } from '../ObjectsList/EnumerateObjects';
import { AssetPackDialog } from './AssetPackDialog';
import Home from '@material-ui/icons/Home';

type Props = {
  project: gdProject,
  objectsContainer: gdObjectsContainer,
  events: gdEventsList,
  focusOnMount?: boolean,
  onObjectAddedFromAsset: (object: gdObject) => void,
  layout: ?gdLayout,
  resourceSources: Array<ResourceSource>,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  onChooseResource: ChooseResourceFunction,
};

export const AssetStore = ({
  project,
  objectsContainer,
  events,
  focusOnMount,
  onObjectAddedFromAsset,
  layout,
  resourceSources,
  resourceExternalEditors,
  onChooseResource,
}: Props) => {
  const {
    assetPacks,
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

  React.useEffect(
    () => {
      fetchAssetsAndFilters();
    },
    [fetchAssetsAndFilters]
  );

  const searchBar = React.useRef<?SearchBarInterface>(null);
  const shouldAutofocusSearchbar = useShouldAutofocusSearchbar();
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = React.useState(false);
  const [
    isAssetPackDialogInstallOpen,
    setIsAssetPackDialogInstallOpen,
  ] = React.useState(false);
  const [
    isAssetBeingInstalled,
    setIsAssetBeingInstalled,
  ] = React.useState<boolean>(false);

  const { containerObjectsList } = enumerateObjects(project, objectsContainer);
  const addedAssetIds = containerObjectsList
    .map(({ object }) => object.getAssetStoreId())
    .filter(Boolean);

  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  const resourcesFetcher = useResourceFetcher();

  const onOpenDetails = (assetShortHeader: AssetShortHeader) => {
    sendAssetOpened({
      id: assetShortHeader.id,
      name: assetShortHeader.name,
    });
    navigationState.openDetailPage(assetShortHeader);
  };

  const onInstallAsset = React.useCallback(
    (assetShortHeader: AssetShortHeader) => {
      setIsAssetBeingInstalled(true);
      (async () => {
        try {
          const installOutput = await installAsset({
            assetShortHeader,
            eventsFunctionsExtensionsState,
            project,
            objectsContainer,
            events,
          });
          sendAssetAddedToProject({
            id: assetShortHeader.id,
            name: assetShortHeader.name,
          });
          console.log('Asset successfully installed.');

          installOutput.createdObjects.forEach(object => {
            onObjectAddedFromAsset(object);
          });

          await resourcesFetcher.ensureResourcesAreFetched(project);
        } catch (error) {
          console.error('Error while installing the asset:', error);
          showErrorBox({
            message: `There was an error while installing the asset "${
              assetShortHeader.name
            }". Verify your internet connection or try again later.`,
            rawError: error,
            errorId: 'install-asset-error',
          });
        }

        setIsAssetBeingInstalled(false);
      })();
    },
    [
      resourcesFetcher,
      eventsFunctionsExtensionsState,
      project,
      objectsContainer,
      events,
      onObjectAddedFromAsset,
    ]
  );

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
      if (focusOnMount && shouldAutofocusSearchbar && searchBar.current) {
        searchBar.current.focus();
      }
    },
    [shouldAutofocusSearchbar, focusOnMount]
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
                      {!openedAssetPack && filtersState.chosenCategory && (
                        <>
                          <Column expand alignItems="center">
                            <Text size="block-title" noMargin>
                              {capitalize(
                                filtersState.chosenCategory.node.name
                              )}
                            </Text>
                          </Column>
                          {/* to center the title */}
                          <Column expand alignItems="flex-end" noMargin />
                        </>
                      )}
                      {openedAssetPack && (
                        <>
                          <Column expand alignItems="center">
                            <Text size="block-title" noMargin>
                              {openedAssetPack.name}
                            </Text>
                          </Column>
                          <Column expand alignItems="flex-end" noMargin>
                            <RaisedButton
                              primary
                              label={<Trans>Add all assets to my scene</Trans>}
                              onClick={() =>
                                setIsAssetPackDialogInstallOpen(true)
                              }
                              disabled={
                                !searchResults || searchResults.length === 0
                              }
                            />
                          </Column>
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
                {isOnHomePage && !assetPacks && <PlaceholderLoader />}
                {isOnHomePage && assetPacks && (
                  <AssetsHome
                    assetPacks={assetPacks}
                    onPackSelection={selectPack}
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
                    objectsContainer={objectsContainer}
                    resourceSources={resourceSources}
                    resourceExternalEditors={resourceExternalEditors}
                    onTagSelection={selectTag}
                    assetShortHeader={openedAssetShortHeader}
                    onAdd={() => onInstallAsset(openedAssetShortHeader)}
                    onClose={() => navigationState.backToPreviousPage()}
                    isAddedToScene={addedAssetIds.includes(
                      openedAssetShortHeader.id
                    )}
                    isBeingAddedToScene={isAssetBeingInstalled}
                    onOpenDetails={onOpenDetails}
                  />
                )}
              </Line>
            </Column>
            {resourcesFetcher.renderResourceFetcherDialog()}
            {isAssetPackDialogInstallOpen && searchResults && openedAssetPack && (
              <AssetPackDialog
                assetPack={openedAssetPack}
                assetShortHeaders={searchResults}
                addedAssetIds={addedAssetIds}
                onClose={() => setIsAssetPackDialogInstallOpen(false)}
                onAssetsAdded={() => {
                  setIsAssetPackDialogInstallOpen(false);
                }}
                project={project}
                objectsContainer={objectsContainer}
                events={events}
                onObjectAddedFromAsset={onObjectAddedFromAsset}
              />
            )}
          </>
        )}
      </ResponsiveWindowMeasurer>
    </>
  );
};
