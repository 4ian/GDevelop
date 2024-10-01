// @flow
import * as React from 'react';
import {
  type ResourceV2,
  type AudioResourceV2,
  type Author,
  type License,
  listAllAuthors,
  listAllLicenses,
  listAllResources,
} from '../../Utils/GDevelopServices/Asset';
import { type Filters } from '../../Utils/GDevelopServices/Filters';
import { useSearchItem } from '../../UI/Search/UseSearchItem';
import { AssetStoreContext } from '../AssetStoreContext';
import {
  AudioTypeResourceStoreSearchFilter,
  DurationResourceStoreSearchFilter,
} from './ResourceStoreSearchFilter';
import type { SearchFilter } from '../../UI/Search/UseSearchItem';

const defaultSearchText = '';

type ResourceStoreState = {|
  filters: ?Filters,
  authors: ?Array<Author>,
  licenses: ?Array<License>,
  searchResults: ?Array<ResourceV2>,
  fetchResourcesAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  clearAllFilters: () => void,
  audioFiltersState: {|
    durationFilter: DurationResourceStoreSearchFilter,
    setDurationFilter: DurationResourceStoreSearchFilter => void,
    audioTypeFilter: AudioTypeResourceStoreSearchFilter,
    setAudioTypeFilter: AudioTypeResourceStoreSearchFilter => void,
  |},
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
  clearAllFilters: () => {},
  audioFiltersState: {
    durationFilter: new DurationResourceStoreSearchFilter(),
    setDurationFilter: DurationResourceStoreSearchFilter => {},
    audioTypeFilter: new AudioTypeResourceStoreSearchFilter(),
    setAudioTypeFilter: AudioTypeResourceStoreSearchFilter => {},
  },
});

type ResourceStoreStateProviderProps = {|
  children: React.Node,
|};

const getResourceSearchTerms = (resource: ResourceV2) => {
  return resource.name + '\n' + resource.tags.join(', ');
};

export const ResourceStoreStateProvider = ({
  children,
}: ResourceStoreStateProviderProps) => {
  const [resourcesByUrl, setResourcesByUrl] = React.useState<?{
    [string]: ResourceV2,
  }>(null);
  const [filters, setFilters] = React.useState<?Filters>(null);
  const [authors, setAuthors] = React.useState<?Array<Author>>(null);
  const [licenses, setLicenses] = React.useState<?Array<License>>(null);
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const [searchText, setSearchText] = React.useState(defaultSearchText);
  const [
    durationFilter,
    setDurationFilter,
  ] = React.useState<DurationResourceStoreSearchFilter>(
    new DurationResourceStoreSearchFilter()
  );
  const [
    audioTypeFilter,
    setAudioTypeFilter,
  ] = React.useState<AudioTypeResourceStoreSearchFilter>(
    new AudioTypeResourceStoreSearchFilter()
  );

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
          const { resourcesV2: resources, filters } = await listAllResources({
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

  const audioFiltersState = React.useMemo(
    () => ({
      durationFilter,
      setDurationFilter,
      audioTypeFilter,
      setAudioTypeFilter,
    }),
    [durationFilter, audioTypeFilter]
  );

  // When one of the filter change, we need to rebuild the array
  // for the search.
  const audioResourceFilters = React.useMemo<
    Array<SearchFilter<AudioResourceV2>>
  >(() => [audioTypeFilter, durationFilter], [audioTypeFilter, durationFilter]);

  const clearAllFilters = React.useCallback(
    () => {
      audioFiltersState.setDurationFilter(
        new DurationResourceStoreSearchFilter()
      );
      audioFiltersState.setAudioTypeFilter(
        new AudioTypeResourceStoreSearchFilter()
      );
    },
    [audioFiltersState]
  );

  const audioSearchResults: ?Array<AudioResourceV2> = useSearchItem(
    resourcesByUrl,
    getResourceSearchTerms,
    searchText,
    null,
    null,
    audioResourceFilters
  );

  const resourceStoreState = React.useMemo(
    () => ({
      searchResults: audioSearchResults,
      fetchResourcesAndFilters,
      filters,
      authors,
      licenses,
      error,
      searchText,
      setSearchText,
      clearAllFilters,
      audioFiltersState,
    }),
    [
      audioSearchResults,
      error,
      filters,
      authors,
      licenses,
      searchText,
      audioFiltersState,
      clearAllFilters,
      fetchResourcesAndFilters,
    ]
  );

  return (
    <ResourceStoreContext.Provider value={resourceStoreState}>
      {children}
    </ResourceStoreContext.Provider>
  );
};
