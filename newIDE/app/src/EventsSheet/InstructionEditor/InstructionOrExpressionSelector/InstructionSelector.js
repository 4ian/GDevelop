// @flow
import React, { Component } from 'react';
import InstructionOrExpressionSelector from './index';
import { createTree, type InstructionOrExpressionTreeNode } from './CreateTree';
import { type InstructionOrExpressionInformation } from './InstructionOrExpressionInformation.flow.js';
const { enumerateInstructions } = require('./EnumerateInstructions');
console.log(enumerateInstructions);
const gd = global.gd;

type Props = {
  isCondition: boolean,
  // And props from InstructionOrExpressionSelector
};

export default class InstructionSelector extends Component<Props, {||}> {
  instructionsInfo: Array<InstructionOrExpressionInformation> = [];
  instructionsInfoTree: ?InstructionOrExpressionTreeNode = null;

  componentWillMount() {
    const allInstructions = enumerateInstructions(gd, this.props.isCondition);
    this.instructionsInfo = allInstructions;
    this.instructionsInfoTree = createTree(allInstructions);
  }

  render() {
    return (
      <InstructionOrExpressionSelector
        instructionsInfo={this.instructionsInfo}
        instructionsInfoTree={this.instructionsInfoTree}
        iconSize={24}
        {...this.props}
      />
    );
  }
}
