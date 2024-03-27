// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import EventsBasedBehaviorEditorPanel from '../../../EventsBasedBehaviorEditor/EventsBasedBehaviorEditorPanel';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';

export default {
  title: 'EventsBasedBehaviorEditor/EventsBasedBehaviorEditorDialog',
  component: EventsBasedBehaviorEditorPanel,
};

export const Default = () => (
  <DragAndDropContextProvider>
    <EventsBasedBehaviorEditorPanel
      project={testProject.project}
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      eventsBasedBehavior={testProject.testEventsBasedBehavior}
      onRenameProperty={action('property rename')}
      onRenameSharedProperty={action('shared property rename')}
      onEventsFunctionsAdded={action('functions added')}
    />
  </DragAndDropContextProvider>
);

export const WithoutFunction = () => (
  <DragAndDropContextProvider>
    <EventsBasedBehaviorEditorPanel
      project={testProject.project}
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      eventsBasedBehavior={testProject.testEmptyEventsBasedBehavior}
      onRenameProperty={action('property rename')}
      onRenameSharedProperty={action('shared property rename')}
      onEventsFunctionsAdded={action('functions added')}
    />
  </DragAndDropContextProvider>
);
