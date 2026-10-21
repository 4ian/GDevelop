// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import { testProject } from '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import { I18n } from '@lingui/react';
import paperDecorator from '../PaperDecorator';
import ValueStateHolder from '../ValueStateHolder';
import FixedHeightFlexContainer from '../FixedHeightFlexContainer';
import InstructionOrObjectSelector from '../../EventsSheet/InstructionEditor/InstructionOrObjectSelector';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';

export default {
  title: 'InstructionOrObjectSelector',
  decorators: [paperDecorator],
};

export const KeyPressedConditionChosenScopeLayout = (): React.Node => (
  <ValueStateHolder
    initialValue={'free-instructions'}
    render={(value, onChange) => (
      <I18n>
        {({ i18n }) => (
          <FixedHeightFlexContainer height={400}>
            <InstructionOrObjectSelector
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }} // TODO
              project={testProject.project}
              scope={{
                project: testProject.project,
                layout: testProject.testLayout,
              }}
              currentTab={value}
              onChangeTab={onChange}
              projectScopedContainersAccessor={
                testProject.testSceneProjectScopedContainersAccessor
              }
              isCondition
              chosenInstructionType={'KeyPressed'}
              onChooseInstruction={action('instruction chosen')}
              chosenObjectName={null}
              onChooseObject={action('choose object')}
              focusOnMount
              onOpenExtensionStore={action('See new extensions')}
              i18n={i18n}
            />
          </FixedHeightFlexContainer>
        )}
      </I18n>
    )}
  />
);
KeyPressedConditionChosenScopeLayout.storyName =
  '"KeyPressed" condition chosen, scope: layout';

export const MySpriteObjectObjectChosenScopeLayout = (): React.Node => (
  <ValueStateHolder
    initialValue={'objects'}
    render={(value, onChange) => (
      <I18n>
        {({ i18n }) => (
          <FixedHeightFlexContainer height={400}>
            <InstructionOrObjectSelector
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }} // TODO
              project={testProject.project}
              scope={{
                project: testProject.project,
                layout: testProject.testLayout,
              }}
              currentTab={value}
              onChangeTab={onChange}
              projectScopedContainersAccessor={
                testProject.testSceneProjectScopedContainersAccessor
              }
              isCondition
              chosenInstructionType={''}
              onChooseInstruction={action('instruction chosen')}
              chosenObjectName={'MySpriteObject'}
              onChooseObject={action('choose object')}
              focusOnMount
              onOpenExtensionStore={action('See new extensions')}
              i18n={i18n}
            />
          </FixedHeightFlexContainer>
        )}
      </I18n>
    )}
  />
);
MySpriteObjectObjectChosenScopeLayout.storyName =
  '"MySpriteObject" object chosen, scope: layout';
