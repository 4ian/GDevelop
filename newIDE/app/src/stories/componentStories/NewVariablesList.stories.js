// @flow
import * as React from 'react';
import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../GDevelopJsInitializerDecorator';
import NewVariablesList from '../../VariablesList/NewVariablesList';
import SerializedObjectDisplay from '../SerializedObjectDisplay';
import DragAndDropContextProvider from '../../UI/DragAndDrop/DragAndDropContextProvider';
import FixedHeightFlexContainer from '../FixedHeightFlexContainer';

export const New = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <NewVariablesList
        variablesContainer={testProject.testLayout.getVariables()}
        onComputeAllVariableNames={() => []}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export default {
  title: 'NewVariablesList',
  component: NewVariablesList,
  decorators: [muiDecorator, GDevelopJsInitializerDecorator, paperDecorator],
};
