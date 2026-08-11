// @flow
jest.mock(
  '../../EventsFunctionsExtensionEditor',
  () => function EventsFunctionsExtensionEditor() {}
);
jest.mock('../../EmbeddedGame/EmbeddedGameFrame', () => ({
  setEditorHotReloadNeeded: jest.fn(),
}));

import { EventsFunctionsExtensionEditorContainer } from './EventsFunctionsExtensionEditorContainer';

describe('EventsFunctionsExtensionEditorContainer', () => {
  it('returns the inner events sheet selection snapshot', () => {
    const snapshot = {
      selectionProvider: 'EventsSheet',
      isActive: true,
      scopeKind: 'extensionFunction',
      sceneName: null,
      externalEventsName: null,
      associatedLayoutName: null,
      eventsFunctionsExtensionName: 'MyExtension',
      eventsBasedBehaviorName: null,
      eventsBasedObjectName: null,
      eventsFunctionName: 'MyFunction',
      lastSelectionType: 'event',
      selectedEventPaths: ['event-0'],
      selectedEvents: [],
      selectedInstructions: [],
      selectedInstructionLists: [],
    };
    const container = new EventsFunctionsExtensionEditorContainer(({}: any));
    container.editor = ({
      getEditorSelectionSnapshot: jest.fn(() => snapshot),
    }: any);

    expect(container.getEditorSelectionSnapshot()).toBe(snapshot);
  });

  it('forwards matching extension function event modifications to the inner editor', () => {
    const changes: any = {
      extensionName: 'McpExt',
      parentKind: 'extension',
      parentName: null,
      functionName: 'SetPower',
      newOrChangedAiGeneratedEventIds: new Set<string>(),
    };
    const container = new EventsFunctionsExtensionEditorContainer(
      (({
        project: {},
        projectItemName: 'McpExt',
      }: any): any)
    );
    const onExtensionFunctionEventsModifiedOutsideEditor: any = jest.fn();
    container.editor = ({
      onExtensionFunctionEventsModifiedOutsideEditor,
    }: any);

    container.onExtensionFunctionEventsModifiedOutsideEditor(changes);

    expect(onExtensionFunctionEventsModifiedOutsideEditor).toHaveBeenCalledWith(
      changes
    );
  });
});
