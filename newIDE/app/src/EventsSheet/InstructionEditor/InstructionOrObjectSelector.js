// @flow
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
import SearchBar from 'material-ui-search-bar/lib/components/SearchBar';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';
import ScrollView from '../../UI/ScrollView';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Subheader } from 'material-ui';
import { Trans } from '@lingui/macro';
import {
  enumerateObjectsAndGroups,
  filterObjectsList,
  filterGroupsList,
} from '../../ObjectsList/EnumerateObjects';
import TagChips from '../../UI/TagChips';
import SelectorGroupObjectsListItem from './SelectorListItems/SelectorGroupObjectsListItem';
import SelectorObjectListItem from './SelectorListItems/SelectorObjectListItem';
import SelectorInstructionOrExpressionListItem from './SelectorListItems/SelectorInstructionOrExpressionListItem';
import { renderInstructionTree } from './SelectorListItems/SelectorInstructionsTreeListItem';

const styles = {
  searchBar: {
    backgroundColor: 'transparent',
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
    const displayedObjectGroupsList = selectedObjectTags.length // TODO: Back selectedObjectTags in filterGroupsList
      ? []
      : filterGroupsList(allGroupsList, searchText);
    const displayedInstructionsList = filterInstructionsList(
      this.instructionsInfo,
      { searchText }
    );
    const isSearching = !!searchText;

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
      <ThemeConsumer>
        {muiTheme => (
          <div
            style={{
              backgroundColor: muiTheme.list.itemsBackgroundColor,
              ...style,
            }}
          >
            {/* // TODO: Tags in search bar */}
            <SearchBar
              onChange={searchText =>
                this.setState({
                  searchText,
                })
              }
              onRequestSearch={onSubmitSearch}
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
              <List>
                {(isSearching || currentTab === 'objects') &&
                  displayedObjectsList.map(objectWithContext => (
                    <SelectorObjectListItem
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
                      instructionOrExpressionMetadata={instructionMetadata}
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
            </ScrollView>
          </div>
        )}
      </ThemeConsumer>
    );
  }
}
