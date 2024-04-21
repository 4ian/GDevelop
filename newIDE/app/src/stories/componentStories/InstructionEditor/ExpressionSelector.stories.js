// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import paperDecorator from '../../PaperDecorator';
import ExpressionSelector from '../../../EventsSheet/InstructionEditor/InstructionOrExpressionSelector/ExpressionSelector';
import { testProject } from '../../GDevelopJsInitializerDecorator';

export default {
  title: 'InstructionEditor/ExpressionSelector',
  component: ExpressionSelector,
  decorators: [paperDecorator],
};

export const DefaultStringNoScope = () => (
  <FixedHeightFlexContainer height={400}>
    <I18n>
      {({ i18n }) => (
        <ExpressionSelector
          i18n={i18n}
          expressionType="string"
          selectedType=""
          onChoose={action('Expression chosen')}
          focusOnMount
          scope={{ project: testProject.project }}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);

export const DefaultNumberNoScope = () => (
  <FixedHeightFlexContainer height={400}>
    <I18n>
      {({ i18n }) => (
        <ExpressionSelector
          i18n={i18n}
          expressionType="number"
          selectedType=""
          onChoose={action('Expression chosen')}
          focusOnMount
          scope={{ project: testProject.project }}
        />
      )}
    </I18n>
  </FixedHeightFlexContainer>
);
