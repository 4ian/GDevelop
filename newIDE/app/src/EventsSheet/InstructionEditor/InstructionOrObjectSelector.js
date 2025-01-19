// @flow
import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import Fuse from 'fuse.js';
import { type I18n as I18nType } from '@lingui/core';
import { t, Trans } from '@lingui/macro';

import {
  createTree,
  type InstructionOrExpressionTreeNode,
  findInTree,
} from '../../InstructionOrExpression/CreateTree';
import {
  enumerateAllInstructions,
  enumerateFreeInstructions,
} from '../../InstructionOrExpression/EnumerateInstructions';
import {
  type EnumeratedInstructionMetadata,
  filterEnumeratedInstructionOrExpressionMetadataByScope,
} from '../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';
import SearchBar, { type SearchBarInterface } from '../../UI/SearchBar';
import { Tabs } from '../../UI/Tabs';
import { enumerateObjectsAndGroups } from '../../ObjectsList/EnumerateObjects';
import EmptyMessage from '../../UI/EmptyMessage';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope';
import {
  type SearchResult,
  tuneMatches,
  sharedFuseConfiguration,
  getFuseSearchQueryForMultipleKeys,
} from '../../UI/Search/UseSearchStructuredItem';
import { Column, Line } from '../../UI/Grid';
import { enumerateFoldersInContainer } from '../../ObjectsList/EnumerateObjectFolderOrObject';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import ReadOnlyTreeView, {
  type ReadOnlyTreeViewInterface,
} from '../../UI/TreeView/ReadOnlyTreeView';
import { mapFor } from '../../Utils/MapFor';
import {
  getObjectFolderTreeViewItemId,
  InstructionTreeViewItemContent,
  ObjectTreeViewItemContent,
  ObjectFolderTreeViewItem,
  GroupTreeViewItem,
  ObjectGroupTreeViewItemContent,
  ObjectGroupObjectTreeViewItemContent,
  RootTreeViewItem,
  LabelTreeViewItemContent,
  LeafTreeViewItem,
  type TreeViewItem,
  MoreResultsTreeViewItemContent,
} from './TreeViewItems';
import ObjectsRenderingService from '../../ObjectsRendering/ObjectsRenderingService';
import useForceUpdate from '../../Utils/UseForceUpdate';
import type { MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import {
  createFreeInstructionTreeViewItem,
  InstructionTreeViewItemContent as FreeInstructionTreeViewItemContent,
  MoreResultsTreeViewItemContent as MoreInstructionsTreeViewItemContent,
  LeafTreeViewItem as InstructionLeafTreeViewItem,
  getInstructionGroupId,
} from './InstructionOrExpressionTreeViewItems';
import InAppTutorialContext from '../../InAppTutorial/InAppTutorialContext';

const gd: libGDevelop = global.gd;

const singleLineTreeViewItemHeight = 32;
const twoLinesTreeViewItemHeight = 44;

const DISPLAYED_INSTRUCTIONS_MAX_LENGTH = 20;
const LOCAL_OBJECTS_ROOT_ITEM_ID = 'local-objects';
const HIGHER_SCOPE_OBJECTS_ROOT_ITEM_ID = 'higher-scope-objects';
const LOCAL_GROUPS_ROOT_ITEM_ID = 'local-groups';
const HIGHER_SCOPE_GROUPS_ROOT_ITEM_ID = 'higher-scope-groups';

const getLabelsForContainers = (
  scope: EventsScope
): {|
  localScopeObjectsTitle: MessageDescriptor,
  higherScopeObjectsTitle: MessageDescriptor | null,
  localScopeGroupsTitle: MessageDescriptor | null,
  higherScopeGroupsTitle: MessageDescriptor | null,
|} => {
  if (scope.layout || scope.externalEvents) {
    return {
      localScopeObjectsTitle: t`Scene objects`,
      higherScopeObjectsTitle: t`Global objects`,
      localScopeGroupsTitle: t`Scene groups`,
      higherScopeGroupsTitle: t`Global groups`,
    };
  } else if (scope.eventsBasedObject) {
    return {
      localScopeObjectsTitle: t`Parameters`,
      higherScopeObjectsTitle: t`Object's children`,
      localScopeGroupsTitle: null, // Parameters cannot be put into groups.
      higherScopeGroupsTitle: t`Object's children groups`,
    };
  } else if (scope.eventsBasedBehavior) {
    return {
      localScopeObjectsTitle: t`Attached object`,
      higherScopeObjectsTitle: null,
      localScopeGroupsTitle: null,
      higherScopeGroupsTitle: null,
    };
  } else if (scope.eventsFunction) {
    return {
      localScopeObjectsTitle: t`Parameters`,
      higherScopeObjectsTitle: null,
      localScopeGroupsTitle: null, // Parameters cannot be put into groups.
      higherScopeGroupsTitle: null,
    };
  }
  throw new Error('Scope not recognized.');
};

const getEmptyMessage = (scope: EventsScope): React.Node => {
  if (scope.layout || scope.externalEvents) {
    return (
      <Trans>
        There is no object in your game or in this scene. Start by adding an new
        object in the scene editor, using the objects list.
      </Trans>
    );
  } else if (scope.eventsBasedObject) {
    return (
      <Trans>
        There are no objects. Objects will appear if you add some as parameter
        or add children to the object.
      </Trans>
    );
  } else if (scope.eventsBasedBehavior) {
    // Should not happened, a behavior has an object as parameter by default.
    return null;
  } else if (scope.eventsFunction) {
    return (
      <Trans>
        There are no objects. Objects will appear if you add some as parameters.
      </Trans>
    );
  }
  throw new Error('Scope not recognized.');
};

const getInstructionIconSrc = (key: string) => {
  return gd.JsPlatform.get()
    .getInstructionOrExpressionGroupMetadata(key)
    .getIcon();
};

export const styles = {
  noObjectsText: { opacity: 0.7 },
  indentedListItem: { paddingLeft: 45 },
  treeViewContainer: { flex: 1 },
  treeViewAutoSizer: { width: '100%' },
};

export type TabName = 'objects' | 'free-instructions';

const moveDeprecatedInstructionsDown = (
  results: Array<SearchResult<EnumeratedInstructionMetadata>>
) => {
  const deprecatedResults = results.filter(result =>
    result.item.fullGroupName.includes('deprecated')
  );
  const notDeprecatedResults = results.filter(
    result => !result.item.fullGroupName.includes('deprecated')
  );
  return [...notDeprecatedResults, ...deprecatedResults];
};

const shouldApplySearchToItem = (item: TreeViewItem) =>
  item.content.applySearch;
const getTreeViewItemHeight = (item: TreeViewItem) =>
  item.content instanceof InstructionTreeViewItemContent ||
  item.content instanceof MoreResultsTreeViewItemContent ||
  item.content instanceof MoreInstructionsTreeViewItemContent
    ? twoLinesTreeViewItemHeight
    : singleLineTreeViewItemHeight;
const getTreeViewItemName = (item: TreeViewItem) => item.content.getName();
const getTreeViewItemDescription = (item: TreeViewItem) =>
  item.content.getDescription();
const getTreeViewItemId = (item: TreeViewItem) => item.content.getId();
const getTreeViewItemHtmlId = (item: TreeViewItem, index: number) =>
  item.content.getHtmlId(index);

const getTreeViewItemThumbnail = (item: TreeViewItem) =>
  item.content.getThumbnail();
const getTreeViewItemDataset = (item: TreeViewItem) =>
  item.content.getDataSet();

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  scope: EventsScope,
  currentTab: TabName,
  onChangeTab: TabName => void,
  isCondition: boolean,
  focusOnMount?: boolean,
  chosenInstructionType: ?string,
  onChooseInstruction: (type: string, EnumeratedInstructionMetadata) => void,
  chosenObjectName: ?string,
  onChooseObject: (objectName: string) => void,
  onSearchStartOrReset?: () => void,
  style?: Object,
  onClickMore?: () => void,
  i18n: I18nType,
|};

