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
import { diff } from 'semver/functions/diff';

const defaultSearchText = '';

type UpdateMetadata = {|
  type: 'patch' | 'minor' | 'major',
  currentVersion: string,
  newestVersion: string,
|};
type UpdateState = Map<string, UpdateMetadata>;
type ExtensionStoreState = {|
  filters: ?Filters,
  searchResults: ?Array<ExtensionShortHeader>,
  fetchExtensionsAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  filtersState: FiltersState,
  updateState: UpdateState,
  allExtensionsShortHeaders: ?{
    [string]: ExtensionShortHeader,
  },
  installedExtensions: Set<string>,
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
  updateState: new Map(),
  allExtensionsShortHeaders: null,
  installedExtensions: new Set(),
});

type ExtensionStoreStateProviderProps = {|
  children: React.Node,
  extensionsList?: Array<gdEventsFunctionsExtension>,
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
  extensionsList,
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

  const [updateState, setUpdateState] = React.useState<UpdateState>(new Map());
  React.useEffect(
    () => {
      // Wait for the extensions and extenionsList to be loaded
      if (!(extensionShortHeadersByName && extensionsList)) return;

      // Rebuild an update state
      const newState = new Map<string, UpdateMetadata>();
      for (const extension of extensionsList) {
        const name = extension.getName();
        const header = extensionShortHeadersByName[name];
        if (!header) continue;
        const currentVersion = extension.getVersion();
        const newestVersion = header.version;
        try {
          const versionDiff = diff(currentVersion, newestVersion);
          if (['patch', 'minor', 'major'].includes(versionDiff)) {
            newState.set(name, {
              type: versionDiff,
              currentVersion,
              newestVersion,
            });
          }
        } catch {
          // An error will be thrown here only if the version does not respect semver.
          // Simply compare the strings for such extensions.
          if (currentVersion !== newestVersion)
            newState.set(name, {
              // Use minor as it is the most neutral option
              type: 'minor',
              currentVersion,
              newestVersion,
            });
        }
      }

      setUpdateState(newState);
    },
    [extensionShortHeadersByName, extensionsList]
  );

  const { chosenCategory, chosenFilters } = filtersState;
  const searchResults: ?Array<ExtensionShortHeader> = useSearchItem(
    extensionShortHeadersByName,
    getExtensionSearchTerms,
    searchText,
    chosenCategory,
    chosenFilters
  );

  const installedExtensions = React.useMemo(
    () =>
      extensionsList
        ? new Set(extensionsList.map(e => e.getName()))
        : new Set(),
    [extensionsList]
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
      updateState,
      allExtensionsShortHeaders: extensionShortHeadersByName,
      installedExtensions,
    }),
    [
      searchResults,
      error,
      filters,
      searchText,
      filtersState,
      fetchExtensionsAndFilters,
      updateState,
      extensionShortHeadersByName,
      installedExtensions,
    ]
  );

  return (
    <ExtensionStoreContext.Provider value={extensionStoreState}>
      {children}
    </ExtensionStoreContext.Provider>
  );
};
