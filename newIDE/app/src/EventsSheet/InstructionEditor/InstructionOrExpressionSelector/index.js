import React, { Component } from 'react';
import { List, ListItem, makeSelectable } from 'material-ui/List';
import SearchBar from 'material-ui-search-bar';
import keys from 'lodash/keys';
import muiThemeable from 'material-ui/styles/muiThemeable';
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

class ThemableInstructionOrExpressionSelector extends Component {
  state = {
    search: '',
    searchResults: [],
  };

  componentDidMount() {
    this._searchBar.focus();
  }

  focus = () => {
    if (this._searchBar) this._searchBar.focus();
  };

  _matchCritera(instructionInfo, lowercaseSearch) {
    const { displayedName, fullGroupName } = instructionInfo;
    return (
      displayedName.toLowerCase().indexOf(lowercaseSearch) !== -1 ||
      fullGroupName.toLowerCase().indexOf(lowercaseSearch) !== -1
    );
  }

  _computeSearchResults = search => {
    const lowercaseSearch = this.state.search.toLowerCase();
    return keys(this.props.instructionsInfo)
      .map(key => {
        return this.props.instructionsInfo[key];
      })
      .filter(instructionInfo =>
        this._matchCritera(instructionInfo, lowercaseSearch)
      );
  };

  _onSubmitSearch = () => {
    const { searchResults } = this.state;
    if (!searchResults.length) return;

    this.props.onChoose(searchResults[0].type, searchResults[0]);
  };

  _renderTree(instructionInfoTree) {
    const { muiTheme } = this.props;

    return Object.keys(instructionInfoTree).map(key => {
      const instructionOrGroup = instructionInfoTree[key];

      if (instructionOrGroup.hasOwnProperty('type')) {
        return (
          <ListItem
            key={key}
            primaryText={key}
            value={instructionOrGroup.type}
            onClick={() => {
              this.props.onChoose(instructionOrGroup.type, instructionOrGroup);
            }}
          />
        );
      } else {
        return (
          <ListItem
            key={key}
            style={{borderBottom: `1px solid ${muiTheme.listItem.separatorColor}`}}
            nestedListStyle={styles.groupListItemNestedList}
            primaryText={<div style={{color: muiTheme.listItem.groupTextColor}}>{key}</div>}
            primaryTogglesNestedList={true}
            autoGenerateNestedIndicator={true}
            nestedItems={this._renderTree(instructionOrGroup)}
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
          style={styles.listItem}
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
            })}
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
