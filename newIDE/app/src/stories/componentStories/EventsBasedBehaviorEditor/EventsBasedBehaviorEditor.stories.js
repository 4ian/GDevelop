// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import EventsBasedBehaviorEditor from '../../../EventsBasedBehaviorEditor/';

export default {
  title: 'EventsBasedBehaviorEditor/index',
  component: EventsBasedBehaviorEditor,
  decorators: [paperDecorator],
};

export const Default = () => (
  <EventsBasedBehaviorEditor
    project={testProject.project}
    eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
    eventsBasedBehavior={testProject.testEventsBasedBehavior}
  />
);

export const WithoutFunction = () => (
  <EventsBasedBehaviorEditor
    project={testProject.project}
    eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
    eventsBasedBehavior={testProject.testEmptyEventsBasedBehavior}
  />
);
