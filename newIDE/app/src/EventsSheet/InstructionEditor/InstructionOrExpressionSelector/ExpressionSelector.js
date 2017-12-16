// @flow
import React, { Component } from 'react';
import { enumerateExpressions } from './EnumerateExpressions';
import { InstructionOrExpressionSelector } from './index';
import { createTree, type InstructionOrExpressionTreeNode } from './CreateTree';
import { type InstructionOrExpressionInformation } from './InstructionOrExpressionInformation.flow.js';

export default class ExpressionSelector extends Component<*, *> {
  _selector: any = null;
  instructionsInfo: Array<InstructionOrExpressionInformation> = [];
  instructionsInfoTree: ?InstructionOrExpressionTreeNode = null;

  static defaultProps = {
    expressionType: 'number',
  };

  componentWillMount() {
    const { allExpressions } = enumerateExpressions(this.props.expressionType);
    this.instructionsInfo = allExpressions;
    this.instructionsInfoTree = createTree(allExpressions);
  }

  focus = () => {
    if (this._selector) this._selector.focus();
  };

  render() {
    return (
      <InstructionOrExpressionSelector
        ref={selector => (this._selector = selector)}
        instructionsInfo={this.instructionsInfo}
        instructionsInfoTree={this.instructionsInfoTree}
        {...this.props}
      />
    );
  }
}
