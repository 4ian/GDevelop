// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import EventsTree from '../../../EventsSheet/EventsTree';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import { getInitialSelection } from '../../../EventsSheet/SelectionHandler';
import { initialPreferences } from '../../../MainFrame/Preferences/PreferencesContext';
import { type Tutorial } from '../../../Utils/GDevelopServices/Tutorial';

export default {
  title: 'EventsSheet/EventsTree',
  component: EventsTree,
};

const eventsTreeTutorials: Array<Tutorial> = [
  {
    id: 'intro-event-system',
    titleByLocale: { en: 'Event system' },
    descriptionByLocale: { en: 'Description 1' },
    thumbnailUrlByLocale: {
      en:
        'https://raw.githubusercontent.com/4ian/GDevelop/master/Core/docs/images/gdlogo.png',
    },
    linkByLocale: { en: 'https://example.com/tutorial.html' },
    type: 'video',
    category: 'game-mechanic',
  },
];

export const DefaultMediumScreenScopeInLayout = () => (
  <DragAndDropContextProvider>
    <div className="gd-events-sheet">
      <FixedHeightFlexContainer height={500}>
        <EventsTree
          events={testProject.testLayout.getEvents()}
          project={testProject.project}
          scope={{
            project: testProject.project,
            layout: testProject.testLayout,
          }}
          projectScopedContainersAccessor={
            testProject.testSceneProjectScopedContainersAccessor
          }
          globalObjectsContainer={testProject.project.getObjects()}
          objectsContainer={testProject.testLayout.getObjects()}
          selection={getInitialSelection()}
          onAddNewInstruction={action('add new instruction')}
          onPasteInstructions={action('paste instructions')}
          onMoveToInstruction={action('move to instruction')}
          onMoveToInstructionsList={action('move instruction to list')}
          onInstructionClick={action('instruction click')}
          onInstructionDoubleClick={action('instruction double click')}
          onInstructionContextMenu={action('instruction context menu')}
          onAddInstructionContextMenu={action('instruction list context menu')}
          onVariableDeclarationDoubleClick={action(
            'onVariableDeclarationDoubleClick'
          )}
          onVariableDeclarationClick={action('onVariableDeclarationClick')}
          onParameterClick={action('parameter click')}
          onEventClick={action('event click')}
          onEventContextMenu={action('event context menu')}
          onAddNewEvent={action('add new event')}
          onOpenExternalEvents={action('open external events')}
          onOpenLayout={action('open layout')}
          searchResults={null}
          searchFocusOffset={null}
          onEventMoved={() => {}}
          showObjectThumbnails={true}
          screenType={'normal'}
          windowSize={'medium'}
          eventsSheetHeight={500}
          eventsSheetWidth={500}
          indentScale={1}
          preferences={initialPreferences}
          tutorials={eventsTreeTutorials}
          onEndEditingEvent={action('end editing event')}
          highlightedAiGeneratedEventIds={
            new Set(['fake-ai-generated-event-id-1'])
          }
        />
      </FixedHeightFlexContainer>
    </div>
  </DragAndDropContextProvider>
);

export const DefaultSmallScreenScopeInLayout = () => (
  <DragAndDropContextProvider>
    <div className="gd-events-sheet">
      <FixedHeightFlexContainer height={500}>
        <EventsTree
          events={testProject.testLayout.getEvents()}
          project={testProject.project}
          scope={{
            project: testProject.project,
            layout: testProject.testLayout,
          }}
          projectScopedContainersAccessor={
            testProject.testSceneProjectScopedContainersAccessor
          }
          globalObjectsContainer={testProject.project.getObjects()}
          objectsContainer={testProject.testLayout.getObjects()}
          selection={getInitialSelection()}
          onAddNewInstruction={action('add new instruction')}
          onPasteInstructions={action('paste instructions')}
          onMoveToInstruction={action('move to instruction')}
          onMoveToInstructionsList={action('move instruction to list')}
          onInstructionClick={action('instruction click')}
          onInstructionDoubleClick={action('instruction double click')}
          onInstructionContextMenu={action('instruction context menu')}
          onAddInstructionContextMenu={action('instruction list context menu')}
          onVariableDeclarationDoubleClick={action(
            'onVariableDeclarationDoubleClick'
          )}
          onVariableDeclarationClick={action('onVariableDeclarationClick')}
          onParameterClick={action('parameter click')}
          onEventClick={action('event click')}
          onEventContextMenu={action('event context menu')}
          onAddNewEvent={action('add new event')}
          onOpenExternalEvents={action('open external events')}
          onOpenLayout={action('open layout')}
          searchResults={null}
          searchFocusOffset={null}
          onEventMoved={() => {}}
          showObjectThumbnails={true}
          screenType={'normal'}
          windowSize={'small'}
          eventsSheetHeight={500}
          eventsSheetWidth={500}
          indentScale={1}
          preferences={initialPreferences}
          tutorials={eventsTreeTutorials}
          onEndEditingEvent={action('end editing event')}
          highlightedAiGeneratedEventIds={
            new Set(['fake-ai-generated-event-id-1'])
          }
        />
      </FixedHeightFlexContainer>
    </div>
  </DragAndDropContextProvider>
);

