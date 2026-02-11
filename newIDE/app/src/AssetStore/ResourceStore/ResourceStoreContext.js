// @flow
import * as React from 'react';
import {
  type Resource,
  type ResourceV2,
  type AudioResourceV2,
  type FontResourceV2,
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
  AlphabetSupportResourceStoreSearchFilter,
} from './ResourceStoreSearchFilter';
import type { SearchFilter } from '../../UI/Search/UseSearchItem';
import Link from '../../UI/Link';
import Window from '../../Utils/Window';

export type ResourceKindSupportedByResourceStore = 'audio' | 'font' | 'svg';

const defaultSearchText = '';

type ResourceStoreState = {|
  filters: ?Filters,
  authors: ?Array<Author>,
  licenses: ?Array<License>,
  searchResults: ?(
    | Array<FontResourceV2>
    | Array<AudioResourceV2>
    | Array<Resource>
  ),
  fetchResourcesAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  clearAllFilters: () => void,
  setSearchResourceKind: ResourceKindSupportedByResourceStore => void,
  getAuthorsDisplayLinks: ResourceV2 => React.Node,
  audioFiltersState: {|
    durationFilter: DurationResourceStoreSearchFilter,
    setDurationFilter: DurationResourceStoreSearchFilter => void,
    audioTypeFilter: AudioTypeResourceStoreSearchFilter,
    setAudioTypeFilter: AudioTypeResourceStoreSearchFilter => void,
  |},
  fontFiltersState: {|
    alphabetSupportFilter: AlphabetSupportResourceStoreSearchFilter,
    setAlphabetSupportFilter: AlphabetSupportResourceStoreSearchFilter => void,
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
  setSearchResourceKind: () => {},
  getAuthorsDisplayLinks: () => null,
  audioFiltersState: {
    durationFilter: new DurationResourceStoreSearchFilter(),
    setDurationFilter: DurationResourceStoreSearchFilter => {},
    audioTypeFilter: new AudioTypeResourceStoreSearchFilter(),
    setAudioTypeFilter: AudioTypeResourceStoreSearchFilter => {},
  },
  fontFiltersState: {
    alphabetSupportFilter: new AlphabetSupportResourceStoreSearchFilter(),
    setAlphabetSupportFilter: () => {},
  },
});

type ResourceStoreStateProviderProps = {|
  children: React.Node,
|};

const getResourceSearchTerms = (resource: ResourceV2 | Resource) => {
  return resource.name + '\n' + resource.tags.join(', ');
};

