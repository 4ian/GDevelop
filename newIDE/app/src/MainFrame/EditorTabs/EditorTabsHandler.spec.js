// @flow
import {
  MAX_OPEN_EDITOR_TABS_PER_PANE,
  changeCurrentTab,
  getEditorTabsInitialState,
  openEditorTab,
} from './EditorTabsHandler';

jest.mock('../EditorContainers/EventsEditorContainer', () => ({
  EventsEditorContainer: class EventsEditorContainer {},
}));
jest.mock('../EditorContainers/DebuggerEditorContainer', () => ({
  DebuggerEditorContainer: class DebuggerEditorContainer {},
}));
jest.mock(
  '../EditorContainers/EventsFunctionsExtensionEditorContainer',
  () => ({
    EventsFunctionsExtensionEditorContainer: class EventsFunctionsExtensionEditorContainer {},
  })
);
jest.mock('../EditorContainers/PrefabDetailEditorContainer', () => ({
  PrefabDetailEditorContainer: class PrefabDetailEditorContainer {},
}));
jest.mock('../EditorContainers/ExtensionItemDetailEditorContainer', () => ({
  ExtensionItemDetailEditorContainer: class ExtensionItemDetailEditorContainer {},
}));
jest.mock('../EditorContainers/ExternalEventsEditorContainer', () => ({
  ExternalEventsEditorContainer: class ExternalEventsEditorContainer {},
}));
jest.mock('../EditorContainers/ExternalLayoutEditorContainer', () => ({
  ExternalLayoutEditorContainer: class ExternalLayoutEditorContainer {},
}));
jest.mock('../EditorContainers/ResourcesEditorContainer', () => ({
  ResourcesEditorContainer: class ResourcesEditorContainer {},
}));
jest.mock('../EditorContainers/SceneEditorContainer', () => ({
  SceneEditorContainer: class SceneEditorContainer {},
}));
jest.mock('../EditorContainers/CustomObjectEditorContainer', () => ({
  CustomObjectEditorContainer: class CustomObjectEditorContainer {},
}));

const makeEditorOpeningOptions = (key: string, options?: Object = {}): any => ({
  kind: 'layout',
  paneIdentifier: 'center',
  label: key,
  projectItemName: key,
  renderEditorContainer: () => null,
  key,
  ...options,
});

describe('EditorTabsHandler', () => {
  it('keeps at most five closable editor tabs in a pane', () => {
    let state = getEditorTabsInitialState();

    for (let index = 1; index <= MAX_OPEN_EDITOR_TABS_PER_PANE + 1; index++) {
      state = openEditorTab(state, makeEditorOpeningOptions(`tab-${index}`));
    }

    const centerPane = state.panes.center;
    expect(centerPane.editors.map(editor => editor.key)).toEqual([
      'tab-2',
      'tab-3',
      'tab-4',
      'tab-5',
      'tab-6',
    ]);
    expect(centerPane.currentTab).toBe(4);
  });

  it('preserves the active tab when opening a background tab', () => {
    let state = openEditorTab(
      getEditorTabsInitialState(),
      makeEditorOpeningOptions('start page', {
        kind: 'start page',
        closable: false,
      })
    );

    for (let index = 1; index <= MAX_OPEN_EDITOR_TABS_PER_PANE; index++) {
      state = openEditorTab(state, makeEditorOpeningOptions(`tab-${index}`));
    }

    state = changeCurrentTab(state, 'center', 1);
    state = openEditorTab(
      state,
      makeEditorOpeningOptions('tab-6', { dontFocusTab: true })
    );

    const centerPane = state.panes.center;
    expect(centerPane.editors.map(editor => editor.key)).toEqual([
      'start page',
      'tab-1',
      'tab-3',
      'tab-4',
      'tab-5',
      'tab-6',
    ]);
    expect(centerPane.currentTab).toBe(1);
  });
});
