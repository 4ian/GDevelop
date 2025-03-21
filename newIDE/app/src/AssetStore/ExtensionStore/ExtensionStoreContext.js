// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type FiltersState, useFilters } from '../../UI/Search/FiltersChooser';
import {
  getExtensionsRegistry,
  type ExtensionsRegistry,
  type ExtensionShortHeader,
} from '../../Utils/GDevelopServices/Extension';
import { type Filters } from '../../Utils/GDevelopServices/Filters';
import {
  useSearchStructuredItem,
  type SearchResult,
} from '../../UI/Search/UseSearchStructuredItem';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { EXTENSIONS_FETCH_TIMEOUT } from '../../Utils/GlobalFetchTimeouts';

const emptySearchText = '';

const noExcludedTiers = new Set();
const excludedCommunityTiers = new Set(['community']);

type ExtensionStoreState = {|
  filters: ?Filters,
  searchResults: ?Array<SearchResult<ExtensionShortHeader>>,
  fetchExtensionsAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  allCategories: string[],
  chosenCategory: string,
  setChosenCategory: string => void,
  translatedExtensionShortHeadersByName: {
    [name: string]: ExtensionShortHeader,
  },
  filtersState: FiltersState,
  hasExtensionNamed: (extensionName: string) => boolean,
|};

export const ExtensionStoreContext = React.createContext<ExtensionStoreState>({
  filters: null,
  searchResults: null,
  fetchExtensionsAndFilters: () => {},
  error: null,
  searchText: '',
  setSearchText: () => {},
  allCategories: [],
  // '' means all categories.
  chosenCategory: '',
  setChosenCategory: () => {},
  translatedExtensionShortHeadersByName: {},
  filtersState: {
    chosenFilters: new Set(),
    addFilter: () => {},
    removeFilter: () => {},
    chosenCategory: null,
    setChosenCategory: () => {},
  },
  hasExtensionNamed: () => false,
});

type ExtensionStoreStateProviderProps = {|
  children: React.Node,
  i18n: I18nType,
  defaultSearchText?: string,
|};

export const ExtensionStoreStateProvider = ({
  children,
  i18n,
  defaultSearchText,
}: ExtensionStoreStateProviderProps) => {
  const [
    translatedExtensionShortHeadersByName,
    setTranslatedExtensionShortHeadersByName,
  ] = React.useState<{
    [string]: ExtensionShortHeader,
  }>({});
  const preferences = React.useContext(PreferencesContext);
  const { showCommunityExtensions, language } = preferences.values;
  const [firstExtensionIds, setFirstExtensionIds] = React.useState<
    Array<string>
  >([]);
  const [loadedLanguage, setLoadedLanguage] = React.useState<?string>(null);
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const [searchText, setSearchText] = React.useState(
    defaultSearchText || emptySearchText
  );
  const [chosenCategory, setChosenCategory] = React.useState('');
  const filtersState = useFilters();

  const fetchExtensionsAndFilters = React.useCallback(
    () => {
      // Don't attempt to load again resources and filters if they
      // are loading or were loaded already in the current language.
      if (
        (Object.keys(translatedExtensionShortHeadersByName).length &&
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
          const extensionRegistry: ExtensionsRegistry = await getExtensionsRegistry();
          const { headers } = extensionRegistry;

          const translatedExtensionShortHeadersByName = {};
          headers.forEach(extensionShortHeader => {
            const translatedExtensionShortHeader: ExtensionShortHeader = {
              ...extensionShortHeader,
              fullName: i18n._(extensionShortHeader.fullName),
              shortDescription: i18n._(extensionShortHeader.shortDescription),
            };
            translatedExtensionShortHeadersByName[
              extensionShortHeader.name
            ] = translatedExtensionShortHeader;
          });

          console.info(
            `Loaded ${
              headers ? headers.length : 0
            } extensions from the extension store.`
          );
          setTranslatedExtensionShortHeadersByName(
            translatedExtensionShortHeadersByName
          );
          setLoadedLanguage(language);
          setFirstExtensionIds(extensionRegistry.views.default.firstIds);
        } catch (error) {
          console.error(
            `Unable to load the extensions from the extension store:`,
            error
          );
          setError(error);
        }

        isLoading.current = false;
      })();
    },
    [
      translatedExtensionShortHeadersByName,
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
        (Object.keys(translatedExtensionShortHeadersByName).length &&
          loadedLanguage === language) ||
        isLoading.current
      )
        return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching extensions from extension store...');
        fetchExtensionsAndFilters();
      }, EXTENSIONS_FETCH_TIMEOUT);
      return () => clearTimeout(timeoutId);
    },
    [
      fetchExtensionsAndFilters,
      translatedExtensionShortHeadersByName,
      isLoading,
      language,
      loadedLanguage,
    ]
  );

  const allCategories = React.useMemo(
    () => {
      const categoriesSet = new Set();
      for (const name in translatedExtensionShortHeadersByName) {
        categoriesSet.add(translatedExtensionShortHeadersByName[name].category);
      }
      const sortedCategories = [...categoriesSet].sort((tag1, tag2) =>
        tag1.toLowerCase().localeCompare(tag2.toLowerCase())
      );
      return sortedCategories;
    },
    [translatedExtensionShortHeadersByName]
  );

  const filters = React.useMemo(
    () => {
      const tagsSet = new Set();
      for (const name in translatedExtensionShortHeadersByName) {
        translatedExtensionShortHeadersByName[name].tags.forEach(tag =>
          tagsSet.add(tag)
        );
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
    [translatedExtensionShortHeadersByName]
  );

  const searchResults: ?Array<
    SearchResult<ExtensionShortHeader>
  > = useSearchStructuredItem(translatedExtensionShortHeadersByName, {
    searchText,
    chosenItemCategory: chosenCategory,
    chosenCategory: filtersState.chosenCategory,
    chosenFilters: filtersState.chosenFilters,
    excludedTiers: showCommunityExtensions
      ? noExcludedTiers
      : excludedCommunityTiers,
    defaultFirstSearchItemIds: firstExtensionIds,
  });

  const hasExtensionNamed = React.useCallback(
    (extensionName: string) => {
      return !!translatedExtensionShortHeadersByName[extensionName];
    },
    [translatedExtensionShortHeadersByName]
  );

  const extensionStoreState = React.useMemo(
    () => ({
      searchResults,
      fetchExtensionsAndFilters,
      filters,
      allCategories,
      chosenCategory,
      setChosenCategory,
      error,
      searchText,
      setSearchText,
      translatedExtensionShortHeadersByName,
      filtersState,
      hasExtensionNamed,
    }),
    [
      searchResults,
      error,
      filters,
      allCategories,
      chosenCategory,
      setChosenCategory,
      searchText,
      translatedExtensionShortHeadersByName,
      filtersState,
      fetchExtensionsAndFilters,
      hasExtensionNamed,
    ]
  );

  return (
    <ExtensionStoreContext.Provider value={extensionStoreState}>
      {children}
    </ExtensionStoreContext.Provider>
  );
};