export const ResourceStoreStateProvider = ({
  children,
}: ResourceStoreStateProviderProps) => {
  const [svgResourcesByUrl, setSvgResourcesByUrl] = React.useState<?{
    [string]: Resource,
  }>(null);
  const [fontResourcesByUrl, setFontResourcesByUrl] = React.useState<?{
    [string]: FontResourceV2,
  }>(null);
  const [audioResourcesByUrl, setAudioResourcesByUrl] = React.useState<?{
    [string]: AudioResourceV2,
  }>(null);
  const [filters, setFilters] = React.useState<?Filters>(null);
  const [authors, setAuthors] = React.useState<?Array<Author>>(null);
  const [authorsByAuthorName, setAuthorsByAuthorName] = React.useState<?{
    [authorName: string]: Author,
  }>(null);
  const [licenses, setLicenses] = React.useState<?Array<License>>(null);
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);
  const [
    searchResourceKind,
    setSearchResourceKind,
  ] = React.useState<ResourceKindSupportedByResourceStore>('audio');

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
  const [
    alphabetSupportFilter,
    setAlphabetSupportFilter,
  ] = React.useState<AlphabetSupportResourceStoreSearchFilter>(
    new AlphabetSupportResourceStoreSearchFilter()
  );

  const { environment } = React.useContext(AssetStoreContext);

  const getAuthorsDisplayLinks = React.useCallback(
    (resource: ResourceV2) => {
      if (!authorsByAuthorName) return resource.authors.join(', ');
      return resource.authors.map((authorName: string) => {
        const author = authorsByAuthorName[authorName];
        if (author) {
          const link = authorsByAuthorName[authorName].website;
          return (
            <Link
              key={authorName}
              onClick={() => Window.openExternalURL(link)}
              href={link}
            >
              {authorName}
            </Link>
          );
        }
        return authorName;
      });
    },
    [authorsByAuthorName]
  );

  const fetchResourcesAndFilters = React.useCallback(
    () => {
      // Don't attempt to load again resources and filters if they
      // were loaded already.
      if (
        (svgResourcesByUrl && fontResourcesByUrl && audioResourcesByUrl) ||
        isLoading.current
      ) {
        return;
      }

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const {
            resources: oldResources,
            resourcesV2: resources,
            filters,
          } = await listAllResources({
            environment,
          });
          const authors = await listAllAuthors({ environment });
          const licenses = await listAllLicenses({ environment });

          const svgResourcesByUrl = {};
          const fontResourcesByUrl = {};
          const audioResourcesByUrl = {};
          resources.forEach(resource => {
            if (resource.type === 'font') {
              fontResourcesByUrl[resource.url] = resource;
            } else if (resource.type === 'audio') {
              audioResourcesByUrl[resource.url] = resource;
            }
          });
          oldResources.forEach(resource => {
            if (resource.type === 'svg') {
              svgResourcesByUrl[resource.url] = resource;
            }
          });
          const authorsByAuthorName = {};
          authors.forEach(author => {
            authorsByAuthorName[author.name] = author;
          });

          console.info(
            `Loaded ${
              resources ? resources.length : 0
            } resources from the asset store.`
          );
          setSvgResourcesByUrl(svgResourcesByUrl);
          setFontResourcesByUrl(fontResourcesByUrl);
          setAudioResourcesByUrl(audioResourcesByUrl);
          setFilters(filters);
          setAuthors(authors);
          setAuthorsByAuthorName(authorsByAuthorName);
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
    [
      svgResourcesByUrl,
      audioResourcesByUrl,
      fontResourcesByUrl,
      isLoading,
      environment,
    ]
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

  const fontFiltersState = React.useMemo(
    () => ({ alphabetSupportFilter, setAlphabetSupportFilter }),
    [alphabetSupportFilter]
  );

  // When one of the filter change, we need to rebuild the array
  // for the search.
  const audioResourceFilters = React.useMemo<
    Array<SearchFilter<AudioResourceV2>>
  >(() => [audioTypeFilter, durationFilter], [audioTypeFilter, durationFilter]);
  const fontResourceFilters = React.useMemo<
    Array<SearchFilter<FontResourceV2>>
  >(() => [alphabetSupportFilter], [alphabetSupportFilter]);

  const clearAllFilters = React.useCallback(
    () => {
      audioFiltersState.setDurationFilter(
        new DurationResourceStoreSearchFilter()
      );
      audioFiltersState.setAudioTypeFilter(
        new AudioTypeResourceStoreSearchFilter()
      );
      fontFiltersState.setAlphabetSupportFilter(
        new AlphabetSupportResourceStoreSearchFilter()
      );
    },
    [audioFiltersState, fontFiltersState]
  );

  const audioSearchResults: ?Array<AudioResourceV2> = useSearchItem(
    audioResourcesByUrl,
    getResourceSearchTerms,
    searchText,
    null,
    null,
    audioResourceFilters
  );

  const fontSearchResults: ?Array<FontResourceV2> = useSearchItem(
    fontResourcesByUrl,
    getResourceSearchTerms,
    searchText,
    null,
    null,
    fontResourceFilters
  );

  const svgSearchResults: ?Array<Resource> = useSearchItem(
    svgResourcesByUrl,
    getResourceSearchTerms,
    searchText,
    null,
    null
  );

  const resourceStoreState = React.useMemo(
    () => ({
      searchResults:
        searchResourceKind === 'audio'
          ? audioSearchResults
          : searchResourceKind === 'svg'
          ? svgSearchResults
          : fontSearchResults,
      fetchResourcesAndFilters,
      setSearchResourceKind,
      filters,
      authors,
      licenses,
      error,
      searchText,
      setSearchText,
      clearAllFilters,
      audioFiltersState,
      fontFiltersState,
      getAuthorsDisplayLinks,
    }),
    [
      fontSearchResults,
      audioSearchResults,
      svgSearchResults,
      error,
      filters,
      authors,
      licenses,
      searchText,
      audioFiltersState,
      fontFiltersState,
      clearAllFilters,
      fetchResourcesAndFilters,
      searchResourceKind,
      getAuthorsDisplayLinks,
    ]
  );

  return (
    <ResourceStoreContext.Provider value={resourceStoreState}>
      {children}
    </ResourceStoreContext.Provider>
  );
};
