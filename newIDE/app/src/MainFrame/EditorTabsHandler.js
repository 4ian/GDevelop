// @flow
import * as React from 'react';
import findIndex from 'lodash/findIndex';
import { EventsEditorContainer } from './EditorContainers/EventsEditorContainer';
import { DebuggerEditorContainer } from './EditorContainers/DebuggerEditorContainer';
import { EventsFunctionsExtensionEditorContainer } from './EditorContainers/EventsFunctionsExtensionEditorContainer';
import { ExternalEventsEditorContainer } from './EditorContainers/ExternalEventsEditorContainer';
import { ExternalLayoutEditorContainer } from './EditorContainers/ExternalLayoutEditorContainer';
import { ResourcesEditorContainer } from './EditorContainers/ResourcesEditorContainer';
import { SceneEditorContainer } from './EditorContainers/SceneEditorContainer';
import {
  type RenderEditorContainerPropsWithRef,
  type EditorContainerExtraProps,
} from './EditorContainers/BaseEditor';

// Supported editors
type EditorRef =
  | DebuggerEditorContainer
  | EventsEditorContainer
  | EventsFunctionsExtensionEditorContainer
  | ExternalEventsEditorContainer
  | ExternalLayoutEditorContainer
  | ResourcesEditorContainer
  | SceneEditorContainer;

export type EditorTab = {|
  // The function to render the tab editor.
  renderEditorContainer: RenderEditorContainerPropsWithRef => React.Node,
  // A reference to the editor.
  editorRef: ?EditorRef,
  // The label shown on the tab.
  label: string,
  // The name of the layout/external layout/external events/extension.
  projectItemName: ?string,
  // A unique key for the tab.
  key: string,
  // Extra props to pass to editors
  extraEditorProps: ?EditorContainerExtraProps,
  // If set to false, the tab can't be closed.
  closable: boolean,
|};

export type EditorTabsState = {
  editors: Array<EditorTab>,
  currentTab: number,
};

export const getEditorTabsInitialState = (): EditorTabsState => {
  return {
    editors: [],
    currentTab: 0,
  };
};

export const openEditorTab = (
  state: EditorTabsState,
  {
    label,
    projectItemName,
    renderEditorContainer,
    key,
    extraEditorProps,
    dontFocusTab,
    closable,
  }: {|
    label: string,
    projectItemName: ?string,
    renderEditorContainer: (
      props: RenderEditorContainerPropsWithRef
    ) => React.Node,
    key: string,
    extraEditorProps?: EditorContainerExtraProps,
    dontFocusTab?: boolean,
    closable?: boolean,
  |}
): EditorTabsState => {
  const existingEditorId = findIndex(
    state.editors,
    editor => editor.key === key
  );
  if (existingEditorId !== -1) {
    return {
      ...state,
      currentTab: dontFocusTab ? state.currentTab : existingEditorId,
    };
  }

  const editorTab: EditorTab = {
    label,
    projectItemName,
    renderEditorContainer,
    key,
    extraEditorProps,
    editorRef: null,
    closable: typeof closable === 'undefined' ? true : !!closable,
  };

  return {
    ...state,
    editors: [...state.editors, editorTab],
    currentTab: dontFocusTab ? state.currentTab : state.editors.length,
  };
};

export const changeCurrentTab = (
  state: EditorTabsState,
  newTabId: number
): EditorTabsState => {
  return {
    ...state,
    currentTab: Math.max(0, Math.min(newTabId, state.editors.length - 1)),
  };
};

export const closeAllEditorTabs = (state: EditorTabsState): EditorTabsState => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(editorTab => !editorTab.closable),
    },
    0
  );
};

export const closeEditorTab = (
  state: EditorTabsState,
  chosenEditorTab: EditorTab
): EditorTabsState => {
  const chosenEditorTabId = state.editors.indexOf(chosenEditorTab);
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(editorTab => editorTab !== chosenEditorTab),
    },
    chosenEditorTabId >= state.currentTab
      ? state.currentTab
      : state.currentTab - 1
  );
};

