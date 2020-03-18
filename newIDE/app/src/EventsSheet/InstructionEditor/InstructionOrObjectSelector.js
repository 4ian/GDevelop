// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import {
  createTree,
  type InstructionOrExpressionTreeNode,
  findInTree,
} from '../../InstructionOrExpression/CreateTree';
import {
  enumerateFreeInstructions,
  filterInstructionsList,
} from '../../InstructionOrExpression/EnumerateInstructions';
import { type EnumeratedInstructionOrExpressionMetadata } from '../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata.js';
import { List, ListItem } from '../../UI/List';
import SearchBar from '../../UI/SearchBar';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import { Tabs, Tab } from '../../UI/Tabs';
import Subheader from '../../UI/Subheader';
import {
  enumerateObjectsAndGroups,
  filterObjectsList,
  filterGroupsList,
  enumerateObjects,
} from '../../ObjectsList/EnumerateObjects';
import TagChips from '../../UI/TagChips';
import { renderGroupObjectsListItem } from './SelectorListItems/SelectorGroupObjectsListItem';
import { renderObjectListItem } from './SelectorListItems/SelectorObjectListItem';
import { renderInstructionOrExpressionListItem } from './SelectorListItems/SelectorInstructionOrExpressionListItem';
import { renderInstructionTree } from './SelectorListItems/SelectorInstructionsTreeListItem';
import EmptyMessage from '../../UI/EmptyMessage';
import {
  buildTagsMenuTemplate,
  getTagsFromString,
} from '../../Utils/TagsHelper';
import {
  getObjectOrObjectGroupListItemValue,
  getInstructionListItemValue,
} from './SelectorListItems/Keys';

const styles = {
  searchBar: {
    flexShrink: 0,
  },
};

export type TabName = 'objects' | 'free-instructions';

type State = {|
  searchText: string,

  // State for tags of objects:
  selectedObjectTags: Array<string>,
|};

type Props = {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  currentTab: TabName,
  onChangeTab: TabName => void,
  isCondition: boolean,
  focusOnMount?: boolean,
  chosenInstructionType: ?string,
  onChooseInstruction: (
    type: string,
    EnumeratedInstructionOrExpressionMetadata
  ) => void,
  chosenObjectName: ?string,
  onChooseObject: (objectName: string) => void,
  onSearchStartOrReset?: () => void,
  style?: Object,
|};

const iconSize = 24;
const minHeight = 400; // Avoid a super small list in empty scenes. 400 is enough to be displayed on an iPhone SE.

export default class InstructionOrObjectSelector extends React.PureComponent<
  Props,
  State
> {
  state = { searchText: '', selectedObjectTags: [] };
  _searchBar = React.createRef<SearchBar>();
  _scrollView = React.createRef<ScrollViewInterface>();
  _selectedItem = React.createRef<ListItem>();

  instructionsInfo: Array<EnumeratedInstructionOrExpressionMetadata> = enumerateFreeInstructions(
    this.props.isCondition
  );
  instructionsInfoTree: InstructionOrExpressionTreeNode = createTree(
    this.instructionsInfo
  );
  initialInstructionTypePath = findInTree(
    this.instructionsInfoTree,
    this.props.chosenInstructionType
  );

  componentDidMount() {
    if (this.props.focusOnMount && this._searchBar.current) {
      this._searchBar.current.focus();
    }
    if (this._selectedItem.current && this._scrollView.current) {
      this._scrollView.current.scrollTo(this._selectedItem.current);
    }
  }

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
    } = this.props;
    const { searchText, selectedObjectTags } = this.state;

    // If the global objects container is not the project, consider that we're
    // not in the events of a layout or an external events sheet - but in an extension.
    const isOutsideLayout = globalObjectsContainer !== project;

    const { allObjectsList, allGroupsList } = enumerateObjectsAndGroups(
      globalObjectsContainer,
      objectsContainer
    );
    const displayedObjectsList = filterObjectsList(allObjectsList, {
      searchText,
      selectedTags: selectedObjectTags,
    });
    const displayedObjectGroupsList = selectedObjectTags.length
      ? []
      : filterGroupsList(allGroupsList, searchText);
    const displayedInstructionsList = filterInstructionsList(
      this.instructionsInfo,
      { searchText }
    );
    const isSearching = !!searchText;
    const hasResults =
      !isSearching ||
      !!displayedObjectsList.length ||
      !!displayedObjectGroupsList.length ||
      !!displayedInstructionsList.length;

    const onSubmitSearch = () => {
      if (!isSearching) return;

      if (displayedObjectsList.length > 0) {
        onChooseObject(displayedObjectsList[0].object.getName());
      } else if (displayedObjectGroupsList.length > 0) {
        onChooseObject(displayedObjectGroupsList[0].group.getName());
      } else if (displayedInstructionsList.length > 0) {
        onChooseInstruction(
          displayedInstructionsList[0].type,
          displayedInstructionsList[0]
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
                  minHeight,
                  ...style,
                }}
              >
                <SearchBar
                  value={searchText}
                  onChange={searchText => {
                    const oldSearchText = this.state.searchText;
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
                  buildTagsMenuTemplate={() =>
                    this._buildObjectTagsMenuTemplate(i18n)
                  }
                  style={styles.searchBar}
                  ref={this._searchBar}
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
                <ScrollView
                  ref={
                    // $FlowFixMe - improper typing of ScrollView?
                    this._scrollView
                  }
                >
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
                      {(isSearching || currentTab === 'objects') &&
                        displayedObjectsList.map(objectWithContext =>
                          renderObjectListItem({
                            project: project,
                            objectWithContext: objectWithContext,
                            iconSize: iconSize,
                            onClick: () =>
                              onChooseObject(
                                objectWithContext.object.getName()
                              ),
                            selectedValue: chosenObjectName
                              ? getObjectOrObjectGroupListItemValue(
                                  chosenObjectName
                                )
                              : undefined,
                          })
                        )}
                      {(isSearching || currentTab === 'objects') &&
                        displayedObjectGroupsList.length > 0 && (
                          <Subheader>
                            <Trans>Object groups</Trans>
                          </Subheader>
                        )}
                      {(isSearching || currentTab === 'objects') &&
                        displayedObjectGroupsList.map(groupWithContext =>
                          renderGroupObjectsListItem({
                            groupWithContext: groupWithContext,
                            iconSize: iconSize,
                            onClick: () =>
                              onChooseObject(groupWithContext.group.getName()),
                            selectedValue: chosenObjectName
                              ? getObjectOrObjectGroupListItemValue(
                                  chosenObjectName
                                )
                              : undefined,
                          })
                        )}
                      {isSearching && displayedInstructionsList.length > 0 && (
                        <Subheader>
                          {isCondition ? (
                            <Trans>Non-objects and other conditions</Trans>
                          ) : (
                            <Trans>Non-objects and other actions</Trans>
                          )}
                        </Subheader>
                      )}
                      {isSearching &&
                        displayedInstructionsList.map(instructionMetadata =>
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
                          })
                        )}
                      {!isSearching &&
                        currentTab === 'free-instructions' &&
                        renderInstructionTree({
                          instructionTreeNode: this.instructionsInfoTree,
                          onChoose: onChooseInstruction,
                          iconSize,
                          selectedValue: chosenInstructionType
                            ? getInstructionListItemValue(chosenInstructionType)
                            : undefined,
                          initiallyOpenedPath: this.initialInstructionTypePath,
                          selectedItemRef: this._selectedItem,
                        })}
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
