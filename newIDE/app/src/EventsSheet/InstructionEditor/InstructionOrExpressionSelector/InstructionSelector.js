// @flow
import React, { Component } from 'react';
import InstructionOrExpressionSelector from './index';
import { createTree, type InstructionOrExpressionTreeNode } from './CreateTree';
import { enumerateInstructions } from './EnumerateInstructions';
import { type InstructionOrExpressionInformation } from './InstructionOrExpressionInformation.flow.js';

type Props = {
  isCondition: boolean,
  // And props from InstructionOrExpressionSelector
};

export default class InstructionSelector extends Component<Props, *> {
  instructionsInfo: Array<InstructionOrExpressionInformation> = [];
  instructionsInfoTree: ?InstructionOrExpressionTreeNode = null;

  componentWillMount() {
    const allInstructions = enumerateInstructions(this.props.isCondition);
    this.instructionsInfo = allInstructions;
    this.instructionsInfoTree = createTree(allInstructions);
  }

  render() {
    return (
      <InstructionOrExpressionSelector
        instructionsInfo={this.instructionsInfo}
        instructionsInfoTree={this.instructionsInfoTree}
        {...this.props}
      />
    );
  }
}
