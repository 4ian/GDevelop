// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import { testProject } from '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import ParameterRenderingService from '../../EventsSheet/ParameterRenderingService';
import ExpressionAutocompletionsDisplayer from '../../EventsSheet/ParameterFields/GenericExpressionField/ExpressionAutocompletionsDisplayer';
import {
  getFakePopperJsAnchorElement,
  makeFakeExpressionAutocompletions,
  makeFakeExactExpressionAutocompletion,
} from '../../fixtures/TestExpressionAutocompletions';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'ExpressionAutcompletionsDisplayer',
};

export const AutocompletionsFirstSelected = (): React.Node => (
  <ExpressionAutocompletionsDisplayer
    project={testProject.project}
    expressionAutocompletions={makeFakeExpressionAutocompletions()}
    remainingCount={3}
    // $FlowFixMe[incompatible-type]
    anchorEl={getFakePopperJsAnchorElement()}
    onChoose={action('chosen')}
    selectedCompletionIndex={0}
    // $FlowFixMe[incompatible-type]
    parameterRenderingService={ParameterRenderingService}
    onScroll={() => {}}
  />
);
AutocompletionsFirstSelected.storyName = 'autocompletions (first selected)';

export const AutocompletionsExpressionSelected = (): React.Node => (
  <ExpressionAutocompletionsDisplayer
    project={testProject.project}
    expressionAutocompletions={makeFakeExpressionAutocompletions()}
    remainingCount={3}
    // $FlowFixMe[incompatible-type]
    anchorEl={getFakePopperJsAnchorElement()}
    onChoose={action('chosen')}
    selectedCompletionIndex={6}
    // $FlowFixMe[incompatible-type]
    parameterRenderingService={ParameterRenderingService}
    onScroll={() => {}}
  />
);
AutocompletionsExpressionSelected.storyName =
  'autocompletions (expression selected)';

export const EmptyAutocompletionsBecauseExactExpression = (): React.Node => (
  <ExpressionAutocompletionsDisplayer
    project={testProject.project}
    // $FlowFixMe[incompatible-type]
    expressionAutocompletions={makeFakeExactExpressionAutocompletion()}
    remainingCount={0}
    // $FlowFixMe[incompatible-type]
    anchorEl={getFakePopperJsAnchorElement()}
    onChoose={action('chosen')}
    selectedCompletionIndex={0}
    // $FlowFixMe[incompatible-type]
    parameterRenderingService={ParameterRenderingService}
    onScroll={() => {}}
  />
);
EmptyAutocompletionsBecauseExactExpression.storyName =
  'empty autocompletions (because exact expression)';

export const EmptyAutocompletionsNothingShown = (): React.Node => (
  <ExpressionAutocompletionsDisplayer
    project={testProject.project}
    expressionAutocompletions={[]}
    remainingCount={0}
    // $FlowFixMe[incompatible-type]
    anchorEl={getFakePopperJsAnchorElement()}
    onChoose={action('chosen')}
    selectedCompletionIndex={0}
    // $FlowFixMe[incompatible-type]
    parameterRenderingService={ParameterRenderingService}
    onScroll={() => {}}
  />
);
EmptyAutocompletionsNothingShown.storyName =
  'empty autocompletions (nothing shown)';
