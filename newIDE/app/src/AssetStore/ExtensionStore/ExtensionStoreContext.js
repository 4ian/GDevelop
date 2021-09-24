// @flow
import * as React from 'react';
import { type FiltersState, useFilters } from '../../UI/Search/FiltersChooser';
import {
  getExtensionsRegistry,
  type ExtensionsRegistry,
  type ExtensionShortHeader,
} from '../../Utils/GDevelopServices/Extension';
import { type Filters } from '../../Utils/GDevelopServices/Filters';
import { useSearchItem } from '../../UI/Search/UseSearchItem';

const defaultSearchText = '';

type ExtensionStoreState = {|
  filters: ?Filters,
  searchResults: ?Array<ExtensionShortHeader>,
  fetchExtensionsAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  filtersState: FiltersState,
|};

export const ExtensionStoreContext = React.createContext<ExtensionStoreState>({
  filters: null,
  searchResults: null,
  fetchExtensionsAndFilters: () => {},
  error: null,
  searchText: '',
  setSearchText: () => {},
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
|};

const getExtensionSearchTerms = (extension: ExtensionShortHeader) => {
  return (
    extension.name +
    '\n' +
    extension.shortDescription +
    '\n' +
    extension.tags.join(',')
  );
};

export const ExtensionStoreStateProvider = ({
  children,
}: ExtensionStoreStateProviderProps) => {
  const [
    extensionShortHeadersByName,
    setExtensionShortHeadersByName,
  ] = React.useState<?{
    [string]: ExtensionShortHeader,
  }>(null);
  const [filters, setFilters] = React.useState<?Filters>(null);
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const [searchText, setSearchText] = React.useState(defaultSearchText);
  const filtersState = useFilters();

  const fetchExtensionsAndFilters = React.useCallback(
    () => {
      // Don't attempt to load again resources and filters if they
      // were loaded already.
      if (extensionShortHeadersByName || isLoading.current) return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const extensionRegistry: ExtensionsRegistry = await getExtensionsRegistry();
          const { extensionShortHeaders, allTags } = extensionRegistry;

          const sortedTags = allTags
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
      if (extensionShortHeadersByName || isLoading.current) return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching extensions from extension store...');
        fetchExtensionsAndFilters();
      }, 5000);
      return () => clearTimeout(timeoutId);
    },
    [fetchExtensionsAndFilters, extensionShortHeadersByName, isLoading]
  );

  const { chosenCategory, chosenFilters } = filtersState;
  const searchResults: ?Array<ExtensionShortHeader> = useSearchItem(
    extensionShortHeadersByName,
    getExtensionSearchTerms,
    searchText,
    chosenCategory,
    chosenFilters
  );

  const extensionStoreState = React.useMemo(
    () => ({
      searchResults,
      fetchExtensionsAndFilters,
      filters,
      error,
      searchText,
      setSearchText,
      filtersState,
    }),
    [
      searchResults,
      error,
      filters,
      searchText,
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
