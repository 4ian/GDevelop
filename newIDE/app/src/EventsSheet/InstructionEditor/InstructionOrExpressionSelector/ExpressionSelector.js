// @flow
import React, { Component } from 'react';
import { enumerateExpressions } from './EnumerateExpressions';
import InstructionOrExpressionSelector from './index';
import { createTree, type InstructionOrExpressionTreeNode } from './CreateTree';
import { type InstructionOrExpressionInformation } from './InstructionOrExpressionInformation.flow.js';

type Props = {|
  expressionType: string,
  focusOnMount?: boolean,
  selectedType: string,
  onChoose: (type: string, InstructionOrExpressionInformation) => void,
  style?: Object,
|};

export default class ExpressionSelector extends Component<Props, {||}> {
  instructionsInfo: Array<InstructionOrExpressionInformation> = enumerateExpressions(
    this.props.expressionType
  ).allExpressions;
  instructionsInfoTree: InstructionOrExpressionTreeNode = createTree(
    this.instructionsInfo
  );

  render() {
    const { expressionType, ...otherProps } = this.props;
    return (
      <InstructionOrExpressionSelector
        instructionsInfo={this.instructionsInfo}
        instructionsInfoTree={this.instructionsInfoTree}
        iconSize={16}
        {...otherProps}
      />
    );
  }
}
