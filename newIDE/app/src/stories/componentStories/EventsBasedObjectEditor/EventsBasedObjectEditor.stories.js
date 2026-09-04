// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import EventsBasedObjectEditor from '../../../EventsFunctionsExtensionEditor/EventsBasedBehaviorOrObjectEditor/EventsBasedObjectEditor';

export default {
  title: 'EventsBasedObjectEditor/index',
  component: EventsBasedObjectEditor,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => (
  <EventsBasedObjectEditor
    projectScopedContainersAccessor={
      testProject.eventBasedObjectProjectScopedContainersAccessor
    }
    project={testProject.project}
    eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
    eventsBasedObject={testProject.testEventsBasedObject}
    onOpenCustomObjectEditor={action('onOpenCustomObjectEditor')}
    onEventsBasedObjectChildrenEdited={action(
      'onEventsBasedObjectChildrenEdited'
    )}
  />
);

export const WithChildCustomObject = (): React.Node => (
  <EventsBasedObjectEditor
    projectScopedContainersAccessor={
      testProject.composedEventBasedObjectProjectScopedContainersAccessor
    }
    project={testProject.project}
    eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
    eventsBasedObject={testProject.composedEventBasedObject}
    onOpenCustomObjectEditor={action('onOpenCustomObjectEditor')}
    onEventsBasedObjectChildrenEdited={action(
      'onEventsBasedObjectChildrenEdited'
    )}
  />
);
