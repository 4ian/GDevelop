// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import EventsFunctionsListWithErrorBoundary from '../../../EventsFunctionsList';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';

export default {
  title: 'EventsFunctionsExtensionEditor/EventsFunctionsList',
  component: EventsFunctionsListWithErrorBoundary,
  decorators: [muiDecorator],
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
        onSelectEventsBasedObject={eventsBasedObject => {}}
        onDeleteEventsBasedObject={(eventsBasedObject, cb) => cb(true)}
        onRenameEventsBasedObject={(eventsBasedObject, newName, cb) => cb(true)}
        onEventsBasedObjectRenamed={eventsBasedObject => {}}
        // Behaviors
        onSelectEventsBasedBehavior={eventsBasedBehavior => {}}
        onDeleteEventsBasedBehavior={(eventsBasedBehavior, cb) => cb(true)}
        onRenameEventsBasedBehavior={(eventsBasedBehavior, newName, cb) =>
          cb(true)
        }
        onEventsBasedBehaviorRenamed={eventsBasedBehavior => {}}
        onEventsBasedBehaviorPasted={(
          eventsBasedBehavior,
          sourceExtensionName
        ) => {}}
        // Free functions
        onSelectEventsFunction={action('select')}
        onDeleteEventsFunction={(eventsFunction, cb) => cb(true)}
        onAddEventsFunction={(eventsBasedBehavior, eventsBasedObject, cb) =>
          cb({ functionType: 0, name: null })
        }
        onEventsFunctionAdded={() => {}}
        onRenameEventsFunction={(eventsFunction, newName, cb) => {
          eventsFunction.setName(newName);
          cb(true);
        }}
        canRename={() => true}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);
