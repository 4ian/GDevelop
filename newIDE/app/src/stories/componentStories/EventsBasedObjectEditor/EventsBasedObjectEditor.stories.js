// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import EventsBasedObjectEditor from '../../../EventsBasedObjectEditor';

export default {
  title: 'EventsBasedObjectEditor/index',
  component: EventsBasedObjectEditor,
  decorators: [paperDecorator],
};

export const Default = () => (
  <EventsBasedObjectEditor
    eventsBasedObject={testProject.testEventsBasedObject}
    onOpenCustomObjectEditor={action('onOpenCustomObjectEditor')}
    onEventsBasedObjectChildrenEdited={action(
      'onEventsBasedObjectChildrenEdited'
    )}
  />
);
