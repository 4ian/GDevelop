// @flow
import * as React from 'react';
import SearchBar, { type SearchBarInterface } from '../../UI/SearchBar';
import { Column, Line } from '../../UI/Grid';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import { ExampleStoreContext } from './ExampleStoreContext';
import { ListSearchResults } from '../../UI/Search/ListSearchResults';
import ExampleListItem from './ExampleListItem';
import { ResponsiveWindowMeasurer } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import { ExampleDialog } from './ExampleDialog';
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import { sendExampleDetailsOpened } from '../../Utils/Analytics/EventSender';
import { t } from '@lingui/macro';
import { useShouldAutofocusInput } from '../../UI/Reponsive/ScreenTypeMeasurer';
import { type PrivateGameTemplateListingData } from '../../Utils/GDevelopServices/Shop';
import PrivateGameTemplatePurchaseDialog from '../PrivateGameTemplates/PrivateGameTemplatePurchaseDialog';
import PrivateGameTemplateInformationDialog from '../PrivateGameTemplates/PrivateGameTemplateInformationDialog';
import PrivateGameTemplateListItem from '../PrivateGameTemplates/PrivateGameTemplateListItem';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { PrivateGameTemplateStoreContext } from '../PrivateGameTemplates/PrivateGameTemplateStoreContext';

// When showing examples, always put the starters first.
export const prepareExampleShortHeaders = (
  examples: Array<ExampleShortHeader>
): Array<ExampleShortHeader> =>
  examples.sort((example1, example2) => {
    const isExample1Starter = example1.tags.includes('Starter');
    const isExample2Starter = example2.tags.includes('Starter');
    // Don't change starters order.
    if (isExample1Starter && isExample2Starter) {
      return 0;
    }
    let difference = (isExample2Starter ? 1 : 0) - (isExample1Starter ? 1 : 0);
    if (difference) {
      return difference;
    }
    difference =
      (example2.tags.includes('game') ? 1 : 0) -
      (example1.tags.includes('game') ? 1 : 0);
    if (difference) {
      return difference;
    }
    difference =
      (example2.previewImageUrls.length ? 1 : 0) -
      (example1.previewImageUrls.length ? 1 : 0);
    if (difference) {
      return difference;
    }

    return 0;
  });

const getItemUniqueId = (
  item: ExampleShortHeader | PrivateGameTemplateListingData
) => item.name;

type Props = {|
  isOpening: boolean,
  onOpenExampleShortHeader: ExampleShortHeader => void,
  onOpenPrivateGameTemplateListingData: PrivateGameTemplateListingData => void,
  focusOnMount?: boolean,
  initialExampleShortHeader: ?ExampleShortHeader,
  initialPrivateGameTemplateListingData: ?PrivateGameTemplateListingData,
|};

