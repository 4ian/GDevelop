// @flow
import * as React from 'react';
import { type FiltersState, useFilters } from '../../UI/Search/FiltersChooser';
import {
  type Resource,
  type Author,
  type License,
  listAllAuthors,
  listAllLicenses,
  listAllResources,
} from '../../Utils/GDevelopServices/Asset';
import { type Filters } from '../../Utils/GDevelopServices/Filters';
import { useSearchItem } from '../../UI/Search/UseSearchItem';
import { AssetStoreContext } from '../AssetStoreContext';

const defaultSearchText = '';

type ResourceStoreState = {|
  filters: ?Filters,
  authors: ?Array<Author>,
  licenses: ?Array<License>,
  searchResults: ?Array<Resource>,
  fetchResourcesAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  filtersState: FiltersState,
|};

export const ResourceStoreContext = React.createContext<ResourceStoreState>({
  filters: null,
  authors: null,
  licenses: null,
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
  const [authors, setAuthors] = React.useState<?Array<Author>>(null);
  const [licenses, setLicenses] = React.useState<?Array<License>>(null);
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const [searchText, setSearchText] = React.useState(defaultSearchText);
  const filtersState = useFilters();

  const { environment } = React.useContext(AssetStoreContext);

  const fetchResourcesAndFilters = React.useCallback(
    () => {
      // Don't attempt to load again resources and filters if they
      // were loaded already.
      if (resourcesByUrl || isLoading.current) return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const { resources, filters } = await listAllResources({
            environment,
          });
          const authors = await listAllAuthors({ environment });
          const licenses = await listAllLicenses({ environment });

          const resourcesByUrl = {};
          resources.forEach(resource => {
            resourcesByUrl[resource.url] = resource;
          });

          console.info(
            `Loaded ${
              resources ? resources.length : 0
            } resources from the asset store.`
          );
          setResourcesByUrl(resourcesByUrl);
          setFilters(filters);
          setAuthors(authors);
          setLicenses(licenses);
        } catch (error) {
          console.error(
            `Unable to load the assets from the asset store:`,
            error
          );
          setError(error);
        }

        isLoading.current = false;
      })();
    },
    [resourcesByUrl, isLoading, environment]
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
      authors,
      licenses,
      error,
      searchText,
      setSearchText,
      filtersState,
    }),
    [
      searchResults,
      error,
      filters,
      authors,
      licenses,
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
