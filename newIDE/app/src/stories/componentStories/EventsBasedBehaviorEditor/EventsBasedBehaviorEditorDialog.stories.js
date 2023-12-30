// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import EventsBasedBehaviorEditorDialog from '../../../EventsBasedBehaviorEditor/EventsBasedBehaviorEditorDialog';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';

export default {
  title: 'EventsBasedBehaviorEditor/EventsBasedBehaviorEditorDialog',
  component: EventsBasedBehaviorEditorDialog,
  decorators: [muiDecorator],
};

export const Default = () => (
  <DragAndDropContextProvider>
    <EventsBasedBehaviorEditorDialog
      project={testProject.project}
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      eventsBasedBehavior={testProject.testEventsBasedBehavior}
      onRenameProperty={action('property rename')}
      onRenameSharedProperty={action('shared property rename')}
    />
  </DragAndDropContextProvider>
);

export const WithoutFunction = () => (
  <DragAndDropContextProvider>
    <EventsBasedBehaviorEditorDialog
      project={testProject.project}
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      eventsBasedBehavior={testProject.testEmptyEventsBasedBehavior}
      onRenameProperty={action('property rename')}
      onRenameSharedProperty={action('shared property rename')}
    />
  </DragAndDropContextProvider>
);
