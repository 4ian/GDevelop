// @flow
import * as React from 'react';
import { type FiltersState, useFilters } from '../../UI/Search/FiltersChooser';
import {
  getExtensionsRegistry,
  type ExtensionsRegistry,
  type BehaviorShortHeader,
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

export interface SearchableBehaviorMetadata {
  name: string;
  fullName: string;
  description: string;
  objectType: string;
  previewIconUrl: string;

  category: string;
  tags: string[];
}

type BehaviorStoreState = {|
  filters: ?Filters,
  searchResults: ?Array<{|
    item: BehaviorShortHeader | SearchableBehaviorMetadata,
    matches: SearchMatch[],
  |}>,
  fetchExtensionsAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  allCategories: string[],
  chosenCategory: string,
  setChosenCategory: string => void,
  installedBehaviorMetadataByName: {
    [name: string]: SearchableBehaviorMetadata,
  },
  setInstalledBehaviorMetadataByName: ({
    [name: string]: SearchableBehaviorMetadata,
  }) => void,
  behaviorShortHeadersByName: { [name: string]: BehaviorShortHeader },
  filtersState: FiltersState,
  hasBehaviorNamed: (behaviorName: string) => boolean,
|};

export const BehaviorStoreContext = React.createContext<BehaviorStoreState>({
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
  installedBehaviorMetadataByName: {},
  setInstalledBehaviorMetadataByName: () => {},
  behaviorShortHeadersByName: {},
  filtersState: {
    chosenFilters: new Set(),
    addFilter: () => {},
    removeFilter: () => {},
    chosenCategory: null,
    setChosenCategory: () => {},
  },
  hasBehaviorNamed: () => false,
});

type BehaviorStoreStateProviderProps = {|
  children: React.Node,
  defaultSearchText?: string,
|};

export const BehaviorStoreStateProvider = ({
  children,
  defaultSearchText,
}: BehaviorStoreStateProviderProps) => {
  const [
    installedBehaviorMetadataByName,
    setInstalledBehaviorMetadataByName,
  ] = React.useState<{
    [string]: SearchableBehaviorMetadata,
  }>({});
  const [
    behaviorShortHeadersByName,
    setBehaviorShortHeadersByName,
  ] = React.useState<{
    [string]: BehaviorShortHeader,
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
      if (Object.keys(behaviorShortHeadersByName).length || isLoading.current)
        return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const extensionRegistry: ExtensionsRegistry = await getExtensionsRegistry();
          const { allTags, allCategories } = extensionRegistry;
          const behaviorShortHeaders = extensionRegistry.behavior.headers;

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

          const behaviorShortHeadersByName = {};
          behaviorShortHeaders.forEach(behavior => {
            behaviorShortHeadersByName[behavior.name] = behavior;
          });

          console.info(
            `Loaded ${
              behaviorShortHeaders ? behaviorShortHeaders.length : 0
            } extensions from the extension store.`
          );
          setBehaviorShortHeadersByName(behaviorShortHeadersByName);
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
    [behaviorShortHeadersByName, isLoading]
  );

  React.useEffect(
    () => {
      // Don't attempt to load again extensions and filters if they
      // were loaded already.
      if (Object.keys(behaviorShortHeadersByName).length || isLoading.current)
        return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching extensions from extension store...');
        fetchExtensionsAndFilters();
      }, 5000);
      return () => clearTimeout(timeoutId);
    },
    [fetchExtensionsAndFilters, behaviorShortHeadersByName, isLoading]
  );

  // TODO Use a memo for all the behavior by name.
  /** @type {{[name: string]: BehaviorShortHeader | SearchableBehaviorMetadata}} */
  const allBehaviors = {};
  for (const name in behaviorShortHeadersByName) {
    allBehaviors[name] = behaviorShortHeadersByName[name];
  }
  for (const name in installedBehaviorMetadataByName) {
    allBehaviors[name] = installedBehaviorMetadataByName[name];
  }

  const searchResults: ?Array<{|
    item: BehaviorShortHeader | SearchableBehaviorMetadata,
    matches: SearchMatch[],
  |}> = useSearchStructuredItem(allBehaviors, {
    searchText,
    chosenItemCategory: chosenCategory,
    chosenCategory: filtersState.chosenCategory,
    chosenFilters: filtersState.chosenFilters,
    excludedTiers: showCommunityExtensions
      ? noExcludedTiers
      : excludedCommunityTiers,
    defaultFirstSearchItemIds: firstExtensionIds,
  });

  const hasBehaviorNamed = React.useCallback(
    (extensionName: string) => {
      return !!behaviorShortHeadersByName[extensionName];
    },
    [behaviorShortHeadersByName]
  );

  const behaviorStoreState = React.useMemo(
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
      installedBehaviorMetadataByName,
      setInstalledBehaviorMetadataByName,
      behaviorShortHeadersByName,
      filtersState,
      hasBehaviorNamed,
    }),
    [
      searchResults,
      error,
      filters,
      allCategories,
      chosenCategory,
      setChosenCategory,
      searchText,
      installedBehaviorMetadataByName,
      setInstalledBehaviorMetadataByName,
      behaviorShortHeadersByName,
      filtersState,
      fetchExtensionsAndFilters,
      hasBehaviorNamed,
    ]
  );

  return (
    <BehaviorStoreContext.Provider value={behaviorStoreState}>
      {children}
    </BehaviorStoreContext.Provider>
  );
};
