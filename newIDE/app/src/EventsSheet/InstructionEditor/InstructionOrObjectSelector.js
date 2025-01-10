// @flow
import * as React from 'react';
import Fuse from 'fuse.js';
import { I18n } from '@lingui/react';
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
import { List, type ListItemRefType } from '../../UI/List';
import SearchBar, { type SearchBarInterface } from '../../UI/SearchBar';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import { Tabs } from '../../UI/Tabs';
import { enumerateObjectsAndGroups } from '../../ObjectsList/EnumerateObjects';
import RaisedButton from '../../UI/RaisedButton';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import { renderInstructionOrExpressionTree } from './SelectorListItems/SelectorInstructionsTreeListItem';
import EmptyMessage from '../../UI/EmptyMessage';
import { getInstructionListItemValue } from './SelectorListItems/Keys';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope';
import {
  type SearchResult,
  tuneMatches,
  sharedFuseConfiguration,
  getFuseSearchQueryForMultipleKeys,
} from '../../UI/Search/UseSearchStructuredItem';
import { Column, Line } from '../../UI/Grid';
import Add from '../../UI/CustomSvgIcons/Add';
import getObjectByName from '../../Utils/GetObjectByName';
import { enumerateFoldersInContainer } from '../../ObjectsList/EnumerateObjectFolderOrObject';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import ReadOnlyTreeView, {
  type ReadOnlyTreeViewInterface,
} from '../../UI/TreeView/ReadOnlyTreeView';
import { AutoSizer } from 'react-virtualized';
import { mapFor } from '../../Utils/MapFor';
import {
  getObjectTreeViewItemId,
  getObjectFolderTreeViewItemId,
  InstructionTreeViewItemContent,
  ObjectFolderTreeViewItem,
  GroupTreeViewItem,
  ObjectGroupTreeViewItemContent,
  RootTreeViewItem,
  LabelTreeViewItemContent,
  LeafTreeViewItem,
  type TreeViewItem,
} from './TreeViewItems';
import ObjectsRenderingService from '../../ObjectsRendering/ObjectsRenderingService';
import getObjectGroupByName from '../../Utils/GetObjectGroupByName';

const gd: libGDevelop = global.gd;

const iconSize = 24;
const getGroupIconSrc = (key: string) => {
  return gd.JsPlatform.get()
    .getInstructionOrExpressionGroupMetadata(key)
    .getIcon();
};

