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
import { sendAssetPackOpened } from '../Utils/Analytics/EventSender';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import { BoxSearchResults } from '../UI/Search/BoxSearchResults';
import { type SearchBarInterface } from '../UI/SearchBar';
import { FiltersChooser } from '../UI/Search/FiltersChooser';
import { AssetStoreFilterPanel } from './AssetStoreFilterPanel';
import { AssetStoreContext } from './AssetStoreContext';
import { AssetCard } from './AssetCard';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import Subheader from '../UI/Subheader';
import { CategoryChooser } from '../UI/Search/CategoryChooser';
import { AssetsHome } from './AssetsHome';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';

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
  onOpenDetails: AssetShortHeader => void,
  focusOnMount?: boolean,
};

export const AssetStore = ({
  project,
  objectsContainer,
  events,
  onOpenDetails,
  focusOnMount,
}: Props) => {
  const {
    filters,
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
  const [isOnHomePage, setIsOnHomePage] = React.useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  React.useEffect(
    () => {
      if (focusOnMount && shouldAutofocusSearchbar && searchBar.current) {
        searchBar.current.focus();
      }
    },
    [shouldAutofocusSearchbar, focusOnMount]
  );

  return (
    <ResponsiveWindowMeasurer>
      {windowWidth => (
        <Column expand noMargin useFullHeight>
          <SearchBar
            placeholder={t`Enter your Search`}
            value={searchText}
            onChange={setSearchText}
            onRequestSearch={() => setIsOnHomePage(false)}
            style={styles.searchBar}
            ref={searchBar}
            id="asset-store-search-bar"
          />
          {!isOnHomePage && <Spacer />}
          <Line justifyContent="left" noMargin={isOnHomePage}>
            {isOnHomePage ? (
              <Column>
                <Text size="title">
                  <Trans>Discover</Trans>
                </Text>
              </Column>
            ) : (
              <FlatButton
                icon={<ArrowBack />}
                label={<Trans>Back to discover</Trans>}
                primary={false}
                onClick={() => {
                  filtersState.setChosenCategory(null);
                  setIsFiltersOpen(false);
                  setIsOnHomePage(true);
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
            <Background
              noFullHeight
              noExpand
              width={!isFiltersOpen ? 50 : windowWidth === 'small' ? 150 : 250}
            >
              {!isFiltersOpen ? (
                <Line justifyContent="center">
                  <IconButton onClick={() => setIsFiltersOpen(true)}>
                    <Tune />
                  </IconButton>
                </Line>
              ) : (
                <ScrollView>
                  <Line justifyContent="space-between" alignItems="center">
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
                  <Line justifyContent="space-between" alignItems="center">
                    <AssetStoreFilterPanel
                      assetFiltersState={assetFiltersState}
                      onChoiceChange={() => setIsOnHomePage(false)}
                    />
                  </Line>
                </ScrollView>
              )}
            </Background>
            {isOnHomePage && assetPacks ? (
              <AssetsHome
                assetPacks={assetPacks}
                onPackSelection={tag => {
                  const chosenCategory = {
                    node: { name: tag, allChildrenTags: [], children: [] },
                    parentNodes: [],
                  };
                  sendAssetPackOpened(tag);
                  filtersState.setChosenCategory(chosenCategory);
                  setIsFiltersOpen(true);
                  setIsOnHomePage(false);
                }}
              />
            ) : (
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
              />
            )}
          </Line>
        </Column>
      )}
    </ResponsiveWindowMeasurer>
  );
};
