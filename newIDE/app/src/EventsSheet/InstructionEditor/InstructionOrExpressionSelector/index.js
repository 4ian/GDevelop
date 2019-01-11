// @flow
import React, { Component } from 'react';
import { List, ListItem, makeSelectable } from 'material-ui/List';
import ListIcon from '../../../UI/ListIcon';
import SearchBar from 'material-ui-search-bar';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { type InstructionOrExpressionInformation } from './InstructionOrExpressionInformation.flow.js';
import { type InstructionOrExpressionTreeNode } from './CreateTree';

const SelectableList = makeSelectable(List);

const styles = {
  searchBar: {
    margin: '0 auto',
    backgroundColor: 'transparent',
  },
  groupListItemNestedList: {
    padding: 0,
  },
};

type Props = {|
  muiTheme: any,
  focusOnMount?: boolean,
  instructionsInfo: Array<InstructionOrExpressionInformation>,
  instructionsInfoTree: InstructionOrExpressionTreeNode,
  selectedType: string,
  onChoose: (type: string, InstructionOrExpressionInformation) => void,
  iconSize: number,
  style?: Object,
|};
type State = {|
  search: string,
  searchResults: Array<InstructionOrExpressionInformation>,
|};

class ThemableInstructionOrExpressionSelector extends Component<Props, State> {
  state = {
    search: '',
    searchResults: [],
  };
  _searchBar: ?SearchBar;

  componentDidMount() {
    if (this.props.focusOnMount && this._searchBar) {
      this._searchBar.focus();
    }
  }

  focus = () => {
    if (this._searchBar) this._searchBar.focus();
  };

  _matchCritera(
    instructionInfo: InstructionOrExpressionInformation,
    lowercaseSearch: string
  ) {
    const { displayedName, fullGroupName } = instructionInfo;
    return (
      displayedName.toLowerCase().indexOf(lowercaseSearch) !== -1 ||
      fullGroupName.toLowerCase().indexOf(lowercaseSearch) !== -1
    );
  }

  _computeSearchResults = (search: string) => {
    const lowercaseSearch = this.state.search.toLowerCase();
    return this.props.instructionsInfo.filter(instructionInfo =>
      this._matchCritera(instructionInfo, lowercaseSearch)
    );
  };

  _onSubmitSearch = () => {
    const { searchResults } = this.state;
    if (!searchResults.length) return;

    this.props.onChoose(searchResults[0].type, searchResults[0]);
  };

  _renderTree(instructionInfoTree: InstructionOrExpressionTreeNode) {
    const { muiTheme } = this.props;

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
                iconSize={this.props.iconSize}
                src={instructionInformation.iconFilename}
              />
            }
            onClick={() => {
              this.props.onChoose(
                instructionInformation.type,
                instructionInformation
              );
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
            style={{
              borderBottom: `1px solid ${muiTheme.listItem.separatorColor}`,
            }}
            nestedListStyle={styles.groupListItemNestedList}
            primaryText={
              <div
                style={{
                  color: isDeprecated
                    ? muiTheme.listItem.deprecatedGroupTextColor
                    : muiTheme.listItem.groupTextColor,
                }}
              >
                {key}
              </div>
            }
            primaryTogglesNestedList={true}
            autoGenerateNestedIndicator={true}
            nestedItems={this._renderTree(groupOfInstructionInformation)}
          />
        );
      }
    });
  }

  _renderSearchResults = () => {
    return this.state.searchResults.map(instructionInfo => {
      return (
        <ListItem
          key={instructionInfo.type}
          primaryText={instructionInfo.displayedName}
          secondaryText={instructionInfo.fullGroupName}
          value={instructionInfo.type}
          onClick={() => {
            this.props.onChoose(instructionInfo.type, instructionInfo);
          }}
        />
      );
    });
  };

  render() {
    const { muiTheme, selectedType, instructionsInfoTree, style } = this.props;

    return (
      <div
        style={{
          backgroundColor: muiTheme.list.itemsBackgroundColor,
          ...style,
        }}
      >
        <SearchBar
          onChange={text =>
            this.setState({
              search: text,
              searchResults: this._computeSearchResults(text),
            })
          }
          onRequestSearch={this._onSubmitSearch}
          style={styles.searchBar}
          ref={searchBar => (this._searchBar = searchBar)}
        />
        <SelectableList value={selectedType}>
          {this.state.search
            ? this._renderSearchResults()
            : this._renderTree(instructionsInfoTree)}
        </SelectableList>
      </div>
    );
  }
}

const InstructionOrExpressionSelector = muiThemeable()(
  ThemableInstructionOrExpressionSelector
);
export default InstructionOrExpressionSelector;
