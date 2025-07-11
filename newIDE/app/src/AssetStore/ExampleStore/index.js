// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import SearchBar, { type SearchBarInterface } from '../../UI/SearchBar';
import { Column, Line, Spacer } from '../../UI/Grid';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import { ExampleStoreContext } from './ExampleStoreContext';
import {
  sendExampleDetailsOpened,
  sendGameTemplateInformationOpened,
} from '../../Utils/Analytics/EventSender';
import { t, Trans } from '@lingui/macro';
import { useShouldAutofocusInput } from '../../UI/Responsive/ScreenTypeMeasurer';
import { type PrivateGameTemplateListingData } from '../../Utils/GDevelopServices/Shop';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { PrivateGameTemplateStoreContext } from '../PrivateGameTemplates/PrivateGameTemplateStoreContext';
import GridList from '@material-ui/core/GridList';
import { getExampleAndTemplateTiles } from '../../MainFrame/EditorContainers/HomePage/CreateSection/utils';
import BackgroundText from '../../UI/BackgroundText';
import { ColumnStackLayout } from '../../UI/Layout';
import {
  isLinkedToStartingPointExampleShortHeader,
  isStartingPointExampleShortHeader,
} from '../../ProjectCreation/EmptyAndStartingPointProjects';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from '../../UI/Responsive/ResponsiveWindowMeasurer';
import { LARGE_WIDGET_SIZE } from '../../MainFrame/EditorContainers/HomePage/CardWidget';

