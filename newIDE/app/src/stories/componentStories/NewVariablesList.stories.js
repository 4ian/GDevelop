import * as React from 'react';
import muiDecorator from '../ThemeDecorator';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../GDevelopJsInitializerDecorator';
import NewVariablesList from '../../VariablesList/NewVariablesList';
import SerializedObjectDisplay from '../SerializedObjectDisplay';

export const New = () => (
  <SerializedObjectDisplay object={testProject.testLayout}>
    <NewVariablesList
      variablesContainer={testProject.testLayout.getVariables()}
      onComputeAllVariableNames={() => []}
    />
  </SerializedObjectDisplay>
);

export default {
  title: 'NewVariablesList',
  component: NewVariablesList,
  decorators: [muiDecorator, GDevelopJsInitializerDecorator],
};