export const ExampleStore = ({
  isOpening,
  onOpenExampleShortHeader,
  onOpenPrivateGameTemplateListingData,
  focusOnMount,
  initialExampleShortHeader,
  initialPrivateGameTemplateListingData,
}: Props) => {
  const { receivedGameTemplates } = React.useContext(AuthenticatedUserContext);
  const [
    selectedExampleShortHeader,
    setSelectedExampleShortHeader,
  ] = React.useState<?ExampleShortHeader>(initialExampleShortHeader);
  const [
    selectedPrivateGameTemplateListingData,
    setSelectedPrivateGameTemplateListingData,
  ] = React.useState<?PrivateGameTemplateListingData>(
    initialPrivateGameTemplateListingData
  );
  const [
    purchasingGameTemplateListingData,
    setPurchasingGameTemplateListingData,
  ] = React.useState<?PrivateGameTemplateListingData>(null);
  const {
    exampleFilters,
    exampleShortHeadersSearchResults,
    error: exampleStoreError,
    fetchExamplesAndFilters,
    filtersState: exampleStoreFiltersState,
    searchText,
    setSearchText: setExampleStoreSearchText,
  } = React.useContext(ExampleStoreContext);
  const {
    gameTemplateFilters,
    error: gameTemplateStoreError,
    fetchGameTemplates,
    exampleStore: {
      privateGameTemplateListingDatasSearchResults,
      filtersState: gameTemplateStoreFiltersState,
      setSearchText: setGameTemplateStoreSearchText,
    },
  } = React.useContext(PrivateGameTemplateStoreContext);

  const shouldAutofocusSearchbar = useShouldAutofocusInput();
  const searchBarRef = React.useRef<?SearchBarInterface>(null);

  React.useEffect(
    () => {
      if (focusOnMount && shouldAutofocusSearchbar && searchBarRef.current)
        searchBarRef.current.focus();
    },
    [shouldAutofocusSearchbar, focusOnMount]
  );

  // Tags are applied to both examples and game templates.
  const tagsHandler = React.useMemo(
    () => ({
      add: (tag: string) => {
        exampleStoreFiltersState.addFilter(tag);
        gameTemplateStoreFiltersState.addFilter(tag);
      },
      remove: (tag: string) => {
        exampleStoreFiltersState.removeFilter(tag);
        gameTemplateStoreFiltersState.removeFilter(tag);
      },
      // We use the same tags for both examples and game templates, so we can
      // use the tags from either store.
      chosenTags: exampleStoreFiltersState.chosenFilters,
    }),
    [exampleStoreFiltersState, gameTemplateStoreFiltersState]
  );

  // We search in both examples and game templates stores.
  const setSearchText = React.useCallback(
    (searchText: string) => {
      setExampleStoreSearchText(searchText);
      setGameTemplateStoreSearchText(searchText);
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

  const getExampleShortHeaderMatches = (
    exampleShortHeader: ExampleShortHeader
  ): SearchMatch[] => {
    if (!exampleShortHeadersSearchResults) return [];
    const exampleMatches = exampleShortHeadersSearchResults.find(
      result => result.item.id === exampleShortHeader.id
    );
    return exampleMatches ? exampleMatches.matches : [];
  };

  const getPrivateAssetPackListingDataMatches = (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ): SearchMatch[] => {
    if (!privateGameTemplateListingDatasSearchResults) return [];
    const gameTemplateMatches = privateGameTemplateListingDatasSearchResults.find(
      result => result.item.id === privateGameTemplateListingData.id
    );
    return gameTemplateMatches ? gameTemplateMatches.matches : [];
  };

  const searchItems: (
    | ExampleShortHeader
    | PrivateGameTemplateListingData
  )[] = React.useMemo(
    () => {
      const searchItems = [];
      if (privateGameTemplateListingDatasSearchResults) {
        searchItems.push(
          ...privateGameTemplateListingDatasSearchResults.map(
            ({ item }) => item
          )
        );
      }
      if (exampleShortHeadersSearchResults) {
        searchItems.push(
          ...prepareExampleShortHeaders(
            exampleShortHeadersSearchResults.map(({ item }) => item)
          )
        );
      }
      return searchItems;
    },
    [
      exampleShortHeadersSearchResults,
      privateGameTemplateListingDatasSearchResults,
    ]
  );

  const defaultTags = React.useMemo(
    () => [
      ...(exampleFilters ? exampleFilters.defaultTags : []),
      ...(gameTemplateFilters ? gameTemplateFilters.defaultTags : []),
    ],
    [exampleFilters, gameTemplateFilters]
  );

  return (
    <React.Fragment>
      <ResponsiveWindowMeasurer>
        {windowWidth => (
          <Column expand noMargin useFullHeight>
            <Line>
              <Column expand noMargin>
                <SearchBar
                  value={searchText}
                  onChange={setSearchText}
                  onRequestSearch={() => {}}
                  tagsHandler={tagsHandler}
                  tags={defaultTags}
                  ref={searchBarRef}
                  placeholder={t`Search examples`}
                />
              </Column>
            </Line>
            <Line
              expand
              overflow={
                'hidden' /* Somehow required on Chrome/Firefox to avoid children growing (but not on Safari) */
              }
              noMargin
            >
              <ListSearchResults
                disableAutoTranslate // Search results text highlighting conflicts with dom handling by browser auto-translations features. Disables auto translation to prevent crashes.
                onRetry={fetchGameTemplatesAndExamples}
                error={gameTemplateStoreError || exampleStoreError}
                searchItems={searchItems}
                getSearchItemUniqueId={getItemUniqueId}
                renderSearchItem={(item, onHeightComputed) => {
                  if (item.authorIds) {
                    // This is an exampleShortHeader.
                    return (
                      <ExampleListItem
                        isOpening={isOpening}
                        onHeightComputed={onHeightComputed}
                        exampleShortHeader={item}
                        matches={getExampleShortHeaderMatches(item)}
                        onChoose={() => {
                          sendExampleDetailsOpened(item.slug);
                          setSelectedExampleShortHeader(item);
                        }}
                        onOpen={() => {
                          onOpenExampleShortHeader(item);
                        }}
                      />
                    );
                  }
                  if (item.listing) {
                    // This is a privateGameTemplateListingData.
                    const isTemplateOwned =
                      !!receivedGameTemplates &&
                      !!receivedGameTemplates.find(
                        template => template.id === item.id
                      );
                    return (
                      <PrivateGameTemplateListItem
                        isOpening={isOpening}
                        onHeightComputed={onHeightComputed}
                        privateGameTemplateListingData={item}
                        matches={getPrivateAssetPackListingDataMatches(item)}
                        onChoose={() => {
                          setSelectedPrivateGameTemplateListingData(item);
                        }}
                        owned={isTemplateOwned}
                      />
                    );
                  }
                  return null; // Should not happen.
                }}
              />
            </Line>
          </Column>
        )}
      </ResponsiveWindowMeasurer>
      {!!selectedExampleShortHeader && (
        <ExampleDialog
          isOpening={isOpening}
          exampleShortHeader={selectedExampleShortHeader}
          onOpen={() => {
            onOpenExampleShortHeader(selectedExampleShortHeader);
          }}
          onClose={() => setSelectedExampleShortHeader(null)}
        />
      )}
      {!!selectedPrivateGameTemplateListingData && (
        <PrivateGameTemplateInformationDialog
          privateGameTemplateListingData={
            selectedPrivateGameTemplateListingData
          }
          isPurchaseDialogOpen={!!purchasingGameTemplateListingData}
          onGameTemplateOpen={() => {
            onOpenPrivateGameTemplateListingData(
              selectedPrivateGameTemplateListingData
            );
          }}
          onOpenPurchaseDialog={() => {
            setPurchasingGameTemplateListingData(
              selectedPrivateGameTemplateListingData
            );
          }}
          onClose={() => setSelectedPrivateGameTemplateListingData(null)}
        />
      )}
      {!!purchasingGameTemplateListingData && (
        <PrivateGameTemplatePurchaseDialog
          privateGameTemplateListingData={purchasingGameTemplateListingData}
          onClose={() => setPurchasingGameTemplateListingData(null)}
        />
      )}
    </React.Fragment>
  );
};
