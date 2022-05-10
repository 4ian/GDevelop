import * as React from 'react';
import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../GDevelopJsInitializerDecorator';
import NewVariablesList from '../../VariablesList/NewVariablesList';
import SerializedObjectDisplay from '../SerializedObjectDisplay';
import DragAndDropContextProvider from '../../UI/DragAndDrop/DragAndDropContextProvider';

export const New = () => (
  <DragAndDropContextProvider>
    <SerializedObjectDisplay object={testProject.testLayout}>
      <NewVariablesList
        variablesContainer={testProject.testLayout.getVariables()}
        onComputeAllVariableNames={() => []}
      />
    </SerializedObjectDisplay>
  </DragAndDropContextProvider>
);

export default {
  title: 'NewVariablesList',
  component: NewVariablesList,
  decorators: [muiDecorator, GDevelopJsInitializerDecorator, paperDecorator],
};
