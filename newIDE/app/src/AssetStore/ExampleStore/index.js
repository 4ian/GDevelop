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

const styles = {
  grid: {
    margin: 0,
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

type Props = {|
  onSelectExampleShortHeader: ExampleShortHeader => void,
  onSelectPrivateGameTemplateListingData: PrivateGameTemplateListingData => void,
  i18n: I18nType,
  onlyShowGames?: boolean,
  columnsCount: number,
  rowToInsert?: {|
    row: number,
    element: React.Node,
  |},
|};

const ExampleStore = ({
  onSelectExampleShortHeader,
  onSelectPrivateGameTemplateListingData,
  i18n,
  onlyShowGames,
  columnsCount,
  rowToInsert,
}: Props) => {
  const { receivedGameTemplates } = React.useContext(AuthenticatedUserContext);
  const {
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
        privateGameTemplateListingDatas: privateGameTemplateListingDatasSearchResults
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
      onlyShowGames,
    ]
  );

  const nodesToDisplay: React.Node[] = React.useMemo(
    () => {
      const numberOfTilesToDisplayUntilRowToInsert = rowToInsert
        ? rowToInsert.row * columnsCount
        : 0;
      const firstTiles = resultTiles.slice(
        0,
        numberOfTilesToDisplayUntilRowToInsert
      );
      const lastTiles = resultTiles.slice(
        numberOfTilesToDisplayUntilRowToInsert
      );
      return [
        <GridList
          cols={columnsCount}
          style={styles.grid}
          cellHeight="auto"
          spacing={2}
          key="first-tiles"
        >
          {firstTiles}
        </GridList>,
        rowToInsert ? (
          <Line key="inserted-row">{rowToInsert.element}</Line>
        ) : null,
        lastTiles.length > 0 ? (
          <GridList
            cols={columnsCount}
            style={styles.grid}
            cellHeight="auto"
            spacing={2}
            key="last-tiles"
          >
            {lastTiles}
          </GridList>
        ) : null,
      ].filter(Boolean);
    },
    [columnsCount, rowToInsert, resultTiles]
  );

  return (
    <React.Fragment>
      <Column expand noMargin>
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
        {resultTiles.length === 0 ? (
          <Column noMargin expand justifyContent="center">
            <Spacer />
            <BackgroundText>
              <Trans>
                No results returned for your search. Try something else!
              </Trans>
            </BackgroundText>
            {rowToInsert && <Line>{rowToInsert.element}</Line>}
          </Column>
        ) : (
          <ColumnStackLayout noMargin expand>
            {nodesToDisplay}
          </ColumnStackLayout>
        )}
      </Column>
    </React.Fragment>
  );
};

export default ExampleStore;
