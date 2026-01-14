// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import Subheader from '../UI/Subheader';
import { enumerateObjectTypes } from '../ObjectsList/EnumerateObjects';
import { Column, Line } from '../UI/Grid';
import { sendNewObjectCreated } from '../Utils/Analytics/EventSender';
import useDismissableTutorialMessage from '../Hints/useDismissableTutorialMessage';
import { AssetStoreContext } from './AssetStoreContext';
import { type ChosenCategory } from '../UI/Search/FiltersChooser';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import TextButton from '../UI/TextButton';
import { t, Trans } from '@lingui/macro';
import ChevronArrowLeft from '../UI/CustomSvgIcons/ChevronArrowLeft';
import AssetsList from './AssetsList';
import SearchBar from '../UI/SearchBar';
import { type ObjectShortHeader } from '../Utils/GDevelopServices/Extension';
import { ObjectStoreContext, type ObjectCategory } from './ObjectStoreContext';
import { ListSearchResults } from '../UI/Search/ListSearchResults';
import { ObjectListItem } from './ObjectListItem';
import { type SearchMatch } from '../UI/Search/UseSearchStructuredItem';
import { ColumnStackLayout } from '../UI/Layout';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import SearchBarSelectField from '../UI/SearchBarSelectField';
import SelectOption from '../UI/SelectOption';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import IconButton from '../UI/IconButton';
import ThreeDotsMenu from '../UI/CustomSvgIcons/ThreeDotsMenu';
import ExtensionInstallDialog from './ExtensionStore/ExtensionInstallDialog';

const gd: libGDevelop = global.gd;

type CustomObjectPackResultsProps = {|
  packTag: string,
  onAssetSelect: (assetShortHeader: AssetShortHeader) => Promise<void>,
  onBack: () => void,
  isAssetBeingInstalled: boolean,
|};

export const CustomObjectPackResults = ({
  packTag,
  onAssetSelect,
  onBack,
  isAssetBeingInstalled,
}: CustomObjectPackResultsProps) => {
  const { useSearchItem, error } = React.useContext(AssetStoreContext);
  // Memoizing the parameters of the search as it seems to trigger infinite rendering if not.
  const chosenCategory: ChosenCategory = React.useMemo(
    () => ({
      node: {
        name: packTag,
        allChildrenTags: [],
        children: [],
      },
      parentNodes: [],
    }),
    [packTag]
  );
  const filters = React.useMemo(() => [], []);
  const selectedAssetPackSearchResults = useSearchItem(
    '',
    chosenCategory,
    null,
    filters
  );

  return (
    <>
      <Column noMargin expand>
        <Line>
          <TextButton
            icon={<ChevronArrowLeft />}
            label={<Trans>Back</Trans>}
            onClick={onBack}
            disabled={isAssetBeingInstalled}
          />
        </Line>
        <AssetsList
          assetShortHeaders={selectedAssetPackSearchResults}
          error={error}
          onOpenDetails={assetShortHeader => {
            if (isAssetBeingInstalled) return;
            onAssetSelect(assetShortHeader);
          }}
        />
      </Column>
    </>
  );
};

type TitleListItemProps = {|
  value: string,
  onHeightComputed: number => void,
|};

const TitleListItem = ({ value, onHeightComputed }: TitleListItemProps) => {
  // Report the height of the item once it's known.
  const containerRef = React.useRef<?HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (containerRef.current)
      onHeightComputed(containerRef.current.getBoundingClientRect().height);
  });

  return (
    <div ref={containerRef}>
      <Subheader>{value}</Subheader>
    </div>
  );
};

const getObjectType = (
  objectShortHeader: ObjectShortHeader | ObjectCategory
  //$FlowFixMe
): string => objectShortHeader.type || objectShortHeader.categoryId;

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,
  onObjectTypeSelected: ObjectShortHeader => void,
  i18n: I18nType,
|};

