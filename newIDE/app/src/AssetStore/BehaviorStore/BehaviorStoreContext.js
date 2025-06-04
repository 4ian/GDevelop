// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type FiltersState, useFilters } from '../../UI/Search/FiltersChooser';
import {
  getBehaviorsRegistry,
  type BehaviorsRegistry,
  type BehaviorShortHeader,
} from '../../Utils/GDevelopServices/Extension';
import { type Filters } from '../../Utils/GDevelopServices/Filters';
import {
  useSearchStructuredItem,
  type SearchResult,
} from '../../UI/Search/UseSearchStructuredItem';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { BEHAVIORS_FETCH_TIMEOUT } from '../../Utils/GlobalFetchTimeouts';

const gd: libGDevelop = global.gd;

const emptySearchText = '';

const noExcludedTiers = new Set();
const excludedCommunityTiers = new Set(['community']);

type BehaviorStoreState = {|
  filters: ?Filters,
  searchResults: ?Array<
    SearchResult<BehaviorShortHeader>
  >,
  fetchBehaviors: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  allCategories: string[],
  chosenCategory: string,
  setChosenCategory: string => void,
  setInstalledBehaviorMetadataList: (
    installedBehaviorMetadataList: Array<BehaviorShortHeader>
  ) => void,
  translatedBehaviorShortHeadersByType: { [name: string]: BehaviorShortHeader },
  filtersState: FiltersState,
|};

export const BehaviorStoreContext = React.createContext<BehaviorStoreState>({
  filters: null,
  searchResults: null,
  fetchBehaviors: () => {},
  error: null,
  searchText: '',
  setSearchText: () => {},
  allCategories: [],
  // '' means all categories.
  chosenCategory: '',
  setChosenCategory: () => {},
  setInstalledBehaviorMetadataList: () => {},
  translatedBehaviorShortHeadersByType: {},
  filtersState: {
    chosenFilters: new Set(),
    addFilter: () => {},
    removeFilter: () => {},
    chosenCategory: null,
    setChosenCategory: () => {},
  },
});

type BehaviorStoreStateProviderProps = {|
  children: React.Node,
  i18n: I18nType,
  defaultSearchText?: string,
|};