const DISPLAYED_INSTRUCTIONS_MAX_LENGTH = 20;
export const styles = {
  noObjectsText: { opacity: 0.7 },
  indentedListItem: { paddingLeft: 45 },
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

type State = {|
  searchText: string,
  selectedItem: TreeViewItem | null,
  searchResults: {
    instructions: Array<SearchResult<EnumeratedInstructionMetadata>>,
  },
  initiallyOpenedFolderIds: string[],
|};

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

export default class InstructionOrObjectSelector extends React.PureComponent<
  Props,
  State
> {
  state = {
    searchText: '',
    searchResults: { instructions: [] },
    selectedItem: null,
    initiallyOpenedFolderIds: [],
  };
  _searchBar = React.createRef<SearchBarInterface>();
  _scrollView = React.createRef<ScrollViewInterface>();
  _treeView = React.createRef<ReadOnlyTreeViewInterface<TreeViewItem>>();
  _selectedInstructionItem = React.createRef<ListItemRefType>();

  // Free instructions, to be displayed in a tab next to the objects.
  freeInstructionsInfo: Array<EnumeratedInstructionMetadata> = filterEnumeratedInstructionOrExpressionMetadataByScope(
    enumerateFreeInstructions(this.props.isCondition, this.props.i18n),
    this.props.scope
  );
  freeInstructionsInfoTree: InstructionOrExpressionTreeNode = createTree(
    this.freeInstructionsInfo
  );
  initialInstructionTypePath = findInTree(
    this.freeInstructionsInfoTree,
    this.props.chosenInstructionType
  );

  instructionSearchApi = null;

  reEnumerateInstructions = (i18n: I18nType) => {
    this.freeInstructionsInfo = filterEnumeratedInstructionOrExpressionMetadataByScope(
      enumerateFreeInstructions(this.props.isCondition, i18n),
      this.props.scope
    );
    this.freeInstructionsInfoTree = createTree(this.freeInstructionsInfo);
    this.forceUpdate();
  };

  // All the instructions, to be used when searching, so that the search is done
  // across all the instructions (including object and behaviors instructions).
  allInstructionsInfo: Array<EnumeratedInstructionMetadata> = filterEnumeratedInstructionOrExpressionMetadataByScope(
    enumerateAllInstructions(this.props.isCondition, this.props.i18n),
    this.props.scope
  );

  componentDidMount() {
    if (this._selectedInstructionItem.current && this._scrollView.current) {
      this._scrollView.current.scrollTo(this._selectedInstructionItem.current);
    }

    // The objects must never be kept in a state as they may be temporary copies.
    // Search for "ProjectScopedContainers wrongly containing temporary objects containers or objects"
    // in the codebase.
    const objectsContainersList = this.props.projectScopedContainersAccessor
      .get()
      .getObjectsContainersList();

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
    const globalObjectsContainer =
      objectsContainersList.getObjectsContainersCount() > 1
        ? objectsContainersList.getObjectsContainer(0)
        : null;
    const objectsContainer = objectsContainersList.getObjectsContainer(
      objectsContainersList.getObjectsContainersCount() - 1
    );

    if (this.props.chosenObjectName) {
      const objectOrGroupName = this.props.chosenObjectName;
      const treeView = this._treeView.current;
      const object = getObjectByName(
        globalObjectsContainer,
        objectsContainer,
        objectOrGroupName
      );
      let itemId;
      if (object) {
        itemId = getObjectTreeViewItemId(object);
      } else {
        const group = getObjectGroupByName(
          globalObjectsContainer,
          objectsContainer,
          objectOrGroupName
        );
        if (group) {
          itemId = getObjectTreeViewItemId(group);
        }
      }

      if (treeView && itemId) {
        treeView.scrollToItemFromId(itemId);
      }
    }

    this.setState({
      initiallyOpenedFolderIds: [
        ...(globalObjectsContainer
          ? enumerateFoldersInContainer(globalObjectsContainer).map(
              folderWithPath => folderWithPath.folder
            )
          : []),
        ...enumerateFoldersInContainer(objectsContainer).map(
          folderWithPath => folderWithPath.folder
        ),
      ].map(getObjectFolderTreeViewItemId),
    });

    this.instructionSearchApi = new Fuse(this.allInstructionsInfo, {
      ...sharedFuseConfiguration,
      keys: [
        { name: 'displayedName', weight: 5 },
        { name: 'fullGroupName', weight: 1 },
        { name: 'description', weight: 3 },
      ],
    });
  }

  _search = (searchText: string) => {
    if (searchText === '') return;

    this.setState(
      {
        searchResults: {
          instructions: this.instructionSearchApi
            ? moveDeprecatedInstructionsDown(
                this.instructionSearchApi
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
              )
            : [],
        },
      },
      () => {
        if (this._treeView.current) this._treeView.current.updateRowHeights();
      }
    );
  };

  getItemHeight = (item: TreeViewItem) =>
    item.content instanceof InstructionTreeViewItemContent ? 44 : 32;
  getTreeViewItemName = (item: TreeViewItem) => item.content.getName();
  shouldApplySearchToItem = (item: TreeViewItem) => item.content.applySearch;
  getTreeViewItemDescription = (item: TreeViewItem) =>
    item.content.getDescription();
  getTreeViewItemId = (item: TreeViewItem) => item.content.getId();
  getTreeViewItemHtmlId = (item: TreeViewItem, index: number) =>
    item.content.getHtmlId(index);

  getTreeViewItemChildren = (item: TreeViewItem) =>
    item.getChildren(this.state.searchText);
  getTreeViewItemThumbnail = (item: TreeViewItem) =>
    item.content.getThumbnail();
  getTreeViewItemDataset = (item: TreeViewItem) => item.content.getDataSet();

  render() {
    const {
      style,
      projectScopedContainersAccessor,
      project,
      chosenInstructionType,
      onChooseInstruction,
      chosenObjectName,
      onChooseObject,
      isCondition,
      currentTab,
      onChangeTab,
      onSearchStartOrReset,
      onClickMore,
    } = this.props;

    // The objects must never be kept in a state as they may be temporary copies.
    // Search for "ProjectScopedContainers wrongly containing temporary objects containers or objects"
    // in the codebase.
    const objectsContainersList = projectScopedContainersAccessor
      .get()
      .getObjectsContainersList();

    if (objectsContainersList.getObjectsContainersCount() === 0) {
      throw new Error(
        'Called InstructionOrObjectSelector without any object container.'
      );
    }
    // TODO Use a loop instead of looking for 2 object containers.
    if (objectsContainersList.getObjectsContainersCount() > 2) {
      console.error(
        'Called InstructionOrObjectSelector with more than 2 object containers.'
      );
    }
    const globalObjectsContainer =
      objectsContainersList.getObjectsContainersCount() > 1
        ? objectsContainersList.getObjectsContainer(0)
        : null;
    const objectsContainer = objectsContainersList.getObjectsContainer(
      objectsContainersList.getObjectsContainersCount() - 1
    );

    const {
      searchText,
      searchResults,
      selectedItem,
      initiallyOpenedFolderIds,
    } = this.state;
    // If the global objects container is not the project, consider that we're
    // not in the events of a layout or an external events sheet - but in an extension.
    const isOutsideLayout = globalObjectsContainer !== project;

    const { allObjectsList } = enumerateObjectsAndGroups(objectsContainersList);

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

    const hasResults = !isSearching || !!displayedInstructionsList.length;

    const onSubmitSearch = () => {
      if (!isSearching) return;
      // TODO: Add possibility to chose first object/group when submitting search.
      if (displayedInstructionsList.length > 0) {
        onChooseInstruction(
          displayedInstructionsList[0].item.type,
          displayedInstructionsList[0].item
        );
      }
    };
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

    const getTreeViewItems = i18n =>
      [
        new ObjectFolderTreeViewItem({
          objectFolderOrObject: objectsRootFolder,
          global: false,
          isRoot: true,
          content: new LabelTreeViewItemContent(
            'scene-objects',
            i18n._(t`Scene Objects`)
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
                'global-objects',
                i18n._(t`Global Objects`)
              ),
              objectTreeViewItemProps,
              objectFolderTreeViewItemProps,
            })
          : null,
        hasGroups
          ? new RootTreeViewItem(
              new LabelTreeViewItemContent('scene-groups', i18n._(t`Groups`)),
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
                'global-groups',
                i18n._(t`Global Groups`)
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
              displayedInstructionsList.map(searchResult => {
                return new LeafTreeViewItem(
                  new InstructionTreeViewItemContent(searchResult.item)
                );
              })
            )
          : null,
      ].filter(Boolean);

    return (
      <I18n>
        {({ i18n }) => (
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
              onChange={searchText => {
                const oldSearchText = this.state.searchText;
                if (!!searchText) this._search(searchText);
                this.setState({
                  searchText,
                });

                // Notify if needed that we started or cleared a search
                if (
                  (!oldSearchText && searchText) ||
                  (oldSearchText && !searchText)
                ) {
                  if (onSearchStartOrReset) onSearchStartOrReset();
                }
              }}
              onRequestSearch={onSubmitSearch}
              ref={this._searchBar}
              autoFocus={this.props.focusOnMount ? 'desktop' : undefined}
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
            {currentTab === 'objects' ? (
              <div style={{ flex: 1 }}>
                <AutoSizer style={{ width: '100%' }} disableWidth>
                  {({ height }) => (
                    <ReadOnlyTreeView
                      ref={this._treeView}
                      height={height}
                      items={getTreeViewItems(i18n)}
                      getItemHeight={this.getItemHeight}
                      getItemName={this.getTreeViewItemName}
                      shouldApplySearchToItem={this.shouldApplySearchToItem}
                      getItemDescription={this.getTreeViewItemDescription}
                      getItemId={this.getTreeViewItemId}
                      getItemHtmlId={this.getTreeViewItemHtmlId}
                      getItemChildren={this.getTreeViewItemChildren}
                      getItemThumbnail={this.getTreeViewItemThumbnail}
                      getItemDataset={this.getTreeViewItemDataset}
                      selectedItems={selectedItem ? [selectedItem] : []}
                      initiallyOpenedNodeIds={[
                        'scene-objects',
                        'global-objects',
                        'scene-groups',
                        'global-groups',
                        ...initiallyOpenedFolderIds,
                      ]}
                      onSelectItems={(items: TreeViewItem[]) => {
                        if (!items) return;
                        const item = items[0];
                        if (!item || item.isRoot) return;
                        const itemContentToSelect = item.content;
                        if (itemContentToSelect.getObjectFolderOrObject) {
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
                          this.setState({
                            selectedItem: item,
                          });
                        } else if (itemContentToSelect.getGroup) {
                          const group = itemContentToSelect.getGroup();
                          if (!group) return;
                          onChooseObject(group.getName());
                          this.setState({
                            selectedItem: item,
                          });
                        } else if (itemContentToSelect.getObject) {
                          const object = itemContentToSelect.getObject();
                          if (!object) return;
                          onChooseObject(object.getName());
                          this.setState({
                            selectedItem: item,
                          });
                        } else if (itemContentToSelect.getInstructionMetadata) {
                          const instructionMetadata = itemContentToSelect.getInstructionMetadata();
                          if (!instructionMetadata) return;
                          onChooseInstruction(
                            instructionMetadata.type,
                            instructionMetadata
                          );
                          this.setState({
                            selectedItem: item,
                          });
                        }
                      }}
                      searchText={searchText}
                      multiSelect={false}
                      //   arrowKeyNavigationProps?: {|
                      //    onGetItemInside: (item: Item) => ?Item,
                      //    onGetItemOutside: (item: Item) => ?Item,
                      //  |},
                    />
                  )}
                </AutoSizer>
              </div>
            ) : (
              <ScrollView ref={this._scrollView} autoHideScrollbar>
                <List>
                  <>
                    {renderInstructionOrExpressionTree({
                      instructionTreeNode: this.freeInstructionsInfoTree,
                      onChoose: onChooseInstruction,
                      iconSize,
                      useSubheaders: true,
                      selectedValue: chosenInstructionType
                        ? getInstructionListItemValue(chosenInstructionType)
                        : undefined,
                      initiallyOpenedPath: this.initialInstructionTypePath,
                      selectedItemRef: this._selectedInstructionItem,
                      getGroupIconSrc,
                    })}
                    {onClickMore && (
                      <ResponsiveLineStackLayout justifyContent="center">
                        <RaisedButton
                          primary
                          icon={<Add />}
                          onClick={onClickMore}
                          label={
                            isCondition ? (
                              <Trans>
                                Search for new conditions in extensions
                              </Trans>
                            ) : (
                              <Trans>
                                Search for new actions in extensions
                              </Trans>
                            )
                          }
                        />
                      </ResponsiveLineStackLayout>
                    )}
                  </>
                </List>
                {/* <List>
                {(isSearching || currentTab === 'objects') && (
                    <React.Fragment>
                      {filteredObjectsList.map(
                        ({ item: objectWithContext, matches }, index) =>
                          renderObjectListItem({
                            project: project,
                            objectWithContext: objectWithContext,
                            iconSize: iconSize,
                            onClick: () =>
                              onChooseObject(
                                objectWithContext.object.getName()
                              ),
                            matchesCoordinates: matches.length
                              ? matches[0].indices // Only field for objects is their name
                              : [],
                            selectedValue: chosenObjectName
                              ? getObjectOrObjectGroupListItemValue(
                                  chosenObjectName
                                )
                              : undefined,
                            id: 'object-item-' + index,
                            data: {
                              objectName: objectWithContext.object.getName(),
                            },
                          })
                      )}

                      {displayedObjectGroupsList.length > 0 && (
                        <Subheader>
                          <Trans>Object groups</Trans>
                        </Subheader>
                      )}
                      {displayedObjectGroupsList.map(
                        ({ item: groupWithContext, matches }, index) => {
                          const results = [];

                          results.push(
                            renderGroupObjectsListItem({
                              id: 'objectGroup-item-' + index,
                              data: {
                                objectName: groupWithContext.group.getName(),
                              },
                              groupWithContext,
                              iconSize,
                              onClick: () =>
                                onChooseObject(
                                  groupWithContext.group.getName()
                                ),
                              matchesCoordinates: matches.length
                                ? matches[0].indices // Only field for groups is their name
                                : [],
                              selectedValue: chosenObjectName
                                ? getObjectOrObjectGroupListItemValue(
                                    chosenObjectName
                                  )
                                : undefined,
                            })
                          );
                          if (isSearching) {
                            const { group, global } = groupWithContext;
                            const groupName = group.getName();
                            const objectsInGroup = group
                              .getAllObjectsNames()
                              .toJSArray()
                              .map(objectName => {
                                // A global object group can contain scene objects so we cannot use
                                // the group context to get directly get the object knowing the
                                // appropriate container.
                                const object = getObjectByName(
                                  globalObjectsContainer,
                                  objectsContainer,
                                  objectName
                                );
                                if (!object) return null;

                                return renderObjectListItem({
                                  project,
                                  objectWithContext: {
                                    object,
                                    global,
                                  },
                                  keyPrefix: `group-${groupName}`,
                                  withIndent: true,
                                  iconSize,
                                  onClick: () => onChooseObject(objectName),
                                  matchesCoordinates: [],
                                  selectedValue: chosenObjectName
                                    ? getObjectOrObjectGroupListItemValue(
                                        chosenObjectName
                                      )
                                    : undefined,
                                });
                              })
                              .filter(Boolean);
                            if (objectsInGroup.length === 0) {
                              results.push(
                                <ListItem
                                  key={`${group.getName()}-empty`}
                                  primaryText={
                                    <Text style={styles.noObjectsText} noMargin>
                                      <Trans>No objects in the group</Trans>
                                    </Text>
                                  }
                                  style={styles.indentedListItem}
                                />
                              );
                            } else {
                              results.push(...objectsInGroup);
                            }
                          }
                          return results;
                        }
                      )}
                      {filteredFoldersList.length > 0 && (
                        <Subheader>
                          <Trans>Folders</Trans>
                        </Subheader>
                      )}
                      {filteredFoldersList.map(
                        ({ item: folderWithPath, matches }) => {
                          const results = [];

                          results.push(
                            renderFolderListItem({
                              folderWithPath,
                              iconSize,
                              matchesCoordinates: matches.length
                                ? matches[0].indices
                                : [],
                            })
                          );
                          const objectsInFolder = getObjectsInFolder(
                            folderWithPath.folder
                          );
                          if (objectsInFolder.length === 0) {
                            results.push(
                              <ListItem
                                key={`${folderWithPath.path}-empty`}
                                primaryText={
                                  <Text style={styles.noObjectsText} noMargin>
                                    <Trans>No objects in the folder</Trans>
                                  </Text>
                                }
                                style={styles.indentedListItem}
                              />
                            );
                          } else {
                            results.push(
                              ...objectsInFolder.map(object =>
                                renderObjectListItem({
                                  project,
                                  selectedValue: chosenObjectName
                                    ? getObjectOrObjectGroupListItemValue(
                                        chosenObjectName
                                      )
                                    : undefined,
                                  keyPrefix: `folder-${folderWithPath.path}`,
                                  iconSize,
                                  matchesCoordinates: [],
                                  objectWithContext: {
                                    object,
                                    global: folderWithPath.global,
                                  },
                                  withIndent: true,
                                  onClick: () =>
                                    onChooseObject(object.getName()),
                                })
                              )
                            );
                          }

                          return results;
                        }
                      )}
                    </React.Fragment>
                  )}
                  {isSearching && displayedInstructionsList.length > 0 && (
                    <Subheader>
                      {isCondition ? (
                        <Trans>Conditions</Trans>
                      ) : (
                        <Trans>Actions</Trans>
                      )}
                    </Subheader>
                  )}
                  {isSearching &&
                    displayedInstructionsList.map(
                      ({ item: instructionMetadata, matches }) =>
                        renderInstructionOrExpressionListItem({
                          instructionOrExpressionMetadata: instructionMetadata,
                          iconSize: iconSize,
                          id: `instruction-item-${instructionMetadata.type.replace(
                            /:/g,
                            '-'
                          )}`,
                          onClick: () =>
                            onChooseInstruction(
                              instructionMetadata.type,
                              instructionMetadata
                            ),
                          selectedValue: chosenInstructionType
                            ? getInstructionListItemValue(chosenInstructionType)
                            : undefined,
                          matches,
                        })
                    )}
                  {!isSearching && currentTab === 'free-instructions' && (
                    <>
                      {renderInstructionOrExpressionTree({
                        instructionTreeNode: this.freeInstructionsInfoTree,
                        onChoose: onChooseInstruction,
                        iconSize,
                        useSubheaders: true,
                        selectedValue: chosenInstructionType
                          ? getInstructionListItemValue(chosenInstructionType)
                          : undefined,
                        initiallyOpenedPath: this.initialInstructionTypePath,
                        selectedItemRef: this._selectedItem,
                        getGroupIconSrc,
                      })}
                      {onClickMore && (
                        <ResponsiveLineStackLayout justifyContent="center">
                          <RaisedButton
                            primary
                            icon={<Add />}
                            onClick={onClickMore}
                            label={
                              isCondition ? (
                                <Trans>
                                  Search for new conditions in extensions
                                </Trans>
                              ) : (
                                <Trans>
                                  Search for new actions in extensions
                                </Trans>
                              )
                            }
                          />
                        </ResponsiveLineStackLayout>
                      )}
                    </>
                  )}
                  {remainingResultsCount > 0 && (
                    <ListItem
                      primaryText={
                        <Trans>And {remainingResultsCount} more results.</Trans>
                      }
                      disabled
                      secondaryText={
                        <Trans>
                          Refine your search with more specific keyword to see
                          them.
                        </Trans>
                      }
                    />
                  )}
                </List> */}
                {!isSearching &&
                  currentTab === 'objects' &&
                  !allObjectsList.length && (
                    <EmptyMessage>
                      {isOutsideLayout ? (
                        <Trans>
                          There are no objects. Objects will appear if you add
                          some as parameters.
                        </Trans>
                      ) : (
                        <Trans>
                          There is no object in your game or in this scene.
                          Start by adding an new object in the scene editor,
                          using the objects list.
                        </Trans>
                      )}
                    </EmptyMessage>
                  )}
                {!hasResults && (
                  <EmptyMessage>
                    <Trans>
                      Nothing corresponding to your search. Choose an object
                      first or browse the list of actions/conditions.
                    </Trans>
                  </EmptyMessage>
                )}
              </ScrollView>
            )}
          </div>
        )}
      </I18n>
    );
  }
}
