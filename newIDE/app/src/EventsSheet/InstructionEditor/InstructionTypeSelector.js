import React, { Component } from 'react';
import {List, ListItem} from 'material-ui/List';
import {unflatten} from 'flat';

const gd = global.gd;

export default class InstructionTypeSelector extends Component {

  listInstructions(groupPrefix, instructions) {
      //Get the map containing the metadata of the instructions provided by the extension...
      var instructionsTypes = instructions.keys();
      const allInstructions = {};

      //... and add each instruction
      for(var j = 0;j<instructionsTypes.size();++j) {
          var instrMetadata = instructions.get(instructionsTypes.get(j));
          if (instrMetadata.isHidden()) continue;

          var displayedName = instrMetadata.getFullName();
          const groupName = instrMetadata.getGroup();
          const fullGroupName = groupPrefix +
            (groupName ? groupName + "/" : "") +
            displayedName;

          allInstructions[fullGroupName] = {
              type: instructionsTypes.get(j),
          };
      }

      return allInstructions;
  }

  componentWillMount() {
    const { isCondition } = this.props;

    let root = {};

    const allExtensions = gd.asPlatform(gd.JsPlatform.get()).getAllPlatformExtensions();
    for(let i = 0;i<allExtensions.size();++i) {
        const extension = allExtensions.get(i);
        const allObjectsTypes = extension.getExtensionObjectsTypes();
        const allBehaviorsTypes = extension.getBehaviorsTypes();

        let prefix = "";
        if (allObjectsTypes.size() > 0 || allBehaviorsTypes.size() > 0) {
            prefix = extension.getName() === "BuiltinObject" ?
                ("Common "+(isCondition ? "conditions" : "action") +" for all objects") :
                extension.getFullName();
            prefix += "/";
        }

        //Free instructions
        root = {...root, ...this.listInstructions(prefix, isCondition ?
            extension.getAllConditions() :
            extension.getAllActions())
        };

        //Objects instructions:
        for(let j = 0;j<allObjectsTypes.size();++j) {
            root = {...root, ...this.listInstructions(prefix, isCondition ?
                extension.getAllConditionsForObject(allObjectsTypes.get(j)) :
                extension.getAllActionsForObject(allObjectsTypes.get(j)))
            };
        }

        //Behaviors instructions:
        for(let j = 0;j<allBehaviorsTypes.size();++j) {
            root = {...root, ...this.listInstructions(prefix, isCondition ?
                extension.getAllConditionsForBehavior(allBehaviorsTypes.get(j)) :
                extension.getAllActionsForBehavior(allBehaviorsTypes.get(j)))
            };
        }
    }

    this.instructionsTree = unflatten(root, {
        delimiter: '/',
        object: true,
    });
  }

  renderTree(instructionTree) {
      return Object.keys(instructionTree).map((key) => {
          const instructionOrGroup = instructionTree[key];

          if (instructionOrGroup.hasOwnProperty("type")) {
            return (
              <ListItem
                key={key}
                primaryText={key}
                onTouchTap={() => this.props.onChoose(instructionOrGroup.type)}
              />
            );
          } else {
            return (
              <ListItem
                key={key}
                primaryText={key}
                primaryTogglesNestedList={true}
                autoGenerateNestedIndicator={true}
                onTouchTap={() => {}}
                nestedItems={this.renderTree(instructionOrGroup)}
              />
            );
          }
      })
  }

  render() {
    return (
      <List>
        {this.renderTree(this.instructionsTree)}
      </List>
    )
  }
}
