// @flow
import * as React from 'react';
import paperDecorator from '../PaperDecorator';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../GDevelopJsInitializerDecorator';
import VariablesList from '../../VariablesList/VariablesList';
import DragAndDropContextProvider from '../../UI/DragAndDrop/DragAndDropContextProvider';
import FixedHeightFlexContainer from '../FixedHeightFlexContainer';

export const Default = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <VariablesList
        variablesContainer={testProject.testLayout.getVariables()}
        emptyPlaceholderDescription="Variables help you store data"
        emptyPlaceholderTitle="Variables"
        helpPagePath="/variables"
        onComputeAllVariableNames={() => [
          'VariableFromEventSheet',
          'VariableFromSomeWhere',
          'InstanceVariable', // already defined variable in testSpriteObjectInstance
        ]}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const InstanceWithObjectVariables = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <VariablesList
        variablesContainer={testProject.testSpriteObjectInstance.getVariables()}
        emptyPlaceholderDescription="Variables help you store data"
        emptyPlaceholderTitle="Variables"
        helpPagePath="/variables"
        inheritedVariablesContainer={testProject.spriteObject.getVariables()}
        onComputeAllVariableNames={() => [
          'VariableFromEventSheet',
          'VariableFromSomeWhere',
          'InstanceVariable', // already defined variable in testSpriteObjectInstance
        ]}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export default {
  title: 'VariablesList',
  component: VariablesList,
  decorators: [paperDecorator, GDevelopJsInitializerDecorator],
};
