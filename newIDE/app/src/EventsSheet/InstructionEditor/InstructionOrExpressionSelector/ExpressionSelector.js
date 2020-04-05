// @flow
import React, { Component } from 'react';
import { enumerateAllExpressions } from '../../../InstructionOrExpression/EnumerateExpressions';
import InstructionOrExpressionSelector from './index';
import {
  createTree,
  type InstructionOrExpressionTreeNode,
} from '../../../InstructionOrExpression/CreateTree';
import {
  type EnumeratedInstructionOrExpressionMetadata,
  filterEnumeratedInstructionOrExpressionMetadataByScope,
} from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata.js';
import { type EventsScope } from '../../../InstructionOrExpression/EventsScope.flow';

type Props = {|
  expressionType: string,
  focusOnMount?: boolean,
  selectedType: string,
  onChoose: (type: string, EnumeratedInstructionOrExpressionMetadata) => void,
  scope: EventsScope,
|};

const style = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
};

export default class ExpressionSelector extends Component<Props, {||}> {
  instructionsInfo: Array<EnumeratedInstructionOrExpressionMetadata> = filterEnumeratedInstructionOrExpressionMetadataByScope(
    enumerateAllExpressions(this.props.expressionType),
    this.props.scope
  );
  instructionsInfoTree: InstructionOrExpressionTreeNode = createTree(
    this.instructionsInfo
  );

  render() {
    const { expressionType, scope, ...otherProps } = this.props;
    return (
      <InstructionOrExpressionSelector
        style={style}
        instructionsInfo={this.instructionsInfo}
        instructionsInfoTree={this.instructionsInfoTree}
        iconSize={16}
        helpPagePath="/all-features/expressions-reference"
        {...otherProps}
      />
    );
  }
}
