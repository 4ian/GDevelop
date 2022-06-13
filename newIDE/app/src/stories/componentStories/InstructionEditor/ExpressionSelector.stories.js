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

export const DefaultNoScope = () => (
  <FixedHeightFlexContainer height={400}>
    <ExpressionSelector
      selectedType=""
      onChoose={action('Expression chosen')}
      focusOnMount
      scope={{}}
    />
  </FixedHeightFlexContainer>
);
