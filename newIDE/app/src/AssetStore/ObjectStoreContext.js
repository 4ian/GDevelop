// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type FiltersState, useFilters } from '../UI/Search/FiltersChooser';
import {
  getObjectsRegistry,
  type ObjectsRegistry,
  type ObjectShortHeader,
} from '../Utils/GDevelopServices/Extension';
import { type Filters } from '../Utils/GDevelopServices/Filters';
import {
  useSearchStructuredItem,
  type SearchResult,
} from '../UI/Search/UseSearchStructuredItem';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { OBJECTS_FETCH_TIMEOUT } from '../Utils/GlobalFetchTimeouts';
import { translateExtensionCategory } from '../Utils/Extension/ExtensionCategories';

const gd: libGDevelop = global.gd;

const emptySearchText = '';

const noExcludedTiers = new Set();
const excludedExperimentalTiers = new Set(['experimental']);

const builtInObjectCategories = [
  'General',
  'Input',
  'Text',
  'User interface',
  'Visual effect',
  'Advanced',
];

const builtInObjectTypes = [
  'Sprite',
  'TiledSpriteObject::TiledSprite',
  'PanelSpriteObject::PanelSprite',
  'Scene3D::Cube3DObject',
  'Scene3D::Model3DObject',
  'TextObject::Text',
  'BBText::BBText',
  'BitmapText::BitmapTextObject',
  'TextInput::TextInputObject',
  'Video::VideoObject',
  'Lighting::LightObject',
  'ParticleSystem::ParticleEmitter',
  'ParticleEmitter3D::ParticleEmitter3D',
  'TileMap::TileMap',
  'TileMap::CollisionMask',
  'PrimitiveDrawing::Drawer',
];

type TranslatedObjectShortHeader = {
  ...ObjectShortHeader,
  englishFullName: string,
  englishDescription: string,
};

export type ObjectCategory = {
  categoryId: string,
  name: string,
  tags: [],
  tier: '',
};

// TODO Check that it works with translation
const getCategoryId = (name: string) => `category-${name}`;

const getItemIdsGroupedByCategory = (
  firstObjectShortHeaders: Array<ObjectShortHeader>,
  installedObjectShortHeaders: Array<ObjectShortHeader>
): Array<string> => {
  const sortedInstalledObjectShortHeaders = [...firstObjectShortHeaders];
  for (const installedObjectShortHeader of installedObjectShortHeaders) {
    if (!firstObjectShortHeaders.includes(installedObjectShortHeader)) {
      sortedInstalledObjectShortHeaders.push(installedObjectShortHeader);
    }
  }
  const objectsByCategory = new Map<string, Array<ObjectShortHeader>>();
  // Ensure order for categories without any built-in object.
  for (const builtInObjectCategory of builtInObjectCategories) {
    objectsByCategory.set(builtInObjectCategory, []);
  }
  for (const objectShortHeader of sortedInstalledObjectShortHeaders) {
    const category = objectShortHeader.category;
    let categoryObjects = objectsByCategory.get(category);
    if (!categoryObjects) {
      categoryObjects = [];
      objectsByCategory.set(category, categoryObjects);
    }
    categoryObjects.push(objectShortHeader);
  }
  const itemIdsGroupedByCategory = [];
  for (const [category, objectShortHeaders] of objectsByCategory) {
    if (objectShortHeaders.length === 0) {
      continue;
    }
    itemIdsGroupedByCategory.push(getCategoryId(category));
    for (const objectShortHeader of objectShortHeaders) {
      itemIdsGroupedByCategory.push(objectShortHeader.type);
    }
  }
  return itemIdsGroupedByCategory;
};

const getCategories = (
  objectShortHeaders: Array<ObjectShortHeader>
): Array<string> => {
  const categories: Set<string> = new Set();
  for (const objectShortHeader of objectShortHeaders) {
    if (objectShortHeader.category) {
      categories.add(objectShortHeader.category);
    }
  }
  return [...categories];
};