export const closeOtherEditorTabs = (
  state: EditorTabsState,
  chosenEditorTab: EditorTab
): EditorTabsState => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(
        editorTab => !editorTab.closable || editorTab === chosenEditorTab
      ),
    },
    state.currentTab
  );
};

export const getEditors = (state: EditorTabsState): Array<EditorTab> => {
  return state.editors;
};

export const getCurrentTabIndex = (state: EditorTabsState): number => {
  return state.currentTab;
};

export const getCurrentTab = (state: EditorTabsState): EditorTab => {
  return state.editors[state.currentTab];
};

export const closeProjectTabs = (
  state: EditorTabsState,
  project: ?gdProject
) => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(editorTab => {
        const editorProject =
          editorTab.editorRef && editorTab.editorRef.getProject();
        return !editorProject || editorProject !== project;
      }),
    },
    state.currentTab
  );
};

/*
 * Ask the editors to persist their UI settings
 * to the project.
 */
export const saveUiSettings = (state: EditorTabsState) => {
  state.editors.forEach(editorTab => {
    if (
      editorTab.editorRef &&
      (editorTab.editorRef instanceof SceneEditorContainer ||
        editorTab.editorRef instanceof ExternalLayoutEditorContainer)
    ) {
      editorTab.editorRef.saveUiSettings();
    }
  });
};

export const closeLayoutTabs = (state: EditorTabsState, layout: gdLayout) => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(editorTab => {
        const editor = editorTab.editorRef;

        if (
          editor instanceof EventsEditorContainer ||
          editor instanceof ExternalEventsEditorContainer ||
          editor instanceof ExternalLayoutEditorContainer ||
          editor instanceof SceneEditorContainer
        ) {
          const editorLayout = editor.getLayout();
          return !editorLayout || editorLayout !== layout;
        }

        return true;
      }),
    },
    state.currentTab
  );
};

export const closeExternalLayoutTabs = (
  state: EditorTabsState,
  externalLayout: gdExternalLayout
) => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(editorTab => {
        const editor = editorTab.editorRef;

        if (editor instanceof ExternalLayoutEditorContainer) {
          return (
            !editor.getExternalLayout() ||
            editor.getExternalLayout() !== externalLayout
          );
        }

        return true;
      }),
    },
    state.currentTab
  );
};

export const closeExternalEventsTabs = (
  state: EditorTabsState,
  externalEvents: gdExternalEvents
) => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(editorTab => {
        const editor = editorTab.editorRef;
        if (editor instanceof ExternalEventsEditorContainer) {
          return (
            !editor.getExternalEvents() ||
            editor.getExternalEvents() !== externalEvents
          );
        }

        return true;
      }),
    },
    state.currentTab
  );
};

export const closeEventsFunctionsExtensionTabs = (
  state: EditorTabsState,
  eventsFunctionsExtension: gdEventsFunctionsExtension
) => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(editorTab => {
        const editor = editorTab.editorRef;
        if (editor instanceof EventsFunctionsExtensionEditorContainer) {
          return (
            !editor.getEventsFunctionsExtension() ||
            editor.getEventsFunctionsExtension() !== eventsFunctionsExtension
          );
        }

        return true;
      }),
    },
    state.currentTab
  );
};

export const getEventsFunctionsExtensionEditor = (
  state: EditorTabsState,
  eventsFunctionsExtension: gdEventsFunctionsExtension
): ?{| editor: EventsFunctionsExtensionEditorContainer, tabIndex: number |} => {
  for (let tabIndex = 0; tabIndex < state.editors.length; ++tabIndex) {
    const editor = state.editors[tabIndex].editorRef;
    if (
      editor instanceof EventsFunctionsExtensionEditorContainer &&
      editor.getEventsFunctionsExtension() === eventsFunctionsExtension
    ) {
      return { editor, tabIndex };
    }
  }

  return null;
};
