// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import EventsBasedObjectEditorPanel from '../../../EventsBasedObjectEditor/EventsBasedObjectEditorPanel';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';

export default {
  title: 'EventsBasedObjectEditor/EventsBasedObjectEditorDialog',
  component: EventsBasedObjectEditorPanel,
};

export const Default = () => (
  <DragAndDropContextProvider>
    <EventsBasedObjectEditorPanel
      project={testProject.project}
      globalObjectsContainer={testProject.emptyObjectsContainer}
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      eventsBasedObject={testProject.testEventsBasedObject}
      onRenameProperty={action('property rename')}
      onEventsFunctionsAdded={action('functions added')}
    />
  </DragAndDropContextProvider>
);
