// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import EventsBasedBehaviorEditor from '../../../EventsFunctionsExtensionEditor/EventsBasedBehaviorOrObjectEditor/EventsBasedBehaviorEditor';

export default {
  title: 'EventsBasedBehaviorEditor/index',
  component: EventsBasedBehaviorEditor,
  decorators: [paperDecorator],
};

// $FlowFixMe[signature-verification-failure]
export const Default = () => (
  <EventsBasedBehaviorEditor
    project={testProject.project}
    eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
    eventsBasedBehavior={testProject.testEventsBasedBehavior}
  />
);

// $FlowFixMe[signature-verification-failure]
export const WithoutFunction = () => (
  <EventsBasedBehaviorEditor
    project={testProject.project}
    eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
    eventsBasedBehavior={testProject.testEmptyEventsBasedBehavior}
  />
);