export const BehaviorStoreStateProvider = ({
  children,
  i18n,
  defaultSearchText,
}: BehaviorStoreStateProviderProps) => {
  const [
    installedBehaviorMetadataList,
    setInstalledBehaviorMetadataList,
  ] = React.useState<Array<BehaviorShortHeader>>([]);
  const [
    translatedBehaviorShortHeadersByType,
    setTranslatedBehaviorShortHeadersByType,
  ] = React.useState<{
    [string]: BehaviorShortHeader,
  }>({});

  const preferences = React.useContext(PreferencesContext);
  const { showCommunityExtensions, language } = preferences.values;
  const [firstBehaviorIds, setFirstBehaviorIds] = React.useState<Array<string>>(
    []
  );
  const [loadedLanguage, setLoadedLanguage] = React.useState<?string>(null);
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const [searchText, setSearchText] = React.useState(
    defaultSearchText || emptySearchText
  );
  const [chosenCategory, setChosenCategory] = React.useState('');
  const filtersState = useFilters();

  const fetchBehaviors = React.useCallback(
    () => {
      // Don't attempt to load again resources and filters if they
      // were loaded already.
      if (
        (Object.keys(translatedBehaviorShortHeadersByType).length &&
          loadedLanguage === language) ||
        isLoading.current
      )
        return;

      (async () => {
        setError(null);
        // Reset the search text to avoid showing the previous search results
        // in case they were on a different language.
        setSearchText(emptySearchText);
        isLoading.current = true;

        try {
          const behaviorsRegistry: BehaviorsRegistry = await getBehaviorsRegistry();
          const behaviorShortHeaders = behaviorsRegistry.headers;

          const translatedBehaviorShortHeadersByType = {};
          behaviorShortHeaders.forEach(behaviorShortHeader => {
            const translatedBehaviorShortHeader: BehaviorShortHeader = {
              ...behaviorShortHeader,
              fullName: i18n._(behaviorShortHeader.fullName),
              description: i18n._(behaviorShortHeader.description),
            };
            translatedBehaviorShortHeadersByType[
              behaviorShortHeader.type
            ] = translatedBehaviorShortHeader;
          });

          console.info(
            `Loaded ${
              behaviorShortHeaders ? behaviorShortHeaders.length : 0
            } behaviors from the extension store.`
          );
          setTranslatedBehaviorShortHeadersByType(
            translatedBehaviorShortHeadersByType
          );
          setLoadedLanguage(language);
          setFirstBehaviorIds(
            behaviorsRegistry.views.default.firstIds.map(
              ({ extensionName, behaviorName }) =>
                gd.PlatformExtension.getBehaviorFullType(
                  extensionName,
                  behaviorName
                )
            )
          );
        } catch (error) {
          console.error(
            `Unable to load the behaviors from the extension store:`,
            error
          );
          setError(error);
        }

        isLoading.current = false;
      })();
    },
    [
      translatedBehaviorShortHeadersByType,
      isLoading,
      i18n,
      language,
      loadedLanguage,
    ]
  );

  React.useEffect(
    () => {
      // Don't attempt to load again extensions and filters if they
      // were loaded already.
      if (
        (Object.keys(translatedBehaviorShortHeadersByType).length &&
          loadedLanguage === language) ||
        isLoading.current
      )
        return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching behaviors from extension store...');
        fetchBehaviors();
      }, BEHAVIORS_FETCH_TIMEOUT);
      return () => clearTimeout(timeoutId);
    },
    [
      fetchBehaviors,
      translatedBehaviorShortHeadersByType,
      isLoading,
      language,
      loadedLanguage,
    ]
  );

  const allTranslatedBehaviors = React.useMemo(
    () => {
      const allTranslatedBehaviors: {
        [name: string]: BehaviorShortHeader,
      } = {};
      for (const type in translatedBehaviorShortHeadersByType) {
        allTranslatedBehaviors[type] =
          translatedBehaviorShortHeadersByType[type];
      }
      for (const installedBehaviorMetadata of installedBehaviorMetadataList) {
        allTranslatedBehaviors[
          installedBehaviorMetadata.type
        ] = installedBehaviorMetadata;
      }
      return allTranslatedBehaviors;
    },
    [installedBehaviorMetadataList, translatedBehaviorShortHeadersByType]
  );

  const allCategories = React.useMemo(
    () => {
      const categoriesSet = new Set();
      for (const type in allTranslatedBehaviors) {
        categoriesSet.add(allTranslatedBehaviors[type].category);
      }
      const sortedCategories = [...categoriesSet].sort((tag1, tag2) =>
        tag1.toLowerCase().localeCompare(tag2.toLowerCase())
      );
      return sortedCategories;
    },
    [allTranslatedBehaviors]
  );

  const filters = React.useMemo(
    () => {
      const tagsSet = new Set();
      for (const type in allTranslatedBehaviors) {
        const behavior = allTranslatedBehaviors[type];
        behavior.tags.forEach(tag => {
          if (
            showCommunityExtensions ||
            !behavior.tier ||
            !excludedCommunityTiers.has(behavior.tier)
          ) {
            tagsSet.add(tag);
          }
        });
      }
      const sortedTags = [...tagsSet].sort((tag1, tag2) =>
        tag1.toLowerCase().localeCompare(tag2.toLowerCase())
      );
      return {
        allTags: sortedTags,
        defaultTags: sortedTags,
        tagsTree: [],
      };
    },
    [allTranslatedBehaviors, showCommunityExtensions]
  );

  const defaultFirstSearchItemIds = React.useMemo(
    () => [
      ...installedBehaviorMetadataList.map(behavior => behavior.type),
      ...firstBehaviorIds,
    ],
    [firstBehaviorIds, installedBehaviorMetadataList]
  );

  const searchResults: ?Array<
    SearchResult<BehaviorShortHeader>
  > = useSearchStructuredItem(allTranslatedBehaviors, {
    searchText,
    chosenItemCategory: chosenCategory,
    chosenCategory: filtersState.chosenCategory,
    chosenFilters: filtersState.chosenFilters,
    excludedTiers: showCommunityExtensions
      ? noExcludedTiers
      : excludedCommunityTiers,
    defaultFirstSearchItemIds: defaultFirstSearchItemIds,
  });

  const behaviorStoreState = React.useMemo(
    () => ({
      searchResults,
      fetchBehaviors,
      filters,
      allCategories,
      chosenCategory,
      setChosenCategory,
      error,
      searchText,
      setSearchText,
      setInstalledBehaviorMetadataList,
      translatedBehaviorShortHeadersByType,
      filtersState,
    }),
    [
      searchResults,
      error,
      filters,
      allCategories,
      chosenCategory,
      setChosenCategory,
      searchText,
      setInstalledBehaviorMetadataList,
      translatedBehaviorShortHeadersByType,
      filtersState,
      fetchBehaviors,
    ]
  );

  return (
    <BehaviorStoreContext.Provider value={behaviorStoreState}>
      {children}
    </BehaviorStoreContext.Provider>
  );
};
