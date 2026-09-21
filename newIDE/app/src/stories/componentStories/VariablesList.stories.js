// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import paperDecorator from '../PaperDecorator';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../GDevelopJsInitializerDecorator';
import VariablesList from '../../VariablesList/VariablesList';
import DragAndDropContextProvider from '../../UI/DragAndDrop/DragAndDropContextProvider';
import FixedHeightFlexContainer from '../FixedHeightFlexContainer';
import ScrollView from '../../UI/ScrollView';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import { useRefWithInit } from '../../Utils/UseRefInitHook';

const gd: libGDevelop = global.gd;

/**
 * A variables container with a lot of variables, including nested ones, to
 * check that the list stays fast and that virtualization behaves properly.
 */
const useManyVariablesContainer = (count: number): gdVariablesContainer => {
  const variablesContainerRef = useRefWithInit(() => {
    const variablesContainer = new gd.VariablesContainer(
      gd.VariablesContainer.Scene
    );
    for (let index = 0; index < count; index++) {
      const variable = new gd.Variable();
      if (index % 10 === 0) {
        variable.castTo('structure');
        for (let childIndex = 0; childIndex < 5; childIndex++) {
          variable.getChild(`Child${childIndex}`).setValue(childIndex);
        }
      } else if (index % 10 === 5) {
        variable.castTo('array');
        for (let childIndex = 0; childIndex < 3; childIndex++) {
          variable.pushNew().setString(`Item ${childIndex}`);
        }
      } else if (index % 3 === 0) {
        variable.setString(`Some text value ${index}`);
      } else if (index % 3 === 1) {
        variable.setValue(index);
      } else {
        variable.setBool(index % 2 === 0);
      }
      variablesContainer.insert(`Variable${index}`, variable, index);
      variable.delete();
    }
    return variablesContainer;
  });

  return variablesContainerRef.current;
};

export const Default = (): React.Node => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <VariablesList
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        variablesContainer={testProject.testLayout.getVariables()}
        emptyPlaceholderDescription="Variables help you store data"
        emptyPlaceholderTitle="Variables"
        helpPagePath="/variables"
        onComputeAllVariableNames={() => [
          'VariableFromEventSheet',
          'VariableFromSomeWhere',
          'InstanceVariable', // already defined variable in testSpriteObjectInstance
        ]}
        isListLocked={false}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const Compact = (): React.Node => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <VariablesList
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        size="compact"
        variablesContainer={testProject.testLayout.getVariables()}
        emptyPlaceholderDescription="Variables help you store data"
        emptyPlaceholderTitle="Variables"
        helpPagePath="/variables"
        onComputeAllVariableNames={() => [
          'VariableFromEventSheet',
          'VariableFromSomeWhere',
          'InstanceVariable', // already defined variable in testSpriteObjectInstance
        ]}
        isListLocked={false}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const InstanceWithObjectVariables = (): React.Node => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <VariablesList
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        variablesContainer={testProject.testSpriteObjectInstance.getVariables()}
        areObjectVariables
        emptyPlaceholderDescription="Variables help you store data"
        emptyPlaceholderTitle="Variables"
        helpPagePath="/variables"
        inheritedVariablesContainer={testProject.spriteObject.getVariables()}
        onComputeAllVariableNames={() => [
          'VariableFromEventSheet',
          'VariableFromSomeWhere',
          'InstanceVariable', // already defined variable in testSpriteObjectInstance
        ]}
        isListLocked={false}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const Locked = (): React.Node => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <VariablesList
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        variablesContainer={testProject.testLayout.getVariables()}
        emptyPlaceholderDescription="Variables help you store data"
        emptyPlaceholderTitle="Variables"
        helpPagePath="/variables"
        onComputeAllVariableNames={() => [
          'VariableFromEventSheet',
          'VariableFromSomeWhere',
          'InstanceVariable', // already defined variable in testSpriteObjectInstance
        ]}
        isListLocked={true}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const LockedCompact = (): React.Node => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <VariablesList
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        size="compact"
        variablesContainer={testProject.testLayout.getVariables()}
        emptyPlaceholderDescription="Variables help you store data"
        emptyPlaceholderTitle="Variables"
        helpPagePath="/variables"
        onComputeAllVariableNames={() => [
          'VariableFromEventSheet',
          'VariableFromSomeWhere',
          'InstanceVariable', // already defined variable in testSpriteObjectInstance
        ]}
        isListLocked={true}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const LockedInstanceWithObjectVariables = (): React.Node => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={600}>
      <VariablesList
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        variablesContainer={testProject.testSpriteObjectInstance.getVariables()}
        areObjectVariables
        emptyPlaceholderDescription="Variables help you store data"
        emptyPlaceholderTitle="Variables"
        helpPagePath="/variables"
        inheritedVariablesContainer={testProject.spriteObject.getVariables()}
        onComputeAllVariableNames={() => [
          'VariableFromEventSheet',
          'VariableFromSomeWhere',
          'InstanceVariable', // already defined variable in testSpriteObjectInstance
        ]}
        isListLocked={true}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const WithManyVariables = (): React.Node => {
  const variablesContainer = useManyVariablesContainer(500);
  return (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={600}>
        <VariablesList
          projectScopedContainersAccessor={
            testProject.testSceneProjectScopedContainersAccessor
          }
          variablesContainer={variablesContainer}
          emptyPlaceholderDescription="Variables help you store data"
          emptyPlaceholderTitle="Variables"
          helpPagePath="/variables"
          isListLocked={false}
        />
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  );
};

/**
 * Reproduces the properties panel: the variables list is displayed in a
 * section of a panel which is the one handling the scroll.
 */
export const CompactWithManyVariablesInScrollingPanel = (): React.Node => {
  const variablesContainer = useManyVariablesContainer(500);
  return (
    <DragAndDropContextProvider>
      <FixedHeightFlexContainer height={600} width={280}>
        <ScrollView>
          <Column>
            <Text size="block-title">
              <Trans>Some other section</Trans>
            </Text>
            <Line>
              <Text noMargin>
                <Trans>
                  Content displayed before the variables, in the same scrolling
                  panel.
                </Trans>
              </Text>
            </Line>
            <Text size="block-title">
              <Trans>Scene Variables</Trans>
            </Text>
          </Column>
          <VariablesList
            projectScopedContainersAccessor={
              testProject.testSceneProjectScopedContainersAccessor
            }
            size="compact"
            directlyStoreValueChangesWhileEditing
            variablesContainer={variablesContainer}
            compactEmptyPlaceholderText="There are no variables on this scene."
            helpPagePath="/variables"
            isListLocked={false}
          />
          <Column>
            <Text size="block-title">
              <Trans>Some section after the variables</Trans>
            </Text>
          </Column>
        </ScrollView>
      </FixedHeightFlexContainer>
    </DragAndDropContextProvider>
  );
};

export default {
  title: 'VariablesList',
  component: VariablesList,
  decorators: [paperDecorator, GDevelopJsInitializerDecorator],
};
