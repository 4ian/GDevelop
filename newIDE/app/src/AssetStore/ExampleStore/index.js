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
import {
  sendExampleDetailsOpened,
  sendGameTemplateInformationOpened,
} from '../../Utils/Analytics/EventSender';
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
) => item.id;

type Props = {|
  isOpening: boolean,
  onOpenNewProjectSetupDialog: () => void,
  focusOnMount?: boolean,
  selectedExampleShortHeader: ?ExampleShortHeader,
  onSelectExampleShortHeader: (?ExampleShortHeader) => void,
  selectedPrivateGameTemplateListingData: ?PrivateGameTemplateListingData,
  onSelectPrivateGameTemplateListingData: (
    ?PrivateGameTemplateListingData
  ) => void,
|};

export const ExampleStore = ({
  isOpening,
  onOpenNewProjectSetupDialog,
  focusOnMount,
  // The example store is "controlled" by the parent. Useful as selected items are
  // needed in MainFrame, to display them in NewProjectSetupDialog.
  selectedExampleShortHeader,
  onSelectExampleShortHeader,
  selectedPrivateGameTemplateListingData,
  onSelectPrivateGameTemplateListingData,
}: Props) => {
  const { receivedGameTemplates } = React.useContext(AuthenticatedUserContext);
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
      const privateGameTemplateItems = privateGameTemplateListingDatasSearchResults
        ? privateGameTemplateListingDatasSearchResults.map(({ item }) => item)
        : [];
      const exampleShortHeaderItems = exampleShortHeadersSearchResults
        ? exampleShortHeadersSearchResults.map(({ item }) => item)
        : [];

      for (let i = 0; i < exampleShortHeaderItems.length; ++i) {
        searchItems.push(exampleShortHeaderItems[i]);
        if (i % 2 === 1 && privateGameTemplateItems.length > 0) {
          const nextPrivateGameTemplateIndex = Math.floor(i / 2);
          if (nextPrivateGameTemplateIndex < privateGameTemplateItems.length)
            searchItems.push(
              privateGameTemplateItems[nextPrivateGameTemplateIndex]
            );
        }
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
                    // This is an ExampleShortHeader.
                    return (
                      <ExampleListItem
                        isOpening={isOpening}
                        onHeightComputed={onHeightComputed}
                        exampleShortHeader={item}
                        matches={getExampleShortHeaderMatches(item)}
                        onChoose={() => {
                          sendExampleDetailsOpened(item.slug);
                          onSelectExampleShortHeader(item);
                        }}
                        onOpen={() => {
                          onSelectExampleShortHeader(item);
                          onOpenNewProjectSetupDialog();
                        }}
                      />
                    );
                  }
                  if (item.listing) {
                    // This is a PrivateGameTemplateListingData.
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
                          onSelectPrivateGameTemplateListingData(item);
                          sendGameTemplateInformationOpened({
                            gameTemplateName: item.name,
                            gameTemplateId: item.id,
                            source: 'examples-list',
                          });
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
          onOpen={onOpenNewProjectSetupDialog}
          onClose={() => onSelectExampleShortHeader(null)}
        />
      )}
      {!!selectedPrivateGameTemplateListingData && (
        <PrivateGameTemplateInformationDialog
          privateGameTemplateListingData={
            selectedPrivateGameTemplateListingData
          }
          isPurchaseDialogOpen={!!purchasingGameTemplateListingData}
          onGameTemplateOpen={onOpenNewProjectSetupDialog}
          onOpenPurchaseDialog={() => {
            setPurchasingGameTemplateListingData(
              selectedPrivateGameTemplateListingData
            );
          }}
          onClose={() => onSelectPrivateGameTemplateListingData(null)}
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
