// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import alertDecorator from '../../AlertDecorator';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import EventsFunctionsListWithErrorBoundary from '../../../EventsFunctionsList';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';

export default {
  title: 'EventsFunctionsExtensionEditor/EventsFunctionsList',
  component: EventsFunctionsListWithErrorBoundary,
  decorators: [alertDecorator],
};

export const Default = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={500}>
      <EventsFunctionsListWithErrorBoundary
        project={testProject.project}
        eventsFunctionsExtension={testProject.testEventsFunctionsExtension}
        selectedEventsBasedObject={null}
        selectedEventsBasedBehavior={null}
        selectedEventsFunction={testProject.testEventsFunctionsExtension.getEventsFunctionAt(
          1
        )}
        // Objects
        onSelectEventsBasedObject={action('object selected')}
        onDeleteEventsBasedObject={action('object deleted')}
        onRenameEventsBasedObject={action('rename object')}
        onEventsBasedObjectRenamed={action('object renamed')}
        // Behaviors
        onSelectEventsBasedBehavior={action('behavior selected')}
        onDeleteEventsBasedBehavior={action('behavior deleted')}
        onRenameEventsBasedBehavior={action('rename behavior')}
        onEventsBasedBehaviorRenamed={action('behavior renamed')}
        onEventsBasedBehaviorPasted={action('behavior pasted')}
        // Free functions
        onSelectEventsFunction={action('function selected')}
        onDeleteEventsFunction={action('function deleted')}
        onAddEventsFunction={(eventsBasedBehavior, eventsBasedObject, cb) =>
          cb({ functionType: 0, name: null })
        }
        onEventsFunctionAdded={action('function added')}
        onRenameEventsFunction={action('function renamed')}
        forceUpdateEditor={action('force editor update')}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);
