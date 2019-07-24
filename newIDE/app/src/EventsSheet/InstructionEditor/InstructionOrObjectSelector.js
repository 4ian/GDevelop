// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import {
  createTree,
  type InstructionOrExpressionTreeNode,
} from './InstructionOrExpressionSelector/CreateTree';
import {
  enumerateFreeInstructions,
  filterInstructionsList,
} from './InstructionOrExpressionSelector/EnumerateInstructions';
import { type EnumeratedInstructionOrExpressionMetadata } from './InstructionOrExpressionSelector/EnumeratedInstructionOrExpressionMetadata.js';
import { List } from 'material-ui/List';
import SearchBar from '../../UI/SearchBar';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';
import ScrollView from '../../UI/ScrollView';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Subheader } from 'material-ui';
import {
  enumerateObjectsAndGroups,
  filterObjectsList,
  filterGroupsList,
  enumerateObjects,
} from '../../ObjectsList/EnumerateObjects';
import TagChips from '../../UI/TagChips';
import SelectorGroupObjectsListItem from './SelectorListItems/SelectorGroupObjectsListItem';
import SelectorObjectListItem from './SelectorListItems/SelectorObjectListItem';
import SelectorInstructionOrExpressionListItem from './SelectorListItems/SelectorInstructionOrExpressionListItem';
import { renderInstructionTree } from './SelectorListItems/SelectorInstructionsTreeListItem';
import EmptyMessage from '../../UI/EmptyMessage';
import {
  buildTagsMenuTemplate,
  getTagsFromString,
} from '../../Utils/TagsHelper';

const styles = {
  searchBar: {
    flexShrink: 0,
  },
};

type TabNames = 'objects' | 'free-instructions';

type State = {|
  currentTab: TabNames,

  searchText: string,

  // State for tags of objects:
  selectedObjectTags: Array<string>,
|};

type Props = {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  isCondition: boolean,
  focusOnMount?: boolean,
  onChooseInstruction: (
    type: string,
    EnumeratedInstructionOrExpressionMetadata
  ) => void,
  onChooseObject: (objectName: string) => void,
  style?: Object,
|};

const iconSize = 24;

export default class InstructionOrObjectSelector extends React.Component<
  Props,
  State
> {
  state = { currentTab: 'objects', searchText: '', selectedObjectTags: [] };
  _searchBar = React.createRef<SearchBar>();

  instructionsInfo: Array<EnumeratedInstructionOrExpressionMetadata> = enumerateFreeInstructions(
    this.props.isCondition
  );
  instructionsInfoTree: InstructionOrExpressionTreeNode = createTree(
    this.instructionsInfo
  );

  componentDidMount() {
    if (this.props.focusOnMount && this._searchBar.current) {
      this._searchBar.current.focus();
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
      onChooseInstruction,
      onChooseObject,
      isCondition,
    } = this.props;
    const { currentTab, searchText, selectedObjectTags } = this.state;

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
      }
      if (displayedInstructionsList.length > 0) {
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
                  ...style,
                }}
              >
                <SearchBar
                  value={searchText}
                  onChange={searchText =>
                    this.setState({
                      searchText,
                    })
                  }
                  onRequestSearch={onSubmitSearch}
                  buildTagsMenuTemplate={() =>
                    this._buildObjectTagsMenuTemplate(i18n)
                  }
                  style={styles.searchBar}
                  ref={this._searchBar}
                />
                {!isSearching && (
                  <Tabs
                    value={currentTab}
                    onChange={(currentTab: TabNames) =>
                      this.setState({
                        currentTab,
                      })
                    }
                  >
                    <Tab
                      label={<Trans>Objects</Trans>}
                      value={('objects': TabNames)}
                    />
                    <Tab
                      label={
                        isCondition ? (
                          <Trans>Non-objects and other conditions</Trans>
                        ) : (
                          <Trans>Non-objects and other actions</Trans>
                        )
                      }
                      value={('free-instructions': TabNames)}
                    >
                      {/* Manually display tabs to support flex */}
                    </Tab>
                  </Tabs>
                )}
                <ScrollView>
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
                        displayedObjectsList.map(objectWithContext => (
                          <SelectorObjectListItem
                            key={'object-' + objectWithContext.object.ptr}
                            project={project}
                            objectWithContext={objectWithContext}
                            iconSize={iconSize}
                            onClick={() =>
                              onChooseObject(objectWithContext.object.getName())
                            }
                          />
                        ))}
                      {(isSearching || currentTab === 'objects') &&
                        displayedObjectGroupsList.length > 0 && (
                          <Subheader>
                            <Trans>Object groups</Trans>
                          </Subheader>
                        )}
                      {(isSearching || currentTab === 'objects') &&
                        displayedObjectGroupsList.map(groupWithContext => (
                          <SelectorGroupObjectsListItem
                            key={'group-' + groupWithContext.group.ptr}
                            groupWithContext={groupWithContext}
                            iconSize={iconSize}
                            onClick={() =>
                              onChooseObject(groupWithContext.group.getName())
                            }
                          />
                        ))}
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
                        displayedInstructionsList.map(instructionMetadata => (
                          <SelectorInstructionOrExpressionListItem
                            key={'instruction-' + instructionMetadata.type}
                            instructionOrExpressionMetadata={
                              instructionMetadata
                            }
                            iconSize={iconSize}
                            onClick={() =>
                              onChooseInstruction(
                                instructionMetadata.type,
                                instructionMetadata
                              )
                            }
                          />
                        ))}
                      {!isSearching &&
                        currentTab === 'free-instructions' &&
                        renderInstructionTree({
                          instructionTreeNode: this.instructionsInfoTree,
                          onChoose: onChooseInstruction,
                          iconSize,
                        })}
                    </List>
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
