// @flow
import * as React from 'react';
import { type FiltersState, useFilters } from '../../UI/Search/FiltersChooser';
import {
  getBehaviorsRegistry,
  type BehaviorsRegistry,
  type BehaviorShortHeader,
} from '../../Utils/GDevelopServices/Extension';
import { type Filters } from '../../Utils/GDevelopServices/Filters';
import {
  useSearchStructuredItem,
  type SearchMatch,
} from '../../UI/Search/UseSearchStructuredItem';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { BEHAVIORS_FETCH_TIMEOUT } from '../../Utils/GlobalFetchTimeouts';

const gd: libGDevelop = global.gd;

const emptySearchText = '';

const noExcludedTiers = new Set();
const excludedCommunityTiers = new Set(['community']);

export type SearchableBehaviorMetadata = {|
  type: string,
  fullName: string,
  description: string,
  objectType: string,
  /**
   * All required behaviors including transitive ones.
   */
  allRequiredBehaviorTypes: Array<string>,
  previewIconUrl: string,
  category: string,
  tags: string[],
  isDeprecated?: boolean,
|};

type BehaviorStoreState = {|
  filters: ?Filters,
  searchResults: ?Array<{|
    item: BehaviorShortHeader | SearchableBehaviorMetadata,
    matches: SearchMatch[],
  |}>,
  fetchBehaviors: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  allCategories: string[],
  chosenCategory: string,
  setChosenCategory: string => void,
  setInstalledBehaviorMetadataList: (
    installedBehaviorMetadataList: Array<SearchableBehaviorMetadata>
  ) => void,
  behaviorShortHeadersByType: { [name: string]: BehaviorShortHeader },
  filtersState: FiltersState,
|};

export const BehaviorStoreContext = React.createContext<BehaviorStoreState>({
  filters: null,
  searchResults: null,
  fetchBehaviors: () => {},
  error: null,
  searchText: '',
  setSearchText: () => {},
  allCategories: [],
  // '' means all categories.
  chosenCategory: '',
  setChosenCategory: () => {},
  setInstalledBehaviorMetadataList: () => {},
  behaviorShortHeadersByType: {},
  filtersState: {
    chosenFilters: new Set(),
    addFilter: () => {},
    removeFilter: () => {},
    chosenCategory: null,
    setChosenCategory: () => {},
  },
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
    installedBehaviorMetadataList,
    setInstalledBehaviorMetadataList,
  ] = React.useState<Array<SearchableBehaviorMetadata>>([]);
  const [
    behaviorShortHeadersByType,
    setBehaviorShortHeadersByType,
  ] = React.useState<{
    [string]: BehaviorShortHeader,
  }>({});

  const preferences = React.useContext(PreferencesContext);
  const { showCommunityExtensions } = preferences.values;
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

  const fetchBehaviors = React.useCallback(
    () => {
      // Don't attempt to load again resources and filters if they
      // were loaded already.
      if (Object.keys(behaviorShortHeadersByType).length || isLoading.current)
        return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const behaviorsRegistry: BehaviorsRegistry = await getBehaviorsRegistry();
          const behaviorShortHeaders = behaviorsRegistry.headers;

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
          setFirstBehaviorIds(
            behaviorsRegistry.views.default.firstIds.map(
              ({ extensionName, behaviorName }) =>
                gd.PlatformExtension.getBehaviorFullType(
                  extensionName,
                  behaviorName
                )
            )
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
        fetchBehaviors();
      }, BEHAVIORS_FETCH_TIMEOUT);
      return () => clearTimeout(timeoutId);
    },
    [fetchBehaviors, behaviorShortHeadersByType, isLoading]
  );

  const allBehaviors = React.useMemo(
    () => {
      const allBehaviors: {
        [name: string]: BehaviorShortHeader | SearchableBehaviorMetadata,
      } = {};
      for (const type in behaviorShortHeadersByType) {
        allBehaviors[type] = behaviorShortHeadersByType[type];
      }
      for (const installedBehaviorMetadata of installedBehaviorMetadataList) {
        allBehaviors[
          installedBehaviorMetadata.type
        ] = installedBehaviorMetadata;
      }
      return allBehaviors;
    },
    [installedBehaviorMetadataList, behaviorShortHeadersByType]
  );

  const allCategories = React.useMemo(
    () => {
      const categoriesSet = new Set();
      for (const type in allBehaviors) {
        categoriesSet.add(allBehaviors[type].category);
      }
      const sortedCategories = [...categoriesSet].sort((tag1, tag2) =>
        tag1.toLowerCase().localeCompare(tag2.toLowerCase())
      );
      return sortedCategories;
    },
    [allBehaviors]
  );

  const filters = React.useMemo(
    () => {
      const tagsSet = new Set();
      for (const type in allBehaviors) {
        const behavior = allBehaviors[type];
        behavior.tags.forEach(tag => {
          if (
            showCommunityExtensions ||
            !behavior.tier ||
            !excludedCommunityTiers.has(behavior.tier)
          ) {
            tagsSet.add(tag);
          }
        });
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
    [allBehaviors, showCommunityExtensions]
  );

  const defaultFirstSearchItemIds = React.useMemo(
    () => [
      ...installedBehaviorMetadataList.map(behavior => behavior.type),
      ...firstBehaviorIds,
    ],
    [firstBehaviorIds, installedBehaviorMetadataList]
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

  const behaviorStoreState = React.useMemo(
    () => ({
      searchResults,
      fetchBehaviors,
      filters,
      allCategories,
      chosenCategory,
      setChosenCategory,
      error,
      searchText,
      setSearchText,
      setInstalledBehaviorMetadataList,
      behaviorShortHeadersByType,
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
      setInstalledBehaviorMetadataList,
      behaviorShortHeadersByType,
      filtersState,
      fetchBehaviors,
    ]
  );

  return (
    <BehaviorStoreContext.Provider value={behaviorStoreState}>
      {children}
    </BehaviorStoreContext.Provider>
  );
};