type ObjectStoreState = {|
  filters: ?Filters,
  searchResults: ?Array<SearchResult<ObjectShortHeader | ObjectCategory>>,
  fetchObjects: () => void,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  allCategories: string[],
  chosenCategory: string,
  setChosenCategory: string => void,
  setInstalledObjectMetadataList: (
    installedObjectMetadataList: Array<ObjectShortHeader>
  ) => void,
  translatedObjectShortHeadersByType: {
    [name: string]: TranslatedObjectShortHeader,
  },
  filtersState: FiltersState,
|};

export const ObjectStoreContext = React.createContext<ObjectStoreState>({
  filters: null,
  searchResults: null,
  fetchObjects: () => {},
  error: null,
  searchText: '',
  setSearchText: () => {},
  allCategories: [],
  // '' means all categories.
  chosenCategory: '',
  setChosenCategory: () => {},
  setInstalledObjectMetadataList: () => {},
  translatedObjectShortHeadersByType: {},
  filtersState: {
    chosenFilters: new Set(),
    addFilter: () => {},
    removeFilter: () => {},
    chosenCategory: null,
    setChosenCategory: () => {},
  },
});

type ObjectStoreStateProviderProps = {|
  children: React.Node,
  i18n: I18nType,
  defaultSearchText?: string,
|};

