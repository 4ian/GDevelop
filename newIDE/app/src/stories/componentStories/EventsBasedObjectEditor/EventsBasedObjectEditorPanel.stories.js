// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import { EventsBasedBehaviorOrObjectEditor } from '../../../EventsFunctionsExtensionEditor/EventsBasedBehaviorOrObjectEditor';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';

export default {
  title: 'EventsBasedObjectEditor/EventsBasedObjectEditorDialog',
  component: EventsBasedBehaviorOrObjectEditor,
};

export const Default = () => (
  <DragAndDropContextProvider>
    <EventsBasedBehaviorOrObjectEditor
      project={testProject.project}
      projectScopedContainersAccessor={
        testProject.emptySceneProjectScopedContainersAccessor
      }
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      eventsBasedObject={testProject.testEventsBasedObject}
      onRenameProperty={action('property rename')}
      onPropertyTypeChanged={action('onPropertyTypeChanged')}
      onEventsFunctionsAdded={action('functions added')}
      onOpenCustomObjectEditor={action('onOpenCustomObjectEditor')}
      onEventsBasedObjectChildrenEdited={action(
        'onEventsBasedObjectChildrenEdited'
      )}
      onFocusProperty={action('onFocusProperty')}
      onPropertiesUpdated={action('onPropertiesUpdated')}
      onRenameSharedProperty={action('onRenameSharedProperty')}
    />
  </DragAndDropContextProvider>
);
