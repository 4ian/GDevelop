// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import paperDecorator from '../../PaperDecorator';
import ExpressionSelector from '../../../EventsSheet/InstructionEditor/InstructionOrExpressionSelector/ExpressionSelector';

export default {
  title: 'InstructionEditor/ExpressionSelector',
  component: ExpressionSelector,
  decorators: [muiDecorator, paperDecorator],
};

export const DefaultStringNoScope = () => (
  <FixedHeightFlexContainer height={400}>
    <ExpressionSelector
      expressionType="string"
      selectedType=""
      onChoose={action('Expression chosen')}
      focusOnMount
      scope={{ project: testProject.project }}
    />
  </FixedHeightFlexContainer>
);

export const DefaultNumberNoScope = () => (
  <FixedHeightFlexContainer height={400}>
    <ExpressionSelector
      expressionType="number"
      selectedType=""
      onChoose={action('Expression chosen')}
      focusOnMount
      scope={{ project: testProject.project }}
    />
  </FixedHeightFlexContainer>
);
