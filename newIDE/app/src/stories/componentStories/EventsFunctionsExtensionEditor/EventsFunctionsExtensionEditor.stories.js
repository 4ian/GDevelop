// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import EventsFunctionsExtensionEditor from '../../../EventsFunctionsExtensionEditor';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';
import PreferencesContext, {
  initialPreferences,
  type Preferences,
} from '../../../MainFrame/Preferences/PreferencesContext';
import { emptyStorageProvider } from '../../../ProjectsStorage/ProjectStorageProviders';

export default {
  title: 'EventsFunctionsExtensionEditor/index',
  component: EventsFunctionsExtensionEditor,
  decorators: [muiDecorator],
};

export const Default = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={700}>
      <EventsFunctionsExtensionEditor
        project={testProject.project}
        eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
        setToolbar={() => {}}
        resourceManagementProps={{
          getStorageProvider: () => emptyStorageProvider,
          onFetchNewlyAddedResources: async () => {},
          resourceSources: [],
          onChooseResource: () => Promise.reject('Unimplemented'),
          resourceExternalEditors: fakeResourceExternalEditors,
        }}
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
            resourceSources={[]}
            onChooseResource={source =>
              action('Choose resource from source', source)
            }
            resourceExternalEditors={fakeResourceExternalEditors}
            openInstructionOrExpression={action(
              'open instruction or expression'
            )}
            initiallyFocusedFunctionName={null}
            initiallyFocusedBehaviorName={null}
            onCreateEventsFunction={action('on create events function')}
            onFetchNewlyAddedResources={action('onFetchNewlyAddedResources')}
          />
        </FixedHeightFlexContainer>
      </DragAndDropContextProvider>
    </PreferencesContext.Provider>
  );
};
