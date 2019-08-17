// @flow
import React, { Component } from 'react';
import { enumerateExpressions } from './EnumerateExpressions';
import InstructionOrExpressionSelector from './index';
import { createTree, type InstructionOrExpressionTreeNode } from './CreateTree';
import {
  type EnumeratedInstructionOrExpressionMetadata,
  filterEnumeratedInstructionOrExpressionMetadataByScope,
} from './EnumeratedInstructionOrExpressionMetadata.js';
import { type EventsScope } from '../../EventsScope.flow';

type Props = {|
  expressionType: string,
  focusOnMount?: boolean,
  selectedType: string,
  onChoose: (type: string, EnumeratedInstructionOrExpressionMetadata) => void,
  scope: EventsScope,
|};

export default class ExpressionSelector extends Component<Props, {||}> {
  instructionsInfo: Array<EnumeratedInstructionOrExpressionMetadata> = filterEnumeratedInstructionOrExpressionMetadataByScope(
    enumerateExpressions(this.props.expressionType).allExpressions,
    this.props.scope
  );
  instructionsInfoTree: InstructionOrExpressionTreeNode = createTree(
    this.instructionsInfo
  );

  render() {
    const { expressionType, scope, ...otherProps } = this.props;
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
