// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import { EventsBasedBehaviorOrObjectEditor } from '../../../EventsFunctionsExtensionEditor/EventsBasedBehaviorOrObjectEditor';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';

export default {
  title: 'EventsBasedBehaviorEditor/EventsBasedBehaviorEditorDialog',
  component: EventsBasedBehaviorOrObjectEditor,
};

export const Default = () => (
  <DragAndDropContextProvider>
    <EventsBasedBehaviorOrObjectEditor
      project={testProject.project}
      projectScopedContainersAccessor={
        testProject.testEventsBasedBehaviorProjectScopedContainersAccessor
      }
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      eventsBasedBehavior={testProject.testEventsBasedBehavior}
      onRenameProperty={action('property rename')}
      onPropertyTypeChanged={action('onPropertyTypeChanged')}
      onRenameSharedProperty={action('shared property rename')}
      onEventsFunctionsAdded={action('functions added')}
      onFocusProperty={action('onFocusProperty')}
      onPropertiesUpdated={action('onPropertiesUpdated')}
      onEventsBasedObjectChildrenEdited={action('onEventsBasedObjectChildrenEdited')}
      onOpenCustomObjectEditor={action('onOpenCustomObjectEditor')}
    />
  </DragAndDropContextProvider>
);

export const WithoutFunction = () => (
  <DragAndDropContextProvider>
    <EventsBasedBehaviorOrObjectEditor
      project={testProject.project}
      projectScopedContainersAccessor={
        testProject.testEventsBasedBehaviorProjectScopedContainersAccessor
      }
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      eventsBasedBehavior={testProject.testEmptyEventsBasedBehavior}
      onRenameProperty={action('property rename')}
      onPropertyTypeChanged={action('onPropertyTypeChanged')}
      onRenameSharedProperty={action('shared property rename')}
      onEventsFunctionsAdded={action('functions added')}
      onFocusProperty={action('onFocusProperty')}
      onPropertiesUpdated={action('onPropertiesUpdated')}
      onEventsBasedObjectChildrenEdited={action('onEventsBasedObjectChildrenEdited')}
      onOpenCustomObjectEditor={action('onOpenCustomObjectEditor')}
    />
  </DragAndDropContextProvider>
);
