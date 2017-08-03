import React, { Component } from 'react';
import { List, ListItem, makeSelectable } from 'material-ui/List';
import SearchBar from 'material-ui-search-bar';
import keys from 'lodash/keys';
import update from 'lodash/update';
import compact from 'lodash/compact';
const gd = global.gd;

const GROUP_DELIMITER = '/';
const SelectableList = makeSelectable(List);

const styles = {
  searchBar: {
    margin: '0 auto',
    backgroundColor: 'transparent',
  },
  groupItemText: {
    color: 'rgba(0,0,0,0.54)',
  }
};

export class InstructionTypeList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      search: '',
      searchResults: [],
    };
  }

  componentWillMount() {
    const allInstructions = this._listAllInstructions();
    this.instructionsInfo = allInstructions;
    this.instructionsInfoTree = this._createInstructionsTree(allInstructions);
  }

  _listInstructions(groupPrefix, extensionInstructions) {
    //Get the map containing the metadata of the instructions provided by the extension...
    var instructionsTypes = extensionInstructions.keys();
    const allInstructions = [];

    //... and add each instruction
    for (let j = 0; j < instructionsTypes.size(); ++j) {
      const instrMetadata = extensionInstructions.get(instructionsTypes.get(j));
      if (instrMetadata.isHidden()) continue;

      const displayedName = instrMetadata.getFullName();
      const groupName = instrMetadata.getGroup();
      const fullGroupName = groupPrefix + groupName;

      allInstructions.push({
        type: instructionsTypes.get(j),
        displayedName,
        fullGroupName,
      });
    }

    return allInstructions;
  }

  _listAllInstructions() {
    const { isCondition } = this.props;

    let allInstructions = [];

    const allExtensions = gd
      .asPlatform(gd.JsPlatform.get())
      .getAllPlatformExtensions();
    for (let i = 0; i < allExtensions.size(); ++i) {
      const extension = allExtensions.get(i);
      const allObjectsTypes = extension.getExtensionObjectsTypes();
      const allBehaviorsTypes = extension.getBehaviorsTypes();

      let prefix = '';
      if (allObjectsTypes.size() > 0 || allBehaviorsTypes.size() > 0) {
        prefix = extension.getName() === 'BuiltinObject'
          ? 'Common ' +
              (isCondition ? 'conditions' : 'action') +
              ' for all objects'
          : extension.getFullName();
        prefix += GROUP_DELIMITER;
      }

      //Free instructions
      allInstructions = [
        ...allInstructions,
        ...this._listInstructions(
          prefix,
          isCondition ? extension.getAllConditions() : extension.getAllActions()
        ),
      ];

      //Objects instructions:
      for (let j = 0; j < allObjectsTypes.size(); ++j) {
        allInstructions = [
          ...allInstructions,
          ...this._listInstructions(
            prefix,
            isCondition
              ? extension.getAllConditionsForObject(allObjectsTypes.get(j))
              : extension.getAllActionsForObject(allObjectsTypes.get(j))
          ),
        ];
      }

      //Behaviors instructions:
      for (let j = 0; j < allBehaviorsTypes.size(); ++j) {
        allInstructions = [
          ...allInstructions,
          ...this._listInstructions(
            prefix,
            isCondition
              ? extension.getAllConditionsForBehavior(allBehaviorsTypes.get(j))
              : extension.getAllActionsForBehavior(allBehaviorsTypes.get(j))
          ),
        ];
      }
    }

    return allInstructions;
  }

  _createInstructionsTree(allInstructions) {
    const tree = {};
    allInstructions.forEach(instructionInfo => {
      update(
        tree,
        compact(instructionInfo.fullGroupName.split(GROUP_DELIMITER)),
        groupInfo => {
          const existingGroupInfo = groupInfo || {};
          return {
            ...existingGroupInfo,
            [instructionInfo.displayedName]: instructionInfo,
          };
        }
      );
    });

    return tree;
  }

  _matchCritera(instructionInfo, lowercaseSearch) {
    const { displayedName, fullGroupName } = instructionInfo;
    return displayedName.toLowerCase().indexOf(lowercaseSearch) !== -1 ||
      fullGroupName.toLowerCase().indexOf(lowercaseSearch) !== -1;
  }

  _computeSearchResults = search => {
    const lowercaseSearch = this.state.search.toLowerCase();
    return keys(this.instructionsInfo)
      .map(key => {
        return this.instructionsInfo[key];
      })
      .filter(instructionInfo =>
        this._matchCritera(instructionInfo, lowercaseSearch));
  };

  _onSubmitSearch = () => {
    const { searchResults } = this.state;
    if (!searchResults.length) return;

    this.props.onChoose(searchResults[0].type);
  };

  _renderTree(instructionInfoTree) {
    return Object.keys(instructionInfoTree).map(key => {
      const instructionOrGroup = instructionInfoTree[key];

      if (instructionOrGroup.hasOwnProperty('type')) {
        return (
          <ListItem
            key={key}
            primaryText={key}
            value={instructionOrGroup.type}
          />
        );
      } else {
        return (
          <ListItem
            key={key}
            primaryText={<div style={styles.groupItemText}>{key}</div>}
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
          primaryText={instructionInfo.displayedName}
          secondaryText={instructionInfo.fullGroupName}
          value={instructionInfo.type}
        />
      );
    });
  };

  render() {
    return (
      <div style={this.props.style}>
        <SearchBar
          onChange={text =>
            this.setState({
              search: text,
              searchResults: this._computeSearchResults(text),
            })}
          onRequestSearch={this._onSubmitSearch}
          style={styles.searchBar}
        />
        <SelectableList
          value={this.props.selectedType}
          onChange={(e, value) => {
            if (!value) return;

            this.props.onChoose(value);
          }}
        >

          {this.state.search
            ? this._renderSearchResults()
            : this._renderTree(this.instructionsInfoTree)}
        </SelectableList>
      </div>
    );
  }
}

export default makeSelectable(InstructionTypeList);
