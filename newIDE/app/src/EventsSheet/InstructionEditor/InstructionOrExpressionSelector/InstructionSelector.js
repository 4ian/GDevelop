// @flow
import React, { Component } from 'react';
import InstructionOrExpressionSelector from './index';
import {
  createTree,
  type InstructionOrExpressionTreeNode,
} from '../../../InstructionOrExpression/CreateTree';
import { enumerateAllInstructions } from '../../../InstructionOrExpression/EnumerateInstructions';
import {
  type EnumeratedInstructionOrExpressionMetadata,
  filterEnumeratedInstructionOrExpressionMetadataByScope,
} from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata.js';
import { type EventsScope } from '../../../InstructionOrExpression/EventsScope.flow';

type Props = {|
  isCondition: boolean,
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

export default class InstructionSelector extends Component<Props, {||}> {
  instructionsInfo: Array<EnumeratedInstructionOrExpressionMetadata> = filterEnumeratedInstructionOrExpressionMetadataByScope(
    enumerateAllInstructions(this.props.isCondition),
    this.props.scope
  );
  instructionsInfoTree: InstructionOrExpressionTreeNode = createTree(
    this.instructionsInfo
  );

  render() {
    const { isCondition, scope, ...otherProps } = this.props;
    return (
      <InstructionOrExpressionSelector
        style={style}
        instructionsInfo={this.instructionsInfo}
        instructionsInfoTree={this.instructionsInfoTree}
        iconSize={24}
        {...otherProps}
      />
    );
  }
}