export const ObjectStoreStateProvider = ({
  children,
  i18n,
  defaultSearchText,
}: ObjectStoreStateProviderProps) => {
  const [
    installedObjectMetadataList,
    setInstalledObjectMetadataList,
  ] = React.useState<Array<ObjectShortHeader>>([]);
  const [
    translatedObjectShortHeadersByType,
    setTranslatedObjectShortHeadersByType,
  ] = React.useState<{
    [string]: TranslatedObjectShortHeader,
  }>({});

  const preferences = React.useContext(PreferencesContext);
  const { showExperimentalExtensions, language } = preferences.values;
  const [firstObjectIds, setFirstObjectIds] = React.useState<Array<string>>([]);
  const [secondObjectIds, setSecondObjectIds] = React.useState<Array<string>>(
    []
  );
  const [loadedLanguage, setLoadedLanguage] = React.useState<?string>(null);
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const [searchText, setSearchText] = React.useState(
    defaultSearchText || emptySearchText
  );
  const [chosenCategory, setChosenCategory] = React.useState('');
  const filtersState = useFilters();

  const fetchObjects = React.useCallback(
    () => {
      // Don't attempt to load again resources and filters if they
      // were loaded already.
      if (
        (Object.keys(translatedObjectShortHeadersByType).length &&
          loadedLanguage === language) ||
        isLoading.current
      )
        return;

      (async () => {
        setError(null);
        // Reset the search text to avoid showing the previous search results
        // in case they were on a different language.
        setSearchText(emptySearchText);
        isLoading.current = true;

        try {
          const objectsRegistry: ObjectsRegistry = await getObjectsRegistry();
          const objectShortHeaders = objectsRegistry.headers;

          const translatedObjectShortHeadersByType = {};
          objectShortHeaders.forEach(objectShortHeader => {
            const translatedObjectShortHeader: TranslatedObjectShortHeader = {
              ...objectShortHeader,
              fullName: i18n._(objectShortHeader.fullName),
              description: i18n._(objectShortHeader.description),
              englishFullName: objectShortHeader.fullName,
              englishDescription: objectShortHeader.description,
            };
            translatedObjectShortHeadersByType[
              objectShortHeader.type
            ] = translatedObjectShortHeader;
          });

          console.info(
            `Loaded ${
              objectShortHeaders ? objectShortHeaders.length : 0
            } objects from the extension store.`
          );
          setTranslatedObjectShortHeadersByType(
            translatedObjectShortHeadersByType
          );
          setLoadedLanguage(language);
          setFirstObjectIds(
            objectsRegistry.views.default.firstIds.map(
              ({ extensionName, objectName }) =>
                gd.PlatformExtension.getObjectFullType(
                  extensionName,
                  objectName
                )
            )
          );
          setSecondObjectIds(
            objectsRegistry.views.default.secondIds.map(
              ({ extensionName, objectName }) =>
                gd.PlatformExtension.getObjectFullType(
                  extensionName,
                  objectName
                )
            )
          );
        } catch (error) {
          console.error(
            `Unable to load the objects from the extension store:`,
            error
          );
          setError(error);
        }

        isLoading.current = false;
      })();
    },
    [
      translatedObjectShortHeadersByType,
      isLoading,
      i18n,
      language,
      loadedLanguage,
    ]
  );

  React.useEffect(
    () => {
      // Don't attempt to load again extensions and filters if they
      // were loaded already.
      if (
        (Object.keys(translatedObjectShortHeadersByType).length &&
          loadedLanguage === language) ||
        isLoading.current
      )
        return;

      const timeoutId = setTimeout(() => {
        console.info('Pre-fetching objects from extension store...');
        fetchObjects();
      }, OBJECTS_FETCH_TIMEOUT);
      return () => clearTimeout(timeoutId);
    },
    [
      fetchObjects,
      translatedObjectShortHeadersByType,
      isLoading,
      language,
      loadedLanguage,
    ]
  );

  const allTranslatedObjects = React.useMemo(
    () => {
      const allTranslatedObjects: Array<ObjectShortHeader> = [];
      for (const installedObjectMetadata of installedObjectMetadataList) {
        const repositoryObjectMetadata =
          translatedObjectShortHeadersByType[installedObjectMetadata.type];
        const objectMetadata = repositoryObjectMetadata
          ? {
              // Attributes from the extension repository

              // These attributes are important for the installation and update workflow.
              isInstalled: true,
              tier: repositoryObjectMetadata.tier,
              version: repositoryObjectMetadata.version,
              changelog: repositoryObjectMetadata.changelog,
              url: repositoryObjectMetadata.url,
              // It gives info about the extension that can be displayed to users.
              headerUrl: repositoryObjectMetadata.headerUrl,
              authorIds: repositoryObjectMetadata.authorIds,
              authors: repositoryObjectMetadata.authors,
              // It's empty and not used.
              extensionNamespace: repositoryObjectMetadata.extensionNamespace,

              // Attributes from the installed extension

              // These ones are less important but its better to use the icon of
              // the installed extension since it's used everywhere in the editor.
              previewIconUrl: installedObjectMetadata.previewIconUrl,
              category: installedObjectMetadata.category,
              tags: installedObjectMetadata.tags,
              // Both metadata are supposed to have the same type, but the
              // installed ones are safer to use.
              // It reduces the risk of accessing an extension that doesn't
              // actually exist in the project.
              type: installedObjectMetadata.type,
              name: installedObjectMetadata.name,
              extensionName: installedObjectMetadata.extensionName,

              // Attributes switching between both

              assetStoreTag:
                repositoryObjectMetadata.assetStoreTag ||
                installedObjectMetadata.assetStoreTag,

              // Translations may not be relevant for the installed version.
              // We use the translation only if the not translated texts match.
              fullName:
                installedObjectMetadata.fullName ===
                repositoryObjectMetadata.englishFullName
                  ? repositoryObjectMetadata.fullName
                  : installedObjectMetadata.fullName,
              description:
                installedObjectMetadata.description ===
                repositoryObjectMetadata.englishDescription
                  ? repositoryObjectMetadata.description
                  : installedObjectMetadata.description,
            }
          : installedObjectMetadata;
        allTranslatedObjects.push(objectMetadata);
      }
      for (const type in translatedObjectShortHeadersByType) {
        const objectShortHeader: any = {
          ...translatedObjectShortHeadersByType[type],
        };
        delete objectShortHeader.englishFullName;
        delete objectShortHeader.englishDescription;
        allTranslatedObjects.push(objectShortHeader);
      }
      return allTranslatedObjects;
    },
    [installedObjectMetadataList, translatedObjectShortHeadersByType]
  );

  const allCategories = React.useMemo(
    () => {
      const categoriesSet = new Set();
      for (const object of allTranslatedObjects) {
        categoriesSet.add(object.category);
      }
      const sortedCategories = [...categoriesSet].sort((tag1, tag2) =>
        tag1.toLowerCase().localeCompare(tag2.toLowerCase())
      );
      return sortedCategories;
    },
    [allTranslatedObjects]
  );

  const filters = React.useMemo(
    () => {
      const tagsSet = new Set();
      for (const object of allTranslatedObjects) {
        object.tags.forEach(tag => {
          if (
            showExperimentalExtensions ||
            !object.tier ||
            !excludedExperimentalTiers.has(object.tier)
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
    [allTranslatedObjects, showExperimentalExtensions]
  );

  const allTranslatedObjectsAndCategories = React.useMemo(
    () => {
      const allTranslatedObjectsAndCategories: {
        [name: string]: ObjectShortHeader | ObjectCategory,
      } = {};
      for (const translatedObjects of allTranslatedObjects) {
        allTranslatedObjectsAndCategories[
          translatedObjects.type
        ] = translatedObjects;
      }
      const allCategorizedObjects = [
        ...[...builtInObjectTypes, ...firstObjectIds]
          .map(type => {
            const objectOrCategory: ObjectShortHeader =
              //$FlowFixMe It can't be an ObjectCategory
              allTranslatedObjectsAndCategories[type];
            return objectOrCategory;
          })
          .filter(Boolean),
        ...installedObjectMetadataList,
      ];
      for (const categoryName of [
        ...getCategories(allCategorizedObjects),
        'Explore',
      ]) {
        const categoryId = getCategoryId(categoryName);
        const objectCategory: ObjectCategory = {
          categoryId,
          name: translateExtensionCategory(categoryName, i18n),
          tags: [],
          tier: '',
        };
        allTranslatedObjectsAndCategories[categoryId] = objectCategory;
      }
      {
        const categoryId = getCategoryId('Explore');
        const objectCategory: ObjectCategory = {
          categoryId,
          name: i18n._('Explore'),
          tags: [],
          tier: '',
        };
        allTranslatedObjectsAndCategories[categoryId] = objectCategory;
      }
      return allTranslatedObjectsAndCategories;
    },
    [firstObjectIds, installedObjectMetadataList, allTranslatedObjects, i18n]
  );

  const defaultFirstSearchItemIds = React.useMemo(
    () => [
      ...getItemIdsGroupedByCategory(
        [...builtInObjectTypes, ...firstObjectIds]
          .map(type => {
            const objectOrCategory: ObjectShortHeader =
              //$FlowFixMe It can't be an ObjectCategory
              allTranslatedObjectsAndCategories[type];
            return objectOrCategory;
          })
          .filter(Boolean),
        installedObjectMetadataList
      ),
      getCategoryId('Explore'),
      ...secondObjectIds,
    ],
    [
      installedObjectMetadataList,
      firstObjectIds,
      secondObjectIds,
      allTranslatedObjectsAndCategories,
    ]
  );

  const searchResults: ?Array<
    SearchResult<ObjectShortHeader | ObjectCategory>
  > = useSearchStructuredItem(allTranslatedObjectsAndCategories, {
    searchText,
    chosenItemCategory: chosenCategory,
    chosenCategory: filtersState.chosenCategory,
    chosenFilters: filtersState.chosenFilters,
    excludedTiers: showExperimentalExtensions
      ? noExcludedTiers
      : excludedExperimentalTiers,
    defaultFirstSearchItemIds: defaultFirstSearchItemIds,
  });

  const objectStoreState = React.useMemo(
    () => ({
      searchResults,
      fetchObjects,
      filters,
      allCategories,
      chosenCategory,
      setChosenCategory,
      error,
      searchText,
      setSearchText,
      setInstalledObjectMetadataList,
      translatedObjectShortHeadersByType,
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
      setInstalledObjectMetadataList,
      translatedObjectShortHeadersByType,
      filtersState,
      fetchObjects,
    ]
  );

  return (
    <ObjectStoreContext.Provider value={objectStoreState}>
      {children}
    </ObjectStoreContext.Provider>
  );
};
