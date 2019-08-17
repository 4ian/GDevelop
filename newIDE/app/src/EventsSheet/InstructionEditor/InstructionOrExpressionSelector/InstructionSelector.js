// @flow
import React, { Component } from 'react';
import InstructionOrExpressionSelector from './index';
import { createTree, type InstructionOrExpressionTreeNode } from './CreateTree';
import { enumerateInstructions } from './EnumerateInstructions';
import {
  type EnumeratedInstructionOrExpressionMetadata,
  filterEnumeratedInstructionOrExpressionMetadataByScope,
} from './EnumeratedInstructionOrExpressionMetadata.js';
import { type EventsScope } from '../../EventsScope.flow';

type Props = {|
  isCondition: boolean,
  focusOnMount?: boolean,
  selectedType: string,
  onChoose: (type: string, EnumeratedInstructionOrExpressionMetadata) => void,
  scope: EventsScope,
|};

export default class InstructionSelector extends Component<Props, {||}> {
  instructionsInfo: Array<EnumeratedInstructionOrExpressionMetadata> = filterEnumeratedInstructionOrExpressionMetadataByScope(
    enumerateInstructions(this.props.isCondition),
    this.props.scope
  );
  instructionsInfoTree: InstructionOrExpressionTreeNode = createTree(
    this.instructionsInfo
  );

  render() {
    const { isCondition, scope, ...otherProps } = this.props;
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
