// @flow
import React, { Component } from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { enumerateAllExpressions } from '../../../InstructionOrExpression/EnumerateExpressions';
import InstructionOrExpressionSelector from './index';
import {
  createTree,
  type ExpressionTreeNode,
} from '../../../InstructionOrExpression/CreateTree';
import {
  type EnumeratedExpressionMetadata,
  filterEnumeratedInstructionOrExpressionMetadataByScope,
} from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';
import { type EventsScope } from '../../../InstructionOrExpression/EventsScope.flow';

type Props = {|
  expressionType: string,
  focusOnMount?: boolean,
  selectedType: string,
  onChoose: (type: string, EnumeratedExpressionMetadata) => void,
  scope: EventsScope,
  i18n: I18nType,
|};

const style = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
};

export default class ExpressionSelector extends Component<Props, {||}> {
  instructionsInfo: Array<EnumeratedExpressionMetadata> = filterEnumeratedInstructionOrExpressionMetadataByScope(
    enumerateAllExpressions(this.props.expressionType, this.props.i18n),
    this.props.scope
  );
  instructionsInfoTree: ExpressionTreeNode = createTree(this.instructionsInfo);

  render() {
    const { expressionType, scope, i18n, ...otherProps } = this.props;
    return (
      <InstructionOrExpressionSelector
        id="expression-selector"
        style={style}
        instructionsInfo={this.instructionsInfo}
        instructionsInfoTree={this.instructionsInfoTree}
        iconSize={16}
        useSubheaders
        helpPagePath="/all-features/expressions-reference"
        {...otherProps}
      />
    );
  }
}
