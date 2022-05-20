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
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import { BoxSearchResults } from '../UI/Search/BoxSearchResults';
import { type SearchBarInterface } from '../UI/SearchBar';
import { FiltersChooser } from '../UI/Search/FiltersChooser';
import { AssetStoreContext } from './AssetStoreContext';
import { AssetCard } from './AssetCard';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import Subheader from '../UI/Subheader';
import { CategoryChooser } from '../UI/Search/CategoryChooser';
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

const styles = {
  searchBar: {
    // TODO: Can we put this in the search bar by default?
    flexShrink: 0,
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
    filters,
    assetPacks,
    searchResults,
    error,
    fetchAssetsAndFilters,
    filtersState,
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
  const [openedAssetPack, setOpenedAssetPack] = React.useState(null);
  const [
    openedAssetShortHeader,
    setOpenedAssetShortHeader,
  ] = React.useState<?AssetShortHeader>(null);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  const [
    assetBeingInstalled,
    setAssetBeingInstalled,
  ] = React.useState<?AssetShortHeader>(null);

  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  const resourcesFetcher = useResourceFetcher();

  const onInstallAsset = React.useCallback(
    (assetShortHeader: AssetShortHeader) => {
      setAssetBeingInstalled(assetShortHeader);
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

        setAssetBeingInstalled(null);
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

  const isOnHomePage =
    !openedAssetPack && !openedAssetShortHeader && !searchText;

  const resetAssetSelection = () => {
    setOpenedAssetPack(null);
    setOpenedAssetShortHeader(null);
  };

  const selectPack = (tag: string) => {
    if (!assetPacks) return;

    sendAssetPackOpened(tag);
    setOpenedAssetPack(tag);

    const chosenCategory = {
      node: { name: tag, allChildrenTags: [], children: [] },
      parentNodes: [],
    };
    filtersState.setChosenCategory(chosenCategory);

    setIsFiltersOpen(true);
  };

  const selectTag = (tag: string) => {
    setOpenedAssetShortHeader(null);
    setOpenedAssetPack(tag);
    const chosenCategory = {
      node: { name: tag, allChildrenTags: [], children: [] },
      parentNodes: [],
    };
    filtersState.setChosenCategory(chosenCategory);
    setIsFiltersOpen(true);
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
                onRequestSearch={resetAssetSelection}
                style={styles.searchBar}
                ref={searchBar}
                id="asset-store-search-bar"
              />
              {!isOnHomePage && <Spacer />}
              <Line justifyContent="left" noMargin>
                {isOnHomePage ? (
                  <Column>
                    <Text size="title">
                      <Trans>Discover</Trans>
                    </Text>
                  </Column>
                ) : (
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
                    onClick={() => {
                      if (openedAssetShortHeader) {
                        // Going back from Asset page to search.
                        setOpenedAssetShortHeader(null);
                      } else {
                        // Going back from search to home.
                        setSearchText('');
                        filtersState.setChosenCategory(null);
                        setIsFiltersOpen(false);
                        resetAssetSelection();
                      }
                    }}
                  />
                )}
              </Line>
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
                      !isFiltersOpen ? 50 : windowWidth === 'small' ? 150 : 250
                    }
                  >
                    {!isFiltersOpen ? (
                      <Line justifyContent="center">
                        <IconButton onClick={() => setIsFiltersOpen(true)}>
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
                                <Trans>Categories</Trans>
                              </Subheader>
                            </Line>
                          </Column>
                          <IconButton onClick={() => setIsFiltersOpen(false)}>
                            <DoubleChevronArrow />
                          </IconButton>
                        </Line>
                        <>
                          <CategoryChooser
                            allItemsLabel={<Trans>All assets</Trans>}
                            allFilters={filters}
                            filtersState={filtersState}
                            onChoiceChange={category => {
                              if (category) {
                                setOpenedAssetPack(category.node.name);
                              }
                            }}
                            error={error}
                          />
                          <Subheader>
                            <Trans>Filters</Trans>
                          </Subheader>
                          <FiltersChooser
                            allFilters={filters}
                            filtersState={filtersState}
                            error={error}
                          />
                        </>
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
                {(openedAssetPack || searchText) && !openedAssetShortHeader && (
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
                          setIsFiltersOpen(false);
                        }}
                        assetShortHeader={assetShortHeader}
                      />
                    )}
                  />
                )}
                {openedAssetShortHeader && (
                  <AssetDetails
                    project={project}
                    layout={layout}
                    objectsContainer={objectsContainer}
                    resourceSources={resourceSources}
                    resourceExternalEditors={resourceExternalEditors}
                    onTagSelection={selectTag}
                    assetShortHeader={openedAssetShortHeader}
                    onAdd={() => onInstallAsset(openedAssetShortHeader)}
                    onClose={() => setOpenedAssetShortHeader(null)}
                    canInstall={!assetBeingInstalled}
                    isBeingInstalled={
                      !!assetBeingInstalled &&
                      assetBeingInstalled.id === openedAssetShortHeader.id
                    }
                  />
                )}
              </Line>
            </Column>
            {resourcesFetcher.renderResourceFetcherDialog()}
          </>
        )}
      </ResponsiveWindowMeasurer>
    </>
  );
};
