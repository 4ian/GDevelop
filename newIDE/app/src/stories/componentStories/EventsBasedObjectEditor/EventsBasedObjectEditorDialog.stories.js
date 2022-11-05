// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import EventsBasedObjectEditorDialog from '../../../EventsBasedObjectEditor/EventsBasedObjectEditorDialog';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';

export default {
  title: 'EventsBasedObjectEditor/EventsBasedObjectEditorDialog',
  component: EventsBasedObjectEditorDialog,
  decorators: [muiDecorator],
};

export const Default = () => (
  <DragAndDropContextProvider>
    <EventsBasedObjectEditorDialog
      project={testProject.project}
      globalObjectsContainer={testProject.emptyObjectsContainer}
      eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
      eventsBasedObject={testProject.testEventsBasedObject}
      onApply={action('apply')}
      onRenameProperty={action('property rename')}
      onFetchNewlyAddedResources={async () => {}}
    />
  </DragAndDropContextProvider>
);
