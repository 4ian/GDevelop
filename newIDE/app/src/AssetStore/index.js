// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Tune from '@material-ui/icons/Tune';
import SearchBar, { useShouldAutofocusSearchbar } from '../UI/SearchBar';
import DoubleChevronArrow from '../UI/CustomSvgIcons/DoubleChevronArrow';
import { Column, Line, Spacer } from '../UI/Grid';
import Background from '../UI/Background';
import ScrollView from '../UI/ScrollView';
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
import {
  type AssetShortHeader,
  type AssetPack,
} from '../Utils/GDevelopServices/Asset';
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
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import { AssetDetails } from './AssetDetails';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { installAsset } from './InstallAsset';
import { useResourceFetcher } from '../ProjectsStorage/ResourceFetcher';
import { showErrorBox } from '../UI/Messages/MessageBox';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import Dialog from '../UI/Dialog';
import { LinearProgress } from '@material-ui/core';
import { enumerateObjects } from '../ObjectsList/EnumerateObjects';

const styles = {
  searchBar: {
    // TODO: Can we put this in the search bar by default?
    flexShrink: 0,
  },
  linearProgress: {
    flex: 1,
  },
};

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
    filtersState,
    assetFiltersState,
    searchText,
    setSearchText,
  } = React.useContext(AssetStoreContext);

  React.useEffect(
    () => {
      fetchAssetsAndFilters();
    },
    [fetchAssetsAndFilters]
  );

  const searchBar = React.useRef<?SearchBarInterface>(null);
  const shouldAutofocusSearchbar = useShouldAutofocusSearchbar();
  const [
    openedAssetShortHeader,
    setOpenedAssetShortHeader,
  ] = React.useState<?AssetShortHeader>(null);
  const [openedAssetPack, setOpenedAssetPack] = React.useState<?AssetPack>(
    null
  );
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = React.useState(false);
  const [isOnHomePage, setIsOnHomePage] = React.useState(true);
  const [
    isAssetPackDialogInstallOpen,
    setIsAssetPackDialogInstallOpen,
  ] = React.useState(false);
  const [isAssetPackAdded, setIsAssetPackAdded] = React.useState(false);

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

  const onInstallAssetPack = React.useCallback(
    () => {
      if (!searchResults || !searchResults.length) return;
      setIsAssetBeingInstalled(true);
      Promise.all(
        searchResults.map(assetShortHeader =>
          installAsset({
            assetShortHeader,
            eventsFunctionsExtensionsState,
            project,
            objectsContainer,
            events,
          })
        )
      )
        .then(installOutputs => {
          console.log('Asset pack successfully installed.');
          setIsAssetBeingInstalled(false);
          setIsAssetPackAdded(true);

          setIsAssetPackDialogInstallOpen(false);

          installOutputs.forEach(installOutput => {
            installOutput.createdObjects.forEach(object => {
              onObjectAddedFromAsset(object);
            });
          });

          return resourcesFetcher.ensureResourcesAreFetched(project);
        })
        .catch(error => {
          console.error('Error while installing the asset pack', error);
          setIsAssetBeingInstalled(false);
          showErrorBox({
            message:
              'There was an error while installing the asset pack. Verify your internet connection or try again later.',
            rawError: error,
            errorId: 'install-asset-pack-error',
          });
        });
    },
    [
      resourcesFetcher,
      eventsFunctionsExtensionsState,
      project,
      objectsContainer,
      events,
      onObjectAddedFromAsset,
      searchResults,
    ]
  );

  const resetToDefault = () => {
    setSearchText('');
    filtersState.setChosenCategory(null);
    setOpenedAssetPack(null);
    setIsAssetPackAdded(false);
    setOpenedAssetShortHeader(null);
    clearAllFilters(assetFiltersState);
    setIsFiltersPanelOpen(false);
    setIsOnHomePage(true);
  };

  // When a pack is selected from the home page,
  // we set it as the chosen category and open the filters panel.
  const selectPack = (tag: string) => {
    if (!assetPacks) return;

    sendAssetPackOpened(tag);

    const chosenCategory = {
      node: { name: tag, allChildrenTags: [], children: [] },
      parentNodes: [],
    };
    filtersState.setChosenCategory(chosenCategory);

    const assetPack = assetPacks.starterPacks.find(pack => pack.tag === tag);
    setOpenedAssetPack(assetPack);

    setIsOnHomePage(false);
    setIsFiltersPanelOpen(true);
  };

  // When a tag is selected from the asset details page,
  // we set it as the chosen category, clear old filters and open the filters panel.
  const selectTag = (tag: string) => {
    const chosenCategory = {
      node: { name: tag, allChildrenTags: [], children: [] },
      parentNodes: [],
    };
    filtersState.setChosenCategory(chosenCategory);

    clearAllFilters(assetFiltersState);
    setOpenedAssetPack(null);
    setOpenedAssetShortHeader(null);
    setIsFiltersPanelOpen(true);
  };

  // When something is entered in the search bar
  // we need to ensure we leave the homepage and deselect any pack.
  const onSearchChange = () => {
    if (isOnHomePage) setIsOnHomePage(false);
    if (openedAssetPack) setOpenedAssetPack(null);
  };

  // When the back button is pressed, if we were on the asset details page,
  // we just go back to the search,
  // if we were on the search, we reset everything to go back to the homepage.
  const goBack = () => {
    if (openedAssetShortHeader) {
      // Going back from Asset page to search.
      setOpenedAssetShortHeader(null);
    } else {
      // Going back from search to home.
      resetToDefault();
    }
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
              <SearchBar
                placeholder={t`Search assets`}
                value={searchText}
                onChange={setSearchText}
                onRequestSearch={onSearchChange}
                style={styles.searchBar}
                ref={searchBar}
                id="asset-store-search-bar"
              />
              {!isOnHomePage && <Spacer />}
              <Column>
                <Line
                  justifyContent="space-between"
                  noMargin
                  alignItems="center"
                >
                  {isOnHomePage ? (
                    <Text size="title">
                      <Trans>Discover</Trans>
                    </Text>
                  ) : (
                    <>
                      <FlatButton
                        icon={<ArrowBack />}
                        label={
                          openedAssetShortHeader ? (
                            <Trans>Back</Trans>
                          ) : (
                            <Trans>Back to discover</Trans>
                          )
                        }
                        primary={false}
                        onClick={goBack}
                      />
                      {!!openedAssetPack && !openedAssetShortHeader && (
                        <>
                          <Text size="title" noMargin>
                            {openedAssetPack.name}
                          </Text>
                          <Column alignItems="center" justifyContent="center">
                            <RaisedButton
                              primary
                              label={
                                isAssetPackAdded ? (
                                  <Trans>Asset pack added</Trans>
                                ) : (
                                  <Trans>Add this pack to my project</Trans>
                                )
                              }
                              onClick={() =>
                                setIsAssetPackDialogInstallOpen(true)
                              }
                              disabled={isAssetPackAdded}
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
                            <DoubleChevronArrow />
                          </IconButton>
                        </Line>
                        <Line
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <AssetStoreFilterPanel
                            assetFiltersState={assetFiltersState}
                            onChoiceChange={onSearchChange}
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
                        onOpenDetails={() => {
                          sendAssetOpened({
                            id: assetShortHeader.id,
                            name: assetShortHeader.name,
                          });
                          setOpenedAssetShortHeader(assetShortHeader);
                        }}
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
                    onClose={() => setOpenedAssetShortHeader(null)}
                    isAddedToProject={addedAssetIds.includes(
                      openedAssetShortHeader.id
                    )}
                    isBeingAddedToProject={isAssetBeingInstalled}
                  />
                )}
              </Line>
            </Column>
            {resourcesFetcher.renderResourceFetcherDialog()}
            {isAssetPackDialogInstallOpen && searchResults && openedAssetPack && (
              <Dialog
                title={<Trans>{openedAssetPack.name}</Trans>}
                open
                actions={[
                  <FlatButton
                    key="cancel"
                    label={<Trans>Cancel</Trans>}
                    onClick={() => setIsAssetPackDialogInstallOpen(false)}
                  />,
                  <RaisedButton
                    key="continue"
                    label={<Trans>Continue</Trans>}
                    primary
                    disabled={isAssetBeingInstalled}
                    onClick={onInstallAssetPack}
                  />,
                ]}
                onApply={onInstallAssetPack}
              >
                <Column>
                  <Text>
                    <Trans>
                      You're about to add {searchResults.length} assets from the
                      Asset Pack {openedAssetPack.name}. Continue?
                    </Trans>
                  </Text>
                  {isAssetBeingInstalled && (
                    <>
                      <Text>
                        <Trans>Installing assets...</Trans>
                      </Text>
                      <Line expand>
                        <LinearProgress style={styles.linearProgress} />
                      </Line>
                    </>
                  )}
                </Column>
              </Dialog>
            )}
          </>
        )}
      </ResponsiveWindowMeasurer>
    </>
  );
};