export default function NewObjectFromScratch({
  project,
  eventsFunctionsExtension,
  eventsBasedObject,
  onObjectTypeSelected,
  i18n,
}: Props) {
  const preferences = React.useContext(PreferencesContext);
  const [
    selectedObjectShortHeader,
    setSelectedObjectShortHeader,
  ] = React.useState<?ObjectShortHeader>(null);
  const {
    filters,
    searchResults,
    error,
    fetchObjects,
    filtersState,
    searchText,
    setSearchText,
    allCategories,
    chosenCategory,
    setChosenCategory,
    setInstalledObjectMetadataList,
  } = React.useContext(ObjectStoreContext);

  const installedObjectMetadataList: Array<ObjectShortHeader> = React.useMemo(
    () => {
      const platform = project.getCurrentPlatform();
      const objectMetadataList =
        project && platform
          ? enumerateObjectTypes(project, eventsFunctionsExtension)
          : [];

      return objectMetadataList
        .filter(object => !object.objectMetadata.isHidden() && object.type)
        .map(object => {
          let isDependentWithParent = false;
          if (eventsBasedObject && project.hasEventsBasedObject(object.name)) {
            const otherEventBasedObject = project.getEventsBasedObject(
              object.name
            );
            isDependentWithParent = gd.EventsBasedObjectDependencyFinder.isDependentFromEventsBasedObject(
              project,
              otherEventBasedObject,
              eventsBasedObject
            );
          }
          return {
            type: object.type,
            fullName: object.fullName,
            description: object.description,
            previewIconUrl: object.iconFilename,
            category: object.category,
            tags: object.tags,
            name: object.name,
            extensionName: gd.PlatformExtension.getExtensionFromFullObjectType(
              object.type
            ),
            assetStoreTag: object.assetStoreTag,

            isInstalled: true,
            // The tier will be overridden with repository data.
            // Only the built-in and user extensions will keep this value.
            tier: 'installed',
            // Not relevant for `installed` extensions
            version: '',
            url: '',
            headerUrl: '',
            extensionNamespace: '',
            authorIds: [],
            isDependentWithParent,
          };
        });
    },
    [project, eventsFunctionsExtension, eventsBasedObject]
  );

  React.useEffect(
    () => {
      setInstalledObjectMetadataList(installedObjectMetadataList);
    },
    [installedObjectMetadataList, setInstalledObjectMetadataList]
  );

  React.useEffect(
    () => {
      fetchObjects();
    },
    [fetchObjects]
  );

  const filteredSearchResults = searchResults ? searchResults : null;

  const tagsHandler = React.useMemo(
    () => ({
      add: filtersState.addFilter,
      remove: filtersState.removeFilter,
      chosenTags: filtersState.chosenFilters,
    }),
    [filtersState]
  );

  const getExtensionsMatches = React.useCallback(
    (extensionShortHeader: ObjectShortHeader): SearchMatch[] => {
      if (!searchResults) return [];
      const extensionMatches = searchResults.find(result => {
        const resultItem: ObjectShortHeader =
          //$FlowFixMe Categories will never match since they have no type.
          result.item;
        return resultItem.type === extensionShortHeader.type;
      });
      return extensionMatches ? extensionMatches.matches : [];
    },
    [searchResults]
  );

  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intro-object-types'
  );

  return (
    <React.Fragment>
      <ColumnStackLayout expand noMargin useFullHeight>
        <ColumnStackLayout noMargin>
          <ResponsiveLineStackLayout>
            <SearchBarSelectField
              value={chosenCategory}
              onChange={(e, i, value: string) => {
                setChosenCategory(value);
              }}
            >
              <SelectOption value="" label={t`All categories`} />
              {allCategories.map(category => (
                <SelectOption
                  key={category}
                  value={category}
                  label={category}
                />
              ))}
            </SearchBarSelectField>
            <Line expand noMargin>
              <Column expand noMargin>
                <SearchBar
                  id="extension-search-bar"
                  value={searchText}
                  onChange={setSearchText}
                  onRequestSearch={() => {}}
                  tagsHandler={tagsHandler}
                  tags={filters && filters.allTags}
                  placeholder={t`Search objects`}
                  autoFocus="desktop"
                />
              </Column>
              <ElementWithMenu
                key="menu"
                element={
                  <IconButton size="small">
                    <ThreeDotsMenu />
                  </IconButton>
                }
                buildMenuTemplate={(i18n: I18nType) => [
                  {
                    label: preferences.values.showExperimentalExtensions
                      ? i18n._(t`Hide experimental objects`)
                      : i18n._(t`Show experimental objects`),
                    click: () => {
                      preferences.setShowExperimentalExtensions(
                        !preferences.values.showExperimentalExtensions
                      );
                    },
                  },
                ]}
              />
            </Line>
          </ResponsiveLineStackLayout>
          {DismissableTutorialMessage}
        </ColumnStackLayout>
        <ListSearchResults
          disableAutoTranslate // Search results text highlighting conflicts with dom handling by browser auto-translations features. Disables auto translation to prevent crashes.
          onRetry={fetchObjects}
          error={error}
          searchItems={
            filteredSearchResults &&
            filteredSearchResults.map(({ item }) => item)
          }
          getSearchItemUniqueId={getObjectType}
          renderSearchItem={(objectShortHeaderOrCategory, onHeightComputed) => {
            if (objectShortHeaderOrCategory.categoryId) {
              return (
                <TitleListItem
                  value={objectShortHeaderOrCategory.name}
                  onHeightComputed={onHeightComputed}
                />
              );
            }
            const objectShortHeader: ObjectShortHeader =
              //$FlowFixMe It can't be a category at this point
              objectShortHeaderOrCategory;
            return (
              <ObjectListItem
                id={'object-item-' + objectShortHeader.type.replace(/:/g, '-')}
                key={objectShortHeader.type}
                onHeightComputed={onHeightComputed}
                objectShortHeader={objectShortHeader}
                matches={getExtensionsMatches(objectShortHeader)}
                onChoose={() => {
                  sendNewObjectCreated(objectShortHeader.name);
                  onObjectTypeSelected(objectShortHeader);
                }}
                onShowDetails={() => {
                  if (objectShortHeader.headerUrl) {
                    setSelectedObjectShortHeader(objectShortHeader);
                  }
                }}
                platform={project.getCurrentPlatform()}
              />
            );
          }}
        />
      </ColumnStackLayout>
      {!!selectedObjectShortHeader && (
        <ExtensionInstallDialog
          project={project}
          isInstalling={false}
          // TODO isInstalling={isInstalling}
          extensionShortHeader={selectedObjectShortHeader}
          onClose={() => setSelectedObjectShortHeader(null)}
        />
      )}
    </React.Fragment>
  );
}
