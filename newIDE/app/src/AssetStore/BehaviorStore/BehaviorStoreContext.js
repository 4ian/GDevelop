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

const gd: libGDevelop = global.gd;

const emptySearchText = '';

const noExcludedTiers = new Set();
const excludedCommunityTiers = new Set(['community']);

export type SearchableBehaviorMetadata = {|
  extensionNamespace: string,
  name: string,
  fullName: string,
  description: string,
  objectType: string,
  previewIconUrl: string,
  category: string,
  tags: string[],
  type: string,
|};

type BehaviorStoreState = {|
  filters: ?Filters,
  searchResults: ?Array<{|
    item: BehaviorShortHeader | SearchableBehaviorMetadata,
    matches: SearchMatch[],
  |}>,
  fetchBehaviorsAndFilters: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  allCategories: string[],
  chosenCategory: string,
  setChosenCategory: string => void,
  installedBehaviorMetadataByType: {
    [name: string]: SearchableBehaviorMetadata,
  },
  setInstalledBehaviorMetadataByType: ({
    [name: string]: SearchableBehaviorMetadata,
  }) => void,
  behaviorShortHeadersByType: { [name: string]: BehaviorShortHeader },
  filtersState: FiltersState,
  hasBehaviorNamed: (behaviorName: string) => boolean,
|};

export const BehaviorStoreContext = React.createContext<BehaviorStoreState>({
  filters: null,
  searchResults: null,
  fetchBehaviorsAndFilters: () => {},
  error: null,
  searchText: '',
  setSearchText: () => {},
  allCategories: [],
  // '' means all categories.
  chosenCategory: '',
  setChosenCategory: () => {},
  installedBehaviorMetadataByType: {},
  setInstalledBehaviorMetadataByType: () => {},
  behaviorShortHeadersByType: {},
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
  console.log("BehaviorStoreStateProvider");
  const [
    installedBehaviorMetadataByType,
    setInstalledBehaviorMetadataByType,
  ] = React.useState<{
    [string]: SearchableBehaviorMetadata,
  }>({});
  const [
    behaviorShortHeadersByType,
    setBehaviorShortHeadersByType,
  ] = React.useState<{
    [string]: BehaviorShortHeader,
  }>({});

  const preferences = React.useContext(PreferencesContext);
  const { showCommunityExtensions } = preferences.values;
  const [filters, setFilters] = React.useState<?Filters>(null);
  const [allCategories, setAllCategories] = React.useState<Array<string>>([]);
  const [firstBehaviorIds, setFirstBehaviorIds] = React.useState<Array<string>>(
    []
  );
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const [searchText, setSearchText] = React.useState(
    defaultSearchText || emptySearchText
  );
  const [chosenCategory, setChosenCategory] = React.useState('');
  const filtersState = useFilters();

  const fetchBehaviorsAndFilters = React.useCallback(
    () => {
      // Don't attempt to load again resources and filters if they
      // were loaded already.
      if (Object.keys(behaviorShortHeadersByType).length || isLoading.current)
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

          const behaviorShortHeadersByType = {};
          behaviorShortHeaders.forEach(behavior => {
            behaviorShortHeadersByType[behavior.type] = behavior;
          });

          console.info(
            `Loaded ${
              behaviorShortHeaders ? behaviorShortHeaders.length : 0
            } behaviors from the extension store.`
          );
          setBehaviorShortHeadersByType(behaviorShortHeadersByType);
          setFilters({
            allTags: sortedTags,
            defaultTags: sortedTags,
            tagsTree: [],
          });
          setAllCategories(sortedCategories);
          setFirstBehaviorIds(
            extensionRegistry.views
              ? extensionRegistry.views.default.firstBehaviorIds.map(
                  ({ extensionName, behaviorName }) =>
                    gd.PlatformExtension.getBehaviorFullType(
                      extensionName,
                      behaviorName
                    )
                )
              : []
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
    [behaviorShortHeadersByType, isLoading]
  );

  React.useEffect(
    () => {
      // Don't attempt to load again extensions and filters if they
      // were loaded already.
      if (Object.keys(behaviorShortHeadersByType).length || isLoading.current)
        return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching behaviors from extension store...');
        fetchBehaviorsAndFilters();
      }, 5000);
      return () => clearTimeout(timeoutId);
    },
    [fetchBehaviorsAndFilters, behaviorShortHeadersByType, isLoading]
  );

  const allBehaviors = React.useMemo(
    () => {
      /** @type {{[name: string]: BehaviorShortHeader | SearchableBehaviorMetadata}} */
      const allBehaviors = {};
      console.log('Installed behaviors:');
      for (const type in installedBehaviorMetadataByType) {
        allBehaviors[type] = installedBehaviorMetadataByType[type];
        console.log(allBehaviors[type]);
      }
      for (const type in behaviorShortHeadersByType) {
        allBehaviors[type] = behaviorShortHeadersByType[type];
      }
      console.log('All behaviors:');
      console.log(allBehaviors);
      return allBehaviors;
    },
    [installedBehaviorMetadataByType, behaviorShortHeadersByType]
  );

  const defaultFirstSearchItemIds = React.useMemo(
    () => [
      ...Object.keys(installedBehaviorMetadataByType),
      ...firstBehaviorIds,
    ],
    [firstBehaviorIds, installedBehaviorMetadataByType]
  );

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
    defaultFirstSearchItemIds: defaultFirstSearchItemIds,
  });

  const hasBehaviorNamed = React.useCallback(
    (extensionName: string) => {
      return !!behaviorShortHeadersByType[extensionName];
    },
    [behaviorShortHeadersByType]
  );

  const behaviorStoreState = React.useMemo(
    () => ({
      searchResults,
      fetchBehaviorsAndFilters,
      filters,
      allCategories,
      chosenCategory,
      setChosenCategory,
      error,
      searchText,
      setSearchText,
      setInstalledBehaviorMetadataByType,
      behaviorShortHeadersByType,
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
      setInstalledBehaviorMetadataByType,
      behaviorShortHeadersByType,
      filtersState,
      fetchBehaviorsAndFilters,
      hasBehaviorNamed,
    ]
  );

  return (
    <BehaviorStoreContext.Provider value={behaviorStoreState}>
      {children}
    </BehaviorStoreContext.Provider>
  );
};
