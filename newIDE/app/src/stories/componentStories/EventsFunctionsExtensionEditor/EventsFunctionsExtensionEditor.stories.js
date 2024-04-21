// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import EventsFunctionsExtensionEditor from '../../../EventsFunctionsExtensionEditor';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import PreferencesContext, {
  initialPreferences,
  type Preferences,
} from '../../../MainFrame/Preferences/PreferencesContext';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'EventsFunctionsExtensionEditor/index',
  component: EventsFunctionsExtensionEditor,
};

export const Default = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={700}>
      <EventsFunctionsExtensionEditor
        project={testProject.project}
        eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
        setToolbar={() => {}}
        resourceManagementProps={fakeResourceManagementProps}
        openInstructionOrExpression={action('open instruction or expression')}
        initiallyFocusedFunctionName={null}
        initiallyFocusedBehaviorName={null}
        onCreateEventsFunction={action('on create events function')}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const WithObjectEditor = () => {
  const preferences: Preferences = {
    ...initialPreferences,
    getShowEventBasedObjectsEditor: () => true,
  };

  return (
    <PreferencesContext.Provider value={preferences}>
      <DragAndDropContextProvider>
        <FixedHeightFlexContainer height={700}>
          <EventsFunctionsExtensionEditor
            project={testProject.project}
            eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
            setToolbar={() => {}}
            resourceManagementProps={fakeResourceManagementProps}
            openInstructionOrExpression={action(
              'open instruction or expression'
            )}
            initiallyFocusedFunctionName={null}
            initiallyFocusedBehaviorName={null}
            onCreateEventsFunction={action('on create events function')}
          />
        </FixedHeightFlexContainer>
      </DragAndDropContextProvider>
    </PreferencesContext.Provider>
  );
};
