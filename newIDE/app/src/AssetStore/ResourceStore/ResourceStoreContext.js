// @flow
import * as React from 'react';
import { type FiltersState, useFilters } from '../FiltersChooser';
import {
  type Resource,
  type Filters,
  listAllResources,
} from '../../Utils/GDevelopServices/Asset';
import { useSearchItem } from '../UseSearchItem';

const defaultSearchText = '';

type ResourceStoreState = {|
  filters: ?Filters,
  searchResults: ?Array<Resource>,
  fetchResourcesAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  filtersState: FiltersState,
|};

export const ResourceStoreContext = React.createContext<ResourceStoreState>({
  filters: null,
  searchResults: null,
  fetchResourcesAndFilters: () => {},
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

type ResourceStoreStateProviderProps = {|
  children: React.Node,
|};

const getResourceSearchTerms = (resource: Resource) => {
  return resource.name + '\n' + resource.tags.join(', ');
};

export const ResourceStoreStateProvider = ({
  children,
}: ResourceStoreStateProviderProps) => {
  const [resourcesByUrl, setResourcesByUrl] = React.useState<?{
    [string]: Resource,
  }>(null);
  const [filters, setFilters] = React.useState<?Filters>(null);
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const [searchText, setSearchText] = React.useState(defaultSearchText);
  const filtersState = useFilters();

  const fetchResourcesAndFilters = React.useCallback(
    () => {
      // Don't attempt to load again resources and filters if they
      // were loaded already.
      if (resourcesByUrl || isLoading.current) return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const { resources, filters } = await listAllResources();

          const resourcesByUrl = {};
          resources.forEach(resource => {
            resourcesByUrl[resource.url] = resource;
          });

          console.info(
            `Loaded ${resources.length} resources from the asset store.`
          );
          setResourcesByUrl(resourcesByUrl);
          setFilters(filters);
        } catch (error) {
          setError(error);
        }

        isLoading.current = false;
      })();
    },
    [resourcesByUrl, isLoading]
  );

  React.useEffect(
    () => {
      // Don't attempt to load again resources and filters if they
      // were loaded already.
      if (resourcesByUrl || isLoading.current) return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching resources from asset store...');
        fetchResourcesAndFilters();
      }, 6000);
      return () => clearTimeout(timeoutId);
    },
    [fetchResourcesAndFilters, resourcesByUrl, isLoading]
  );

  const { chosenCategory, chosenFilters } = filtersState;
  const searchResults: ?Array<Resource> = useSearchItem(
    resourcesByUrl,
    getResourceSearchTerms,
    searchText,
    chosenCategory,
    chosenFilters
  );

  const resourceStoreState = React.useMemo(
    () => ({
      searchResults,
      fetchResourcesAndFilters,
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
      fetchResourcesAndFilters,
    ]
  );

  return (
    <ResourceStoreContext.Provider value={resourceStoreState}>
      {children}
    </ResourceStoreContext.Provider>
  );
};