export const DefaultMediumScreenScopeNotInLayout = () => (
  <DragAndDropContextProvider>
    <div className="gd-events-sheet">
      <FixedHeightFlexContainer height={500}>
        <EventsTree
          events={testProject.testLayout.getEvents()}
          project={testProject.project}
          scope={{ project: testProject.project }}
          projectScopedContainersAccessor={
            testProject.testProjectScopedContainersAccessor
          }
          globalObjectsContainer={testProject.project.getObjects()}
          objectsContainer={testProject.testLayout.getObjects()}
          selection={getInitialSelection()}
          onAddNewInstruction={action('add new instruction')}
          onPasteInstructions={action('paste instructions')}
          onMoveToInstruction={action('move to instruction')}
          onMoveToInstructionsList={action('move instruction to list')}
          onInstructionClick={action('instruction click')}
          onInstructionDoubleClick={action('instruction double click')}
          onInstructionContextMenu={action('instruction context menu')}
          onAddInstructionContextMenu={action('instruction list context menu')}
          onVariableDeclarationDoubleClick={action(
            'onVariableDeclarationDoubleClick'
          )}
          onVariableDeclarationClick={action('onVariableDeclarationClick')}
          onParameterClick={action('parameter click')}
          onEventClick={action('event click')}
          onEventContextMenu={action('event context menu')}
          onAddNewEvent={action('add new event')}
          onOpenExternalEvents={action('open external events')}
          onOpenLayout={action('open layout')}
          searchResults={null}
          searchFocusOffset={null}
          onEventMoved={() => {}}
          showObjectThumbnails={true}
          screenType={'normal'}
          windowSize={'medium'}
          eventsSheetHeight={500}
          eventsSheetWidth={500}
          indentScale={1}
          preferences={initialPreferences}
          tutorials={eventsTreeTutorials}
          onEndEditingEvent={action('end editing event')}
          highlightedAiGeneratedEventIds={
            new Set(['fake-ai-generated-event-id-1'])
          }
        />
      </FixedHeightFlexContainer>
    </div>
  </DragAndDropContextProvider>
);

export const EmptySmallScreenScopeInALayout = () => (
  <DragAndDropContextProvider>
    <div className="gd-events-sheet">
      <FixedHeightFlexContainer height={500}>
        <EventsTree
          events={testProject.emptyEventsList}
          project={testProject.project}
          scope={{
            project: testProject.project,
            layout: testProject.testLayout,
          }}
          projectScopedContainersAccessor={
            testProject.testSceneProjectScopedContainersAccessor
          }
          globalObjectsContainer={testProject.project.getObjects()}
          objectsContainer={testProject.testLayout.getObjects()}
          selection={getInitialSelection()}
          onAddNewInstruction={action('add new instruction')}
          onPasteInstructions={action('paste instructions')}
          onMoveToInstruction={action('move to instruction')}
          onMoveToInstructionsList={action('move instruction to list')}
          onInstructionClick={action('instruction click')}
          onInstructionDoubleClick={action('instruction double click')}
          onInstructionContextMenu={action('instruction context menu')}
          onAddInstructionContextMenu={action('instruction list context menu')}
          onVariableDeclarationDoubleClick={action(
            'onVariableDeclarationDoubleClick'
          )}
          onVariableDeclarationClick={action('onVariableDeclarationClick')}
          onParameterClick={action('parameter click')}
          onEventClick={action('event click')}
          onEventContextMenu={action('event context menu')}
          onAddNewEvent={action('add new event')}
          onOpenExternalEvents={action('open external events')}
          onOpenLayout={action('open layout')}
          searchResults={null}
          searchFocusOffset={null}
          onEventMoved={() => {}}
          showObjectThumbnails={true}
          screenType={'normal'}
          windowSize={'small'}
          eventsSheetHeight={500}
          eventsSheetWidth={500}
          indentScale={1}
          preferences={initialPreferences}
          tutorials={eventsTreeTutorials}
          onEndEditingEvent={action('end editing event')}
          highlightedAiGeneratedEventIds={
            new Set(['fake-ai-generated-event-id-1'])
          }
        />
      </FixedHeightFlexContainer>
    </div>
  </DragAndDropContextProvider>
);
