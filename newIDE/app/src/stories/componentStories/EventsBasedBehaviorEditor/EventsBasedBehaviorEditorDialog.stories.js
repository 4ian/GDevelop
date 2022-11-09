// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import EventsBasedBehaviorEditorDialog from '../../../EventsBasedBehaviorEditor/EventsBasedBehaviorEditorDialog';

export default {
  title: 'EventsBasedBehaviorEditor/EventsBasedBehaviorEditorDialog',
  component: EventsBasedBehaviorEditorDialog,
  decorators: [muiDecorator],
};

export const Default = () => (
  <EventsBasedBehaviorEditorDialog
    project={testProject.project}
    eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
    eventsBasedBehavior={testProject.testEventsBasedBehavior}
    onApply={action('apply')}
    onRenameProperty={action('property rename')}
    onRenameSharedProperty={action('shared property rename')}
  />
);

export const WithoutFunction = () => (
  <EventsBasedBehaviorEditorDialog
    project={testProject.project}
    eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
    eventsBasedBehavior={testProject.testEmptyEventsBasedBehavior}
    onApply={action('apply')}
    onRenameProperty={action('property rename')}
    onRenameSharedProperty={action('shared property rename')}
  />
);
