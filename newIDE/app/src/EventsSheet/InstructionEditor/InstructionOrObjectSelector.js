// @flow
import React, { Component } from 'react';
import {
  createTree,
  type InstructionOrExpressionTreeNode,
} from './InstructionOrExpressionSelector/CreateTree';
import { enumerateFreeInstructions } from './InstructionOrExpressionSelector/EnumerateInstructions';
import { type InstructionOrExpressionInformation } from './InstructionOrExpressionSelector/InstructionOrExpressionInformation.flow.js';
import { List, ListItem, makeSelectable } from 'material-ui/List';
import SearchBar from 'material-ui-search-bar/lib/components/SearchBar';
import ListIcon from '../../UI/ListIcon';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';
import ScrollView from '../../UI/ScrollView';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Subheader } from 'material-ui';
import { Trans } from '@lingui/macro';
import { enumerateObjectsAndGroups } from '../../ObjectsList/EnumerateObjects';
import ObjectsRenderingService from '../../ObjectsRendering/ObjectsRenderingService';

const SelectableList = makeSelectable(List);

const styles = {
  searchBar: {
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  groupListItemNestedList: {
    padding: 0,
  },
};

type TabNames = 'objects' | 'free-instructions';

type State = {|
  currentTab: TabNames,
|};

type Props = {|
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  isCondition: boolean,
  focusOnMount?: boolean,
  selectedType: string,
  onChooseInstruction: (
    type: string,
    InstructionOrExpressionInformation
  ) => void,
  onChooseObject: (objectName: string) => void,
  style?: Object,
|};

const iconSize = 24;

// TODO: Factor this
const renderInstructionTree = (
  muiTheme: any,
  instructionInfoTree: InstructionOrExpressionTreeNode,
  onChoose: (type: string, InstructionOrExpressionInformation) => void
): Array<ListItem> => {
  return Object.keys(instructionInfoTree).map(key => {
    // $FlowFixMe - in theory, we should have a way to distinguish
    // between instruction (leaf nodes) and group (nodes). We use
    // the "type" properties, but this will fail if a group is called "type"
    // (hence the flow errors, which are valid warnings)
    const instructionOrGroup = instructionInfoTree[key];
    if (!instructionOrGroup) return null;

    if (typeof instructionOrGroup.type === 'string') {
      // $FlowFixMe - see above
      const instructionInformation: InstructionOrExpressionInformation = instructionOrGroup;
      return (
        <ListItem
          key={key}
          primaryText={key}
          value={instructionOrGroup.type}
          leftIcon={
            <ListIcon
              iconSize={iconSize}
              src={instructionInformation.iconFilename}
            />
          }
          onClick={() => {
            onChoose(instructionInformation.type, instructionInformation);
          }}
        />
      );
    } else {
      // $FlowFixMe - see above
      const groupOfInstructionInformation = (instructionOrGroup: InstructionOrExpressionTreeNode);
      const isDeprecated = key.indexOf('(deprecated)') !== -1;
      return (
        <ListItem
          key={key}
          nestedListStyle={styles.groupListItemNestedList}
          primaryText={
            <div
              style={{
                color: isDeprecated
                  ? muiTheme.listItem.deprecatedGroupTextColor
                  : undefined,
              }}
            >
              {key}
            </div>
          }
          primaryTogglesNestedList={true}
          autoGenerateNestedIndicator={true}
          nestedItems={renderInstructionTree(
            muiTheme,
            groupOfInstructionInformation,
            onChoose
          )}
        />
      );
    }
  });
};

export default class InstructionOrObjectSelector extends Component<
  Props,
  State
> {
  state = { currentTab: 'objects' };

  instructionsInfo: Array<InstructionOrExpressionInformation> = enumerateFreeInstructions(
    this.props.isCondition
  );
  instructionsInfoTree: InstructionOrExpressionTreeNode = createTree(
    this.instructionsInfo
  );

  _onSubmitSearch = () => {
    //TODO
  };

  render() {
    const {
      selectedType,
      style,
      globalObjectsContainer,
      objectsContainer,
      project,
      onChooseInstruction,
      onChooseObject,
      isCondition,
    } = this.props;
    const { currentTab } = this.state;

    const { allObjectsList, allGroupsList } = enumerateObjectsAndGroups(
      globalObjectsContainer,
      objectsContainer
    );

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
              onChange={
                text => {}
                // this.setState({ //TODO
                //   search: text,
                //   searchResults: this._computeSearchResults(text),
                // })
              }
              onRequestSearch={this._onSubmitSearch}
              style={styles.searchBar}
              // ref={searchBar => (this._searchBar = searchBar)} TODO
            />

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
            {currentTab === 'objects' && (
              <ScrollView>
                <SelectableList value={selectedType}>
                  {/* TODO: search/tags */}
                  {allObjectsList.map(objectWithContext => {
                    const objectName = objectWithContext.object.getName();
                    return (
                      <ListItem
                        key={objectName}
                        primaryText={objectName}
                        value={objectName}
                        leftIcon={
                          <ListIcon
                            iconSize={iconSize}
                            src={ObjectsRenderingService.getThumbnail(
                              project,
                              objectWithContext.object
                            )}
                          />
                        }
                        onClick={() => {
                          onChooseObject(objectName);
                        }}
                      />
                    );
                  })}
                  <Subheader>
                    <Trans>Object groups</Trans>
                  </Subheader>
                  {allGroupsList.map(groupWithContext => {
                    const groupName = groupWithContext.group.getName();
                    return (
                      <ListItem
                        key={groupName}
                        primaryText={groupName}
                        value={groupName}
                        leftIcon={
                          <ListIcon
                            iconSize={iconSize}
                            src={'res/ribbon_default/objectsgroups64.png'}
                          />
                        }
                        onClick={() => {
                          onChooseObject(groupName);
                        }}
                      />
                    );
                  })}
                </SelectableList>
              </ScrollView>
            )}
            {currentTab === 'free-instructions' && (
              <ScrollView>
                <SelectableList value={selectedType}>
                  {renderInstructionTree(
                    muiTheme,
                    this.instructionsInfoTree,
                    onChooseInstruction
                  )}
                </SelectableList>
              </ScrollView>
            )}
          </div>
        )}
      </ThemeConsumer>
    );
  }
}
