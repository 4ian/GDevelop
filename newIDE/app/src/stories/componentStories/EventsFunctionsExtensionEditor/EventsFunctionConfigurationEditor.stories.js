// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import EventsFunctionConfigurationEditor from '../../../EventsFunctionsExtensionEditor/EventsFunctionConfigurationEditor';

export default {
  title: 'EventsFunctionsExtensionEditor/EventsFunctionConfigurationEditor',
  component: EventsFunctionConfigurationEditor,
  decorators: [paperDecorator, muiDecorator],
};

export const DefaultFreeFunction = () => (
  <FixedHeightFlexContainer height={500}>
    <EventsFunctionConfigurationEditor
      project={testProject.project}
      globalObjectsContainer={testProject.project}
      objectsContainer={testProject.testLayout}
      helpPagePath="/events/functions"
      eventsFunction={testProject.testEventsFunction}
      eventsBasedBehavior={null}
      eventsBasedObject={null}
      onParametersOrGroupsUpdated={action('Parameters or groups were updated')}
    />
  </FixedHeightFlexContainer>
);

export const DefaultBehaviorFunction = () => (
  <FixedHeightFlexContainer height={500}>
    <EventsFunctionConfigurationEditor
      project={testProject.project}
      globalObjectsContainer={testProject.project}
      objectsContainer={testProject.testLayout}
      helpPagePath="/events/functions"
      eventsFunction={testProject.testBehaviorEventsFunction}
      eventsBasedBehavior={testProject.testEventsBasedBehavior}
      eventsBasedObject={null}
      onParametersOrGroupsUpdated={action('Parameters or groups were updated')}
    />
  </FixedHeightFlexContainer>
);

export const DefaultBehaviorLifecycleFunction = () => (
  <FixedHeightFlexContainer height={500}>
    <EventsFunctionConfigurationEditor
      project={testProject.project}
      globalObjectsContainer={testProject.project}
      objectsContainer={testProject.testLayout}
      helpPagePath="/events/functions"
      eventsFunction={testProject.testBehaviorLifecycleEventsFunction}
      eventsBasedBehavior={testProject.testEventsBasedBehavior}
      eventsBasedObject={null}
      onParametersOrGroupsUpdated={action('Parameters or groups were updated')}
    />
  </FixedHeightFlexContainer>
);

export const DefaultObjectFunction = () => (
  <FixedHeightFlexContainer height={500}>
    <EventsFunctionConfigurationEditor
      project={testProject.project}
      globalObjectsContainer={testProject.project}
      objectsContainer={testProject.testLayout}
      helpPagePath="/events/functions"
      eventsFunction={testProject.testObjectEventsFunction}
      eventsBasedBehavior={null}
      eventsBasedObject={testProject.testEventsBasedObject}
      onParametersOrGroupsUpdated={action('Parameters or groups were updated')}
    />
  </FixedHeightFlexContainer>
);