export type InstructionOrObjectSelectorInterface = {|
  reEnumerateInstructions: (i18n: I18nType) => void,
|};

const InstructionOrObjectSelector = React.forwardRef<
  Props,
  InstructionOrObjectSelectorInterface
>(
  (
    {
      project,
      projectScopedContainersAccessor,
      scope,
      currentTab,
      onChangeTab,
      isCondition,
      focusOnMount,
      chosenInstructionType,
      onChooseInstruction,
      chosenObjectName,
      onChooseObject,
      onSearchStartOrReset,
      style,
      onClickMore,
      i18n,
    },
    ref
  ) => {
    const searchBarRef = React.useRef<?SearchBarInterface>(null);
    const treeViewRef = React.useRef<?ReadOnlyTreeViewInterface<TreeViewItem>>(
      null
    );
    const freeInstructionTreeViewRef = React.useRef<?ReadOnlyTreeViewInterface<TreeViewItem>>(
      null
    );
    const freeInstructionsInfoTreeRef = React.useRef<InstructionOrExpressionTreeNode>(
      createTree(
        filterEnumeratedInstructionOrExpressionMetadataByScope(
          enumerateFreeInstructions(isCondition, i18n),
          scope
        ),
        i18n
      )
    );
    const initialInstructionTypePathRef = React.useRef<?Array<string>>(
      findInTree(freeInstructionsInfoTreeRef.current, chosenInstructionType)
    );
    const initialInstructionAscendanceRef = React.useRef<Array<string>>(
      initialInstructionTypePathRef.current
        ? initialInstructionTypePathRef.current.reduce(
            (nodeIds, categoryName) => {
              const parentId =
                nodeIds.length > 0 ? nodeIds[nodeIds.length - 1] : null;
              nodeIds.push(getInstructionGroupId(categoryName, parentId));
              return nodeIds;
            },
            []
          )
        : []
    );
    // All the instructions, to be used when searching, so that the search is done
    // across all the instructions (including object and behaviors instructions).
    const allInstructionsInfoRef = React.useRef<
      Array<EnumeratedInstructionMetadata>
    >(
      filterEnumeratedInstructionOrExpressionMetadataByScope(
        enumerateAllInstructions(isCondition, i18n),
        scope
      )
    );
    // Instructions search results are handled by Fuse because the text is searched
    // in different attributes of the object. Objects, groups and folders search is
    // directly handled by the tree view since they only have one field and their name
    // are straightforward.
    const instructionSearchApiRef = React.useRef<Fuse>(
      new Fuse(allInstructionsInfoRef.current, {
        ...sharedFuseConfiguration,
        keys: [
          { name: 'displayedName', weight: 5 },
          { name: 'fullGroupName', weight: 1 },
          { name: 'description', weight: 3 },
        ],
      })
    );
    const { currentlyRunningInAppTutorial } = React.useContext(
      InAppTutorialContext
    );

    const [searchText, setSearchText] = React.useState<string>('');
    const [searchResults, setSearchResults] = React.useState<{
      instructions: Array<SearchResult<EnumeratedInstructionMetadata>>,
    }>({ instructions: [] });
    const [selectedItem, setSelectedItem] = React.useState<?TreeViewItem>(null);

    // The objects must never be kept in a state as they may be temporary copies.
    // Search for "ProjectScopedContainers wrongly containing temporary objects containers or objects"
    // in the codebase.
    const objectsContainersList = React.useMemo(
      () => projectScopedContainersAccessor.get().getObjectsContainersList(),
      [projectScopedContainersAccessor]
    );

    if (objectsContainersList.getObjectsContainersCount() === 0) {
      throw new Error(
        'Used InstructionOrObjectSelector without any object container.'
      );
    }
    // TODO Use a loop instead of looking for 2 object containers.
    if (objectsContainersList.getObjectsContainersCount() > 2) {
      console.error(
        'Used InstructionOrObjectSelector with more than 2 object containers.'
      );
    }
    const { allObjectsList } = React.useMemo(
      () => enumerateObjectsAndGroups(objectsContainersList),
      [objectsContainersList]
    );

    const globalObjectsContainer =
      objectsContainersList.getObjectsContainersCount() > 1
        ? objectsContainersList.getObjectsContainer(0)
        : null;
    const objectsContainer = objectsContainersList.getObjectsContainer(
      objectsContainersList.getObjectsContainersCount() - 1
    );

    const initiallyOpenedFolderIdsRef = React.useRef<string[]>(
      // TODO: Once it is possible to store the opened state of folders,
      // Reuse it here to have the same state between the scene editor
      // and the event sheets + Open the folder ascendance until the chosen object
      // if there is one, to make sure it is displayed if the user is opening
      // an already set up instruction.
      // Also: if an in-app tutorial is running, open all folders.
      [
        ...enumerateFoldersInContainer(objectsContainer).map(
          folderWithPath => folderWithPath.folder
        ),
        ...(globalObjectsContainer
          ? enumerateFoldersInContainer(globalObjectsContainer).map(
              folderWithPath => folderWithPath.folder
            )
          : []),
      ].map(getObjectFolderTreeViewItemId)
    );
    const initiallyOpenedInstructionsGroupIdsRef = React.useRef<string[]>([
      ...Object.keys(freeInstructionsInfoTreeRef.current).map(categoryName =>
        getInstructionGroupId(categoryName)
      ),
    ]);

    const forceUpdate = useForceUpdate();

    const reEnumerateInstructions = React.useCallback(
      (i18n: I18nType) => {
        freeInstructionsInfoTreeRef.current = createTree(
          filterEnumeratedInstructionOrExpressionMetadataByScope(
            enumerateFreeInstructions(isCondition, i18n),
            scope
          ),
          i18n
        );
        forceUpdate();
      },
      [forceUpdate, isCondition, scope]
    );

    React.useImperativeHandle(ref, () => ({ reEnumerateInstructions }));

    React.useEffect(
      () => {
        const treeView = treeViewRef.current;
        if (treeView) {
          treeView.updateRowHeights();
          treeView.scrollTo(0);
        }
      },
      // Recompute row heights when search changes and reset scroll.
      // Keep this effect before the effect that scrolls to the selected item
      // at opening to avoid this effect take priority over this other, more
      // important one.
      [searchText]
    );

    React.useEffect(
      () => {
        if (chosenObjectName) {
          let itemToSelect;
          const objectOrGroupName = chosenObjectName;
          const treeView = treeViewRef.current;
          if (!treeView) return;

          for (const item of treeView.getDisplayedItemsIterator()) {
            if (item.content instanceof ObjectGroupTreeViewItemContent) {
              const group = item.content.getGroup();
              if (!group) return;
              if (group.getName() === objectOrGroupName) {
                itemToSelect = item;
                break;
              }
            }
            if (item.content instanceof ObjectTreeViewItemContent) {
              const objectFolderOrObject = item.content.getObjectFolderOrObject();
              if (!objectFolderOrObject) return;
              if (
                objectFolderOrObject.getObject().getName() === objectOrGroupName
              ) {
                itemToSelect = item;
                break;
              }
            }
          }
          if (itemToSelect) {
            setSelectedItem(itemToSelect);
            treeView.scrollToItem(itemToSelect, 'start');
          }
        } else if (chosenInstructionType) {
          let itemToSelect;

          const treeView = freeInstructionTreeViewRef.current;
          if (!treeView) return;

          for (const item of treeView.getDisplayedItemsIterator()) {
            if (item.content instanceof FreeInstructionTreeViewItemContent) {
              const instructionMetadata = item.content.getInstructionMetadata();
              if (!instructionMetadata) return;
              if (instructionMetadata.type === chosenInstructionType) {
                setSelectedItem(item);
                treeView.scrollToItem(item, 'start');
                break;
              }
            }
          }
          if (itemToSelect) {
            setSelectedItem(itemToSelect);
            treeView.scrollToItem(itemToSelect, 'start');
          }
        }
      },
      // Scroll to and select the already chosen object/instruction at opening.
      // chosenObjectName and chosenInstructionType are not dependencies to avoid
      // the tree views to scroll at each item selection. This effect will be run
      // when the components mounts only, and that's what we want.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    const getTreeViewItemChildren = (item: TreeViewItem) =>
      item.getChildren(searchText);

    const search = React.useCallback((searchText: string) => {
      if (!searchText) return;

      const matchingInstructions = moveDeprecatedInstructionsDown(
        instructionSearchApiRef.current
          .search(
            getFuseSearchQueryForMultipleKeys(searchText, [
              'displayedName',
              'fullGroupName',
              'description',
            ])
          )
          .map(result => ({
            item: result.item,
            matches: tuneMatches(result, searchText),
          }))
      );

      setSearchResults({ instructions: matchingInstructions });
    }, []);

    const onSubmitSearch = () => {
      if (!searchText || !treeViewRef.current) return;

      for (const item of treeViewRef.current.getDisplayedItemsIterator()) {
        if (item.content instanceof ObjectGroupTreeViewItemContent) {
          const group = item.content.getGroup();
          if (!group) return;
          onChooseObject(group.getName());
          break;
        }
        if (item.content instanceof ObjectTreeViewItemContent) {
          const objectFolderOrObject = item.content.getObjectFolderOrObject();
          if (!objectFolderOrObject) return;
          onChooseObject(objectFolderOrObject.getObject().getName());
          break;
        }
        if (item.content instanceof ObjectGroupObjectTreeViewItemContent) {
          const object = item.content.getObject();
          if (!object) return;
          onChooseObject(object.getName());
          break;
        }
        if (item.content instanceof InstructionTreeViewItemContent) {
          const instructionMetadata = item.content.getInstructionMetadata();
          if (!instructionMetadata) return;
          onChooseInstruction(instructionMetadata.type, instructionMetadata);
          break;
        }
      }
    };

    const isSearching = !!searchText;

    let filteredInstructionsList = [];

    if (isSearching) {
      filteredInstructionsList = searchResults.instructions;
    }
    const displayedInstructionsList = filteredInstructionsList.slice(
      0,
      DISPLAYED_INSTRUCTIONS_MAX_LENGTH
    );

    const remainingResultsCount = isSearching
      ? Math.max(
          filteredInstructionsList.length - DISPLAYED_INSTRUCTIONS_MAX_LENGTH,
          0
        )
      : 0;

    const globalObjectsRootFolder = globalObjectsContainer
      ? globalObjectsContainer.getRootFolder()
      : null;
    const objectsRootFolder = objectsContainer.getRootFolder();
    const groups = objectsContainer.getObjectGroups();
    const hasGroups = groups.count() > 0;
    const globalGroups = globalObjectsContainer
      ? globalObjectsContainer.getObjectGroups()
      : null;
    const hasGlobalGroups = globalGroups ? globalGroups.count() > 0 : false;

    const objectTreeViewItemProps = {
      project,
      getThumbnail: ObjectsRenderingService.getThumbnail.bind(
        ObjectsRenderingService
      ),
    };
    const objectFolderTreeViewItemProps = {
      project,
    };

    const labels = React.useMemo(() => getLabelsForContainers(scope), [scope]);

    const getFreeInstructionsTreeViewItems = i18n =>
      [
        ...createFreeInstructionTreeViewItem({
          instructionOrGroup: freeInstructionsInfoTreeRef.current,
          freeInstructionProps: { getGroupIconSrc: getInstructionIconSrc },
        }),
        onClickMore
          ? new InstructionLeafTreeViewItem(
              new MoreInstructionsTreeViewItemContent(
                isCondition ? (
                  <Trans>Search for new conditions in extensions</Trans>
                ) : (
                  <Trans>Search for new actions in extensions</Trans>
                ),
                onClickMore
              ),
              true
            )
          : null,
      ].filter(Boolean);

    const getTreeViewItems = i18n =>
      [
        new ObjectFolderTreeViewItem({
          objectFolderOrObject: objectsRootFolder,
          global: false,
          isRoot: true,
          content: new LabelTreeViewItemContent(
            LOCAL_OBJECTS_ROOT_ITEM_ID,
            i18n._(labels.localScopeObjectsTitle)
          ),
          objectTreeViewItemProps,
          objectFolderTreeViewItemProps,
        }),
        globalObjectsRootFolder
          ? new ObjectFolderTreeViewItem({
              objectFolderOrObject: globalObjectsRootFolder,
              global: true,
              isRoot: true,
              content: new LabelTreeViewItemContent(
                HIGHER_SCOPE_OBJECTS_ROOT_ITEM_ID,
                labels.higherScopeObjectsTitle
                  ? i18n._(labels.higherScopeObjectsTitle)
                  : ''
              ),
              objectTreeViewItemProps,
              objectFolderTreeViewItemProps,
            })
          : null,
        hasGroups
          ? new RootTreeViewItem(
              new LabelTreeViewItemContent(
                LOCAL_GROUPS_ROOT_ITEM_ID,
                labels.localScopeGroupsTitle
                  ? i18n._(labels.localScopeGroupsTitle)
                  : ''
              ),
              mapFor(0, groups.count(), index => {
                const group = groups.getAt(index);
                return new GroupTreeViewItem(
                  new ObjectGroupTreeViewItemContent(group),
                  group,
                  globalObjectsContainer,
                  objectsContainer,
                  objectTreeViewItemProps
                );
              })
            )
          : null,
        hasGlobalGroups && globalGroups
          ? new RootTreeViewItem(
              new LabelTreeViewItemContent(
                HIGHER_SCOPE_GROUPS_ROOT_ITEM_ID,
                labels.higherScopeGroupsTitle
                  ? i18n._(labels.higherScopeGroupsTitle)
                  : ''
              ),
              mapFor(0, globalGroups.count(), index => {
                const group = globalGroups.getAt(index);
                return new GroupTreeViewItem(
                  new ObjectGroupTreeViewItemContent(group),
                  group,
                  globalObjectsContainer,
                  objectsContainer,
                  objectTreeViewItemProps
                );
              })
            )
          : null,
        displayedInstructionsList.length > 0
          ? new RootTreeViewItem(
              new LabelTreeViewItemContent(
                'instructions',
                i18n._(isCondition ? t`Conditions` : t`Actions`)
              ),
              [
                ...displayedInstructionsList.map(searchResult => {
                  return new LeafTreeViewItem(
                    new InstructionTreeViewItemContent(searchResult.item)
                  );
                }),
                remainingResultsCount
                  ? new LeafTreeViewItem(
                      new MoreResultsTreeViewItemContent(
                        i18n._(t`And ${remainingResultsCount} more results.`),
                        i18n._(
                          t`Refine your search with more specific keywords.`
                        )
                      )
                    )
                  : null,
              ].filter(Boolean)
            )
          : null,
      ].filter(Boolean);

    const hasResults = React.useMemo(
      () => {
        if (!isSearching) return true;
        if (displayedInstructionsList.length > 0) return true;
        const treeView = treeViewRef.current;
        if (!treeView) return true;
        return treeView.getDisplayedItemsCount() > 0;
      },
      [displayedInstructionsList, isSearching]
    );

    const hasNoObjects = !isSearching && !allObjectsList.length;
    const searchHasNoResults = isSearching && !hasResults;

    return (
      <div
        id="instruction-or-object-selector"
        style={{
          // Important for the component to not take the full height in a dialog,
          // allowing to let the scrollview do its job.
          minHeight: 0,
          ...style,
        }}
      >
        <SearchBar
          id="search-bar"
          value={searchText}
          onChange={newSearchText => {
            const oldSearchText = searchText;
            if (!!newSearchText) search(newSearchText);
            setSearchText(newSearchText);
            // Notify if needed that we started or cleared a search
            if (
              (!oldSearchText && newSearchText) ||
              (oldSearchText && !newSearchText)
            ) {
              if (onSearchStartOrReset) onSearchStartOrReset();
            }
          }}
          onRequestSearch={onSubmitSearch}
          ref={searchBarRef}
          autoFocus={focusOnMount ? 'desktop' : undefined}
          placeholder={
            isCondition
              ? t`Search objects or conditions`
              : t`Search objects or actions`
          }
        />
        {!isSearching && (
          <Line>
            <Column expand noMargin>
              <Tabs
                value={currentTab}
                onChange={onChangeTab}
                options={[
                  {
                    label: <Trans>Objects</Trans>,
                    value: 'objects',
                  },
                  {
                    label: isCondition ? (
                      <Trans>Other conditions</Trans>
                    ) : (
                      <Trans>Other actions</Trans>
                    ),
                    value: 'free-instructions',
                  },
                ]}
              />
            </Column>
          </Line>
        )}
        {hasNoObjects ? (
          <EmptyMessage>{getEmptyMessage(scope)}</EmptyMessage>
        ) : searchHasNoResults ? (
          <EmptyMessage>
            <Trans>
              Nothing corresponding to your search. Choose an object first or
              browse the list of actions/conditions.
            </Trans>
          </EmptyMessage>
        ) : null}
        <div
          style={{
            ...styles.treeViewContainer,
            display:
              (currentTab === 'objects' || isSearching) &&
              !searchHasNoResults &&
              !hasNoObjects
                ? 'unset'
                : 'none',
          }}
        >
          <AutoSizer style={styles.treeViewAutoSizer} disableWidth>
            {({ height }) => (
              <ReadOnlyTreeView
                key="objects-and-search-results"
                ref={treeViewRef}
                height={height}
                estimatedItemSize={singleLineTreeViewItemHeight}
                items={getTreeViewItems(i18n)}
                getItemHeight={getTreeViewItemHeight}
                getItemName={getTreeViewItemName}
                shouldApplySearchToItem={shouldApplySearchToItem}
                getItemDescription={getTreeViewItemDescription}
                forceAllOpened={!!currentlyRunningInAppTutorial}
                getItemId={getTreeViewItemId}
                getItemHtmlId={getTreeViewItemHtmlId}
                getItemChildren={getTreeViewItemChildren}
                getItemThumbnail={getTreeViewItemThumbnail}
                getItemDataset={getTreeViewItemDataset}
                selectedItems={selectedItem ? [selectedItem] : []}
                initiallyOpenedNodeIds={[
                  LOCAL_OBJECTS_ROOT_ITEM_ID,
                  HIGHER_SCOPE_OBJECTS_ROOT_ITEM_ID,
                  LOCAL_GROUPS_ROOT_ITEM_ID,
                  HIGHER_SCOPE_GROUPS_ROOT_ITEM_ID,
                  ...initiallyOpenedFolderIdsRef.current,
                ]}
                onSelectItems={(items: TreeViewItem[]) => {
                  if (!items) return;
                  const item = items[0];
                  if (!item || item.isRoot) return;
                  const itemContentToSelect = item.content;
                  if (
                    itemContentToSelect instanceof ObjectTreeViewItemContent
                  ) {
                    const objectFolderOrObjectToSelect = itemContentToSelect.getObjectFolderOrObject();
                    if (
                      !objectFolderOrObjectToSelect ||
                      objectFolderOrObjectToSelect.isFolder()
                    ) {
                      return;
                    }
                    onChooseObject(
                      objectFolderOrObjectToSelect.getObject().getName()
                    );
                    setSelectedItem(item);
                  } else if (
                    itemContentToSelect instanceof
                    ObjectGroupTreeViewItemContent
                  ) {
                    const group = itemContentToSelect.getGroup();
                    if (!group) return;
                    onChooseObject(group.getName());
                    setSelectedItem(item);
                  } else if (
                    itemContentToSelect instanceof
                    ObjectGroupObjectTreeViewItemContent
                  ) {
                    const object = itemContentToSelect.getObject();
                    if (!object) return;
                    onChooseObject(object.getName());
                    setSelectedItem(item);
                  } else if (
                    itemContentToSelect instanceof
                    InstructionTreeViewItemContent
                  ) {
                    const instructionMetadata = itemContentToSelect.getInstructionMetadata();
                    if (!instructionMetadata) return;
                    onChooseInstruction(
                      instructionMetadata.type,
                      instructionMetadata
                    );
                    setSelectedItem(item);
                  }
                }}
                searchText={searchText}
                multiSelect={false}
              />
            )}
          </AutoSizer>
        </div>
        <div
          style={{
            ...styles.treeViewContainer,
            display:
              currentTab === 'free-instructions' && !isSearching
                ? 'unset'
                : 'none',
          }}
        >
          <AutoSizer style={styles.treeViewAutoSizer} disableWidth>
            {({ height }) => (
              <ReadOnlyTreeView
                key="free-instructions"
                ref={freeInstructionTreeViewRef}
                height={height}
                items={getFreeInstructionsTreeViewItems(i18n)}
                getItemHeight={getTreeViewItemHeight}
                getItemName={getTreeViewItemName}
                shouldApplySearchToItem={() => false}
                getItemDescription={getTreeViewItemDescription}
                getItemId={getTreeViewItemId}
                getItemHtmlId={getTreeViewItemHtmlId}
                getItemChildren={getTreeViewItemChildren}
                getItemThumbnail={getTreeViewItemThumbnail}
                getItemDataset={getTreeViewItemDataset}
                selectedItems={selectedItem ? [selectedItem] : []}
                initiallyOpenedNodeIds={Array.from(
                  new Set([
                    ...initiallyOpenedInstructionsGroupIdsRef.current,
                    ...initialInstructionAscendanceRef.current,
                  ])
                )}
                onSelectItems={(items: TreeViewItem[]) => {
                  if (!items) return;
                  const item = items[0];
                  if (!item || item.isRoot) return;
                  const itemContentToSelect = item.content;
                  if (
                    itemContentToSelect instanceof
                    FreeInstructionTreeViewItemContent
                  ) {
                    const instructionMetadata = itemContentToSelect.getInstructionMetadata();
                    if (!instructionMetadata) return;
                    onChooseInstruction(
                      instructionMetadata.type,
                      instructionMetadata
                    );
                    setSelectedItem(item);
                  } else if (
                    itemContentToSelect instanceof
                    MoreInstructionsTreeViewItemContent
                  ) {
                    itemContentToSelect.onClick();
                  }
                }}
                multiSelect={false}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }
);

export default InstructionOrObjectSelector;
