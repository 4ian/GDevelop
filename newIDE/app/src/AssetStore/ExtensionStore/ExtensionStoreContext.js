// @flow
import * as React from 'react';
import { type FiltersState, useFilters } from '../../UI/Search/FiltersChooser';
import {
  getExtensionsRegistry,
  type ExtensionsRegistry,
  type ExtensionShortHeader,
} from '../../Utils/GDevelopServices/Extension';
import { type Filters } from '../../Utils/GDevelopServices/Filters';
import {
  useSearchStructuredItem,
  type SearchMatch,
} from '../../UI/Search/UseSearchStructuredItem';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';

const emptySearchText = '';

const noExcludedTiers = new Set();
const excludedCommunityTiers = new Set(['community']);

type ExtensionStoreState = {|
  filters: ?Filters,
  searchResults: ?Array<{|
    item: ExtensionShortHeader,
    matches: SearchMatch[],
  |}>,
  fetchExtensionsAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  allCategories: string[],
  chosenCategory: string,
  setChosenCategory: string => void,
  extensionShortHeadersByName: { [name: string]: ExtensionShortHeader },
  filtersState: FiltersState,
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
  extensionShortHeadersByName: {},
  filtersState: {
    chosenFilters: new Set(),
    addFilter: () => {},
    removeFilter: () => {},
    chosenCategory: null,
    setChosenCategory: () => {},
  },
});

type ExtensionStoreStateProviderProps = {|
  children: React.Node,
  defaultSearchText?: string,
|};

export const ExtensionStoreStateProvider = ({
  children,
  defaultSearchText,
}: ExtensionStoreStateProviderProps) => {
  const [
    extensionShortHeadersByName,
    setExtensionShortHeadersByName,
  ] = React.useState<{
    [string]: ExtensionShortHeader,
  }>({});
  const preferences = React.useContext(PreferencesContext);
  const { showCommunityExtensions } = preferences.values;
  const [filters, setFilters] = React.useState<?Filters>(null);
  const [allCategories, setAllCategories] = React.useState<Array<string>>([]);
  const [firstExtensionIds, setFirstExtensionIds] = React.useState<
    Array<string>
  >([]);
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
      // were loaded already.
      if (Object.keys(extensionShortHeadersByName).length || isLoading.current)
        return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const extensionRegistry: ExtensionsRegistry = await getExtensionsRegistry();
          const {
            extensionShortHeaders,
            allTags,
            allCategories,
          } = extensionRegistry;

          const sortedTags = allTags
            .slice()
            .sort((tag1, tag2) =>
              tag1.toLowerCase().localeCompare(tag2.toLowerCase())
            );
          const sortedCategories = allCategories
            .slice()
            .sort((tag1, tag2) =>
              tag1.toLowerCase().localeCompare(tag2.toLowerCase())
            );

          const extensionShortHeadersByName = {};
          extensionShortHeaders.forEach(extension => {
            extensionShortHeadersByName[extension.name] = extension;
          });

          console.info(
            `Loaded ${
              extensionShortHeaders.length
            } extensions from the extension store.`
          );
          setExtensionShortHeadersByName(extensionShortHeadersByName);
          setFilters({
            allTags: sortedTags,
            defaultTags: sortedTags,
            tagsTree: [],
          });
          setAllCategories(sortedCategories);
          setFirstExtensionIds(
            extensionRegistry.views
              ? extensionRegistry.views.default.firstExtensionIds
              : []
          );
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
    [extensionShortHeadersByName, isLoading]
  );

  React.useEffect(
    () => {
      // Don't attempt to load again extensions and filters if they
      // were loaded already.
      if (Object.keys(extensionShortHeadersByName).length || isLoading.current)
        return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching extensions from extension store...');
        fetchExtensionsAndFilters();
      }, 5000);
      return () => clearTimeout(timeoutId);
    },
    [fetchExtensionsAndFilters, extensionShortHeadersByName, isLoading]
  );

  const searchResults: ?Array<{|
    item: ExtensionShortHeader,
    matches: SearchMatch[],
  |}> = useSearchStructuredItem(extensionShortHeadersByName, {
    searchText,
    chosenItemCategory: chosenCategory,
    chosenCategory: filtersState.chosenCategory,
    chosenFilters: filtersState.chosenFilters,
    excludedTiers: showCommunityExtensions
      ? noExcludedTiers
      : excludedCommunityTiers,
    defaultFirstSearchItemIds: firstExtensionIds,
  });

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
      extensionShortHeadersByName,
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
      extensionShortHeadersByName,
      filtersState,
      fetchExtensionsAndFilters,
    ]
  );

  return (
    <ExtensionStoreContext.Provider value={extensionStoreState}>
      {children}
    </ExtensionStoreContext.Provider>
  );
};
