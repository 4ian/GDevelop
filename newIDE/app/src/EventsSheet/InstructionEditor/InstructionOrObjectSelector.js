// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import Fuse from 'fuse.js';

import * as React from 'react';
import Add from '@material-ui/icons/Add';
import { Chip } from '@material-ui/core';
import {
  createTree,
  type InstructionOrExpressionTreeNode,
  findInTree,
} from '../../InstructionOrExpression/CreateTree';
import {
  enumerateAllInstructions,
  enumerateFreeInstructions,
  deduplicateInstructionsList,
} from '../../InstructionOrExpression/EnumerateInstructions';
import {
  type EnumeratedInstructionMetadata,
  filterEnumeratedInstructionOrExpressionMetadataByScope,
} from '../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';
import { List, type ListItemRefType, ListItem } from '../../UI/List';
import SearchBar, {
  useShouldAutofocusSearchbar,
  type SearchBarInterface,
} from '../../UI/SearchBar';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import { Tabs, Tab } from '../../UI/Tabs';
import Subheader from '../../UI/Subheader';
import {
  enumerateObjectsAndGroups,
  filterObjectByTags,
  type ObjectWithContext,
  type GroupWithContext,
  enumerateObjects,
} from '../../ObjectsList/EnumerateObjects';
import TagChips from '../../UI/TagChips';
import RaisedButton from '../../UI/RaisedButton';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import { renderGroupObjectsListItem } from './SelectorListItems/SelectorGroupObjectsListItem';
import { renderObjectListItem } from './SelectorListItems/SelectorObjectListItem';
import { renderInstructionOrExpressionListItem } from './SelectorListItems/SelectorInstructionOrExpressionListItem';
import { renderInstructionOrExpressionTree } from './SelectorListItems/SelectorInstructionsTreeListItem';
import EmptyMessage from '../../UI/EmptyMessage';
import {
  buildTagsMenuTemplate,
  getTagsFromString,
} from '../../Utils/TagsHelper';
import {
  getObjectOrObjectGroupListItemValue,
  getInstructionListItemValue,
} from './SelectorListItems/Keys';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope.flow';
import {
  type SearchResult,
  tuneMatches,
  sharedFuseConfiguration,
} from '../../UI/Search/UseSearchStructuredItem';

const gd: libGDevelop = global.gd;

const DISPLAYED_INSTRUCTIONS_MAX_LENGTH = 20;

export type TabName = 'objects' | 'free-instructions';

type State = {|
  searchText: string,
  searchResults: {
    objects: Array<SearchResult<ObjectWithContext>>,
    groups: Array<SearchResult<GroupWithContext>>,
    tags: Array<SearchResult<string>>,
    instructions: Array<SearchResult<EnumeratedInstructionMetadata>>,
  },

  // State for tags of objects:
  selectedObjectTags: Array<string>,
|};

type Props = {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
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
|};

const iconSize = 24;
const getGroupIconSrc = (key: string) => {
  return gd.JsPlatform.get()
    .getInstructionOrExpressionGroupMetadata(key)
    .getIcon();
};

export default class InstructionOrObjectSelector extends React.PureComponent<
  Props,
  State