const ITEMS_SPACING = 5;
const styles = {
  grid: {
    textAlign: 'center',
    width: `calc(100% + ${2 * ITEMS_SPACING}px)`, // This is needed to compensate for the `margin: -5px` added by MUI related to spacing.
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
};

// Filter out examples that aren't games.
const gameFilter = (
  item: PrivateGameTemplateListingData | ExampleShortHeader
) => {
  if (item.previewImageUrls) {
    // It's an example, filter out examples that are not games or have no thumbnail.
    return item.tags.includes('game') && !!item.previewImageUrls[0];
  }
  // It's a game template, trust it's been filtered correctly.
  return true;
};

const noStartingPointFilter = (
  allExampleShortHeaders: ExampleShortHeader[],
  exampleShortHeader: ExampleShortHeader
) =>
  !isStartingPointExampleShortHeader(exampleShortHeader) &&
  !isLinkedToStartingPointExampleShortHeader(
    allExampleShortHeaders,
    exampleShortHeader
  );

type Props = {|
  onSelectExampleShortHeader: ExampleShortHeader => void,
  onSelectPrivateGameTemplateListingData: PrivateGameTemplateListingData => void,
  i18n: I18nType,
  onlyShowGames?: boolean,
  hideStartingPoints?: boolean,
  getColumnsFromWindowSize: (
    windowSize: WindowSizeType,
    isLandscape: boolean
  ) => number,
  hideSearch?: boolean,
  limitRowsTo?: number,
  hidePremiumTemplates?: boolean,
|};

const ExampleStore = ({
  onSelectExampleShortHeader,
  onSelectPrivateGameTemplateListingData,
  i18n,
  onlyShowGames,
  hideStartingPoints,
  getColumnsFromWindowSize,
  hideSearch,
  limitRowsTo,
  hidePremiumTemplates,
}: Props) => {
  const MAX_COLUMNS = getColumnsFromWindowSize('xlarge', true);
  const MAX_SECTION_WIDTH = (LARGE_WIDGET_SIZE + 2 * 5) * MAX_COLUMNS; // widget size + 5 padding per side
  const { windowSize, isLandscape } = useResponsiveWindowSize();

  const { receivedGameTemplates } = React.useContext(AuthenticatedUserContext);
  const {
    exampleShortHeaders: allExampleShortHeaders,
    exampleShortHeadersSearchResults,
    fetchExamplesAndFilters,
    searchText: exampleStoreSearchText,
    setSearchText: setExampleStoreSearchText,
  } = React.useContext(ExampleStoreContext);
  const {
    fetchGameTemplates,
    exampleStore: {
      privateGameTemplateListingDatasSearchResults,
      setSearchText: setGameTemplateStoreSearchText,
    },
  } = React.useContext(PrivateGameTemplateStoreContext);
  const [localSearchText, setLocalSearchText] = React.useState(
    exampleStoreSearchText
  );
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const columnsCount = getColumnsFromWindowSize(windowSize, isLandscape);

  const shouldAutofocusSearchbar = useShouldAutofocusInput();
  const searchBarRef = React.useRef<?SearchBarInterface>(null);

  React.useEffect(
    () => {
      if (shouldAutofocusSearchbar && searchBarRef.current)
        searchBarRef.current.focus();
    },
    [shouldAutofocusSearchbar]
  );

  // We search in both examples and game templates stores.
  const setSearchText = React.useCallback(
    (searchText: string) => {
      if (searchText.length < 2) {
        // Prevent searching with less than 2 characters, as it does not return any results.
        setExampleStoreSearchText('');
        setGameTemplateStoreSearchText('');
      } else {
        setExampleStoreSearchText(searchText);
        setGameTemplateStoreSearchText(searchText);
      }
      setLocalSearchText(searchText);
    },
    [setExampleStoreSearchText, setGameTemplateStoreSearchText]
  );

  const fetchGameTemplatesAndExamples = React.useCallback(
    () => {
      fetchGameTemplates();
      fetchExamplesAndFilters();
    },
    [fetchGameTemplates, fetchExamplesAndFilters]
  );

  // Load examples and game templates on mount.
  React.useEffect(
    () => {
      fetchGameTemplatesAndExamples();
    },
    [fetchGameTemplatesAndExamples]
  );

  const resultTiles: React.Node[] = React.useMemo(
    () => {
      return getExampleAndTemplateTiles({
        receivedGameTemplates,
        privateGameTemplateListingDatas:
          privateGameTemplateListingDatasSearchResults && !hidePremiumTemplates
            ? privateGameTemplateListingDatasSearchResults
                .map(({ item }) => item)
                .filter(
                  privateGameTemplateListingData =>
                    !onlyShowGames || gameFilter(privateGameTemplateListingData)
                )
            : [],
        exampleShortHeaders: exampleShortHeadersSearchResults
          ? exampleShortHeadersSearchResults
              .map(({ item }) => item)
              .filter(
                exampleShortHeader =>
                  !onlyShowGames || gameFilter(exampleShortHeader)
              )
              .filter(
                exampleShortHeader =>
                  !allExampleShortHeaders ||
                  !hideStartingPoints ||
                  noStartingPointFilter(
                    allExampleShortHeaders,
                    exampleShortHeader
                  )
              )
          : [],
        onSelectPrivateGameTemplateListingData: privateGameTemplateListingData => {
          sendGameTemplateInformationOpened({
            gameTemplateName: privateGameTemplateListingData.name,
            gameTemplateId: privateGameTemplateListingData.id,
            source: 'examples-list',
          });
          onSelectPrivateGameTemplateListingData(
            privateGameTemplateListingData
          );
        },
        onSelectExampleShortHeader: exampleShortHeader => {
          sendExampleDetailsOpened(exampleShortHeader.slug);
          onSelectExampleShortHeader(exampleShortHeader);
        },
        i18n,
        gdevelopTheme,
        privateGameTemplatesPeriodicity: 1,
        showOwnedGameTemplatesFirst: true,
      }).allGridItems;
    },
    [
      receivedGameTemplates,
      privateGameTemplateListingDatasSearchResults,
      exampleShortHeadersSearchResults,
      onSelectPrivateGameTemplateListingData,
      onSelectExampleShortHeader,
      i18n,
      gdevelopTheme,
      onlyShowGames,
      hideStartingPoints,
      allExampleShortHeaders,
      hidePremiumTemplates,
    ]
  );

  return (
    <React.Fragment>
      <Column expand noMargin>
        {!hideSearch && (
          <Line>
            <Column expand noMargin>
              <SearchBar
                value={localSearchText}
                onChange={setSearchText}
                onRequestSearch={() => {}}
                ref={searchBarRef}
                placeholder={t`Search examples`}
              />
            </Column>
          </Line>
        )}
        {resultTiles.length === 0 ? (
          <Column noMargin expand justifyContent="center">
            <Spacer />
            <BackgroundText>
              <Trans>
                No results returned for your search. Try something else!
              </Trans>
            </BackgroundText>
          </Column>
        ) : (
          <ColumnStackLayout noMargin expand>
            <GridList
              cols={columnsCount}
              style={{
                ...styles.grid,
                // Avoid tiles taking too much space on large screens.
                maxWidth: MAX_SECTION_WIDTH,
              }}
              cellHeight="auto"
              spacing={ITEMS_SPACING * 2}
            >
              {resultTiles.slice(
                0,
                limitRowsTo ? limitRowsTo * columnsCount : Infinity
              )}
            </GridList>
          </ColumnStackLayout>
        )}
      </Column>
    </React.Fragment>
  );
};

export default ExampleStore;
