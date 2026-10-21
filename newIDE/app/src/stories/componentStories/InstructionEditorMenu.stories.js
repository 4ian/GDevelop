// @flow
import * as React from 'react';
// Keep first as it creates the `global.gd` object:
import { testProject } from '../GDevelopJsInitializerDecorator';
import { action } from 'storybook/actions';
import { I18n } from '@lingui/react';
import paperDecorator from '../PaperDecorator';
import InstructionEditorMenu from '../../EventsSheet/InstructionEditor/InstructionEditorMenu';
import { PopoverButton } from '../PopoverButton';
import { Column } from '../../UI/Grid';
import Text from '../../UI/Text';
import '../../UI/Theme/Global/Scrollbar.css';
import '../../UI/Theme/Global/Animation.css';
import fakeResourceManagementProps from '../FakeResourceManagement';

export default {
  title: 'InstructionEditorMenu',
  decorators: [paperDecorator],
};

const Default = (): React.Node => (
  <Column>
    <Text>
      Remember to test the search, which search across objects and all
      instructions - including object instructions (so that object instructions
      can be created either by selecting an object first or by searching for
      it).
    </Text>
    <PopoverButton>
      {({ buttonElement, onClose }) => (
        <I18n>
          {({ i18n }) => (
            <InstructionEditorMenu
              i18n={i18n}
              open
              project={testProject.project}
              scope={{
                project: testProject.project,
                layout: testProject.testLayout,
              }}
              globalObjectsContainer={testProject.project.getObjects()}
              objectsContainer={testProject.testLayout.getObjects()}
              projectScopedContainersAccessor={
                testProject.testSceneProjectScopedContainersAccessor
              }
              isCondition
              isNewInstruction={false}
              instruction={testProject.testInstruction}
              resourceManagementProps={fakeResourceManagementProps}
              openInstructionOrExpression={action(
                'open instruction or expression'
              )}
              onCancel={onClose}
              onSubmit={onClose}
              anchorEl={buttonElement}
              canPasteInstructions={true}
              onPasteInstructions={action('paste instructions')}
              onWillInstallExtension={action('extension will be installed')}
              onExtensionInstalled={action('extension installed')}
              onCreateNewExtensionWithBehavior={action(
                'onCreateNewExtensionWithBehavior'
              )}
              editEventsFunctionParameter={action(
                'editEventsFunctionParameter'
              )}
              openEventsBasedEntityPropertyEditorDialog={action(
                'openEventsBasedEntityPropertyEditorDialog'
              )}
            />
          )}
        </I18n>
      )}
    </PopoverButton>
  </Column>
);

export { Default as ___________________Default };
Default.storyName = 'default';