> {
  state = {
    searchText: '',
    selectedObjectTags: [],
    searchResults: { objects: [], groups: [], instructions: [], tags: [] },
  };
  _searchBar = React.createRef<SearchBarInterface>();
  _scrollView = React.createRef<ScrollViewInterface>();
  _selectedItem = React.createRef<ListItemRefType>();

  // Free instructions, to be displayed in a tab next to the objects.
  freeInstructionsInfo: Array<EnumeratedInstructionMetadata> = filterEnumeratedInstructionOrExpressionMetadataByScope(
    enumerateFreeInstructions(this.props.isCondition),
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
  objectSearchApi = null;
  groupSearchApi = null;
  tagSearchApi = null;

  reEnumerateInstructions = () => {
    this.freeInstructionsInfo = filterEnumeratedInstructionOrExpressionMetadataByScope(
      enumerateFreeInstructions(this.props.isCondition),
      this.props.scope
    );
    this.freeInstructionsInfoTree = createTree(this.freeInstructionsInfo);
    this.forceUpdate();
  };

  // All the instructions, to be used when searching, so that the search is done
  // across all the instructions (including object and behaviors instructions).
  allInstructionsInfo: Array<EnumeratedInstructionMetadata> = filterEnumeratedInstructionOrExpressionMetadataByScope(
    enumerateAllInstructions(this.props.isCondition),
    this.props.scope
  );

  componentDidMount() {
    if (
      this.props.focusOnMount &&
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useShouldAutofocusSearchbar() &&
      this._searchBar.current
    ) {
      this._searchBar.current.focus();
    }
    if (this._selectedItem.current && this._scrollView.current) {
      this._scrollView.current.scrollTo(this._selectedItem.current);
    }
    const { allObjectsList, allGroupsList } = enumerateObjectsAndGroups(
      this.props.globalObjectsContainer,
      this.props.objectsContainer
    );

    this.instructionSearchApi = new Fuse(
      deduplicateInstructionsList(this.allInstructionsInfo),
      {
        ...sharedFuseConfiguration,
        keys: [
          { name: 'displayedName', weight: 5 },
          { name: 'fullGroupName', weight: 1 },
        ],
      }
    );
    this.objectSearchApi = new Fuse(allObjectsList, {
      ...sharedFuseConfiguration,
      getFn: (item, property) => item.object.getName(),
      keys: ['name'], // Not used as we only use the name of the object
    });
    this.groupSearchApi = new Fuse(allGroupsList, {
      ...sharedFuseConfiguration,
      getFn: (item, property) => item.group.getName(),
      keys: ['name'], // Not used as we only use the name of the group
    });
    this.tagSearchApi = new Fuse(this._getAllObjectTags(), {
      ...sharedFuseConfiguration,
    });
  }

  _search = (searchText: string) => {
    if (searchText === '') return;

    this.setState({
      searchResults: {
        objects: this.objectSearchApi
          ? this.objectSearchApi.search(`'${searchText}`).map(result => ({
              item: result.item,
              matches: tuneMatches(result, searchText),
            }))
          : [],
        groups: this.groupSearchApi
          ? this.groupSearchApi.search(`'${searchText}`).map(result => ({
              item: result.item,
              matches: tuneMatches(result, searchText),
            }))
          : [],
        instructions: this.instructionSearchApi
          ? this.instructionSearchApi.search(`'${searchText}`).map(result => ({
              item: result.item,
              matches: tuneMatches(result, searchText),
            }))
          : [],
        tags: this.tagSearchApi
          ? this.tagSearchApi.search(`'${searchText}`).map(result => ({
              item: result.item,
              matches: tuneMatches(result, searchText),
            }))
          : [],
      },
    });
  };

  _selectTag = (tag: string) => {
    this.setState({
      selectedObjectTags: [...this.state.selectedObjectTags, tag],
      searchText: '',
    });
    this._searchBar.current && this._searchBar.current.focus();
  };

  _getAllObjectTags = (): Array<string> => {
    const { globalObjectsContainer, objectsContainer } = this.props;

    const tagsSet: Set<string> = new Set();
    enumerateObjects(
      globalObjectsContainer,
      objectsContainer
    ).allObjectsList.forEach(({ object }) => {
      getTagsFromString(object.getTags()).forEach(tag => tagsSet.add(tag));
    });

    return Array.from(tagsSet);
  };

  _buildObjectTagsMenuTemplate = (i18n: I18nType): Array<any> => {
    const { selectedObjectTags } = this.state;

    return buildTagsMenuTemplate({
      noTagLabel: i18n._(t`No tags - add a tag to an object first`),
      getAllTags: this._getAllObjectTags,
      selectedTags: selectedObjectTags,
      onChange: selectedObjectTags => {
        this.setState({ selectedObjectTags });
      },
    });
  };

  render() {
    const {
      style,
      globalObjectsContainer,
      objectsContainer,
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
    const { searchText, selectedObjectTags, searchResults } = this.state;

    // If the global objects container is not the project, consider that we're
    // not in the events of a layout or an external events sheet - but in an extension.
    const isOutsideLayout = globalObjectsContainer !== project;

    const { allObjectsList, allGroupsList } = enumerateObjectsAndGroups(
      globalObjectsContainer,
      objectsContainer
    );
    const isSearching = !!searchText;

    let filteredObjectsList = [];
    let displayedObjectGroupsList = [];
    let filteredInstructionsList = [];
    let displayedTags = [];

    if (isSearching) {
      filteredObjectsList = searchResults.objects;
      displayedObjectGroupsList = searchResults.groups;
      filteredInstructionsList = searchResults.instructions;
      displayedTags = searchResults.tags;
    } else {
      filteredObjectsList = allObjectsList.map(object => ({
        item: object,
        matches: [],
      }));
      displayedObjectGroupsList = allGroupsList.map(object => ({
        item: object,
        matches: [],
      }));
    }
    const displayedObjectsList = filteredObjectsList.filter(searchResult =>
      filterObjectByTags(searchResult.item, selectedObjectTags)
    );

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

    const hasResults =
      !isSearching ||
      !!displayedObjectsList.length ||
      !!displayedObjectGroupsList.length ||
      !!displayedInstructionsList.length ||
      !!displayedTags.length;

    const onSubmitSearch = () => {
      if (!isSearching) return;

      if (displayedObjectsList.length > 0) {
        onChooseObject(displayedObjectsList[0].item.object.getName());
      } else if (displayedObjectGroupsList.length > 0) {
        onChooseObject(displayedObjectGroupsList[0].item.group.getName());
      } else if (displayedTags.length > 0) {
        this._selectTag(displayedTags[0].item);
      } else if (displayedInstructionsList.length > 0) {
        onChooseInstruction(
          displayedInstructionsList[0].item.type,
          displayedInstructionsList[0].item
        );
      }
    };

    return (
      <I18n key="tags">
        {({ i18n }) => (
          <ThemeConsumer>
            {muiTheme => (
              <div
                style={{
                  backgroundColor: muiTheme.list.itemsBackgroundColor,
                  minHeight: 0,
                  ...style,
                }}
              >
                <SearchBar
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
                  buildMenuTemplate={() =>
                    this._buildObjectTagsMenuTemplate(i18n)
                  }
                  aspect="integrated-search-bar"
                  ref={this._searchBar}
                  placeholder={
                    isCondition
                      ? t`Search objects or conditions`
                      : t`Search objects or actions`
                  }
                />
                {!isSearching && (
                  <Tabs value={currentTab} onChange={onChangeTab}>
                    <Tab
                      label={<Trans>Objects</Trans>}
                      value={('objects': TabName)}
                    />
                    <Tab
                      label={
                        isCondition ? (
                          <Trans>Other conditions</Trans>
                        ) : (
                          <Trans>Other actions</Trans>
                        )
                      }
                      value={('free-instructions': TabName)}
                    />
                  </Tabs>
                )}
                <ScrollView ref={this._scrollView}>
                  {!isSearching && currentTab === 'objects' && (
                    <TagChips
                      tags={selectedObjectTags}
                      onChange={selectedObjectTags =>
                        this.setState({
                          selectedObjectTags,
                        })
                      }
                    />
                  )}
                  {hasResults && (
                    <List>
                      {(isSearching || currentTab === 'objects') && (
                        <React.Fragment>
                          {displayedObjectsList.map(
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
                              })
                          )}

                          {displayedObjectGroupsList.length > 0 && (
                            <Subheader>
                              <Trans>Object groups</Trans>
                            </Subheader>
                          )}
                          {displayedObjectGroupsList.map(
                            ({ item: groupWithContext, matches }) =>
                              renderGroupObjectsListItem({
                                groupWithContext: groupWithContext,
                                iconSize: iconSize,
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
                          )}
                        </React.Fragment>
                      )}
                      {isSearching &&
                        currentTab === 'objects' &&
                        displayedTags.length > 0 && (
                          <Subheader>
                            <Trans>Object tags</Trans>
                          </Subheader>
                        )}
                      {currentTab === 'objects' &&
                        displayedTags.map(({ item: tag, matches }) => (
                          <ListItem
                            key={tag}
                            primaryText={<Chip label={tag} />}
                            onClick={() => {
                              this._selectTag(tag);
                            }}
                            disableAutoTranslate
                          />
                        ))}
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
                              onClick: () =>
                                onChooseInstruction(
                                  instructionMetadata.type,
                                  instructionMetadata
                                ),
                              selectedValue: chosenInstructionType
                                ? getInstructionListItemValue(
                                    chosenInstructionType
                                  )
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
                              ? getInstructionListItemValue(
                                  chosenInstructionType
                                )
                              : undefined,
                            initiallyOpenedPath: this
                              .initialInstructionTypePath,
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
                            <Trans>
                              And {remainingResultsCount} more results.
                            </Trans>
                          }
                          disabled
                          secondaryText={
                            <Trans>
                              Refine your search with more specific keyword to
                              see them.
                            </Trans>
                          }
                        />
                      )}
                    </List>
                  )}
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
              </div>
            )}
          </ThemeConsumer>
        )}
      </I18n>
    );
  }
}
