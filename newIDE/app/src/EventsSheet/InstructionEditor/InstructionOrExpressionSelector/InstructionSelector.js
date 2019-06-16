// @flow
import React, { Component } from 'react';
import InstructionOrExpressionSelector from './index';
import { createTree, type InstructionOrExpressionTreeNode } from './CreateTree';
import { enumerateInstructions } from './EnumerateInstructions';
import { type InstructionOrExpressionInformation } from './InstructionOrExpressionInformation.flow.js';

type Props = {|
  isCondition: boolean,
  focusOnMount?: boolean,
  selectedType: string,
  onChoose: (type: string, InstructionOrExpressionInformation) => void,
  style?: Object,
|};

export default class InstructionSelector extends Component<Props, {||}> {
  instructionsInfo: Array<InstructionOrExpressionInformation> = enumerateInstructions(
    this.props.isCondition
  );
  instructionsInfoTree: InstructionOrExpressionTreeNode = createTree(
    this.instructionsInfo
  );

  render() {
    const { isCondition, ...otherProps } = this.props;
    return (
      <InstructionOrExpressionSelector
        instructionsInfo={this.instructionsInfo}
        instructionsInfoTree={this.instructionsInfoTree}
        iconSize={24}
        {...otherProps}
      />
    );
  }
}
