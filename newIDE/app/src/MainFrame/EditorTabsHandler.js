// @flow
import findIndex from 'lodash/findIndex';
import EventsEditor from './Editors/EventsEditor';
import DebuggerEditor from './Editors/DebuggerEditor';
import EventsFunctionsExtensionEditorWrapper from './Editors/EventsFunctionsExtensionEditor';
import ExternalEventsEditor from './Editors/ExternalEventsEditor';
import ExternalLayoutEditor from './Editors/ExternalLayoutEditor';
import ResourcesEditor from './Editors/ResourcesEditor';
import SceneEditor from './Editors/SceneEditor';

// Supported editors
type EditorRef =
  | DebuggerEditor
  | EventsEditor
  | EventsFunctionsExtensionEditorWrapper
  | ExternalEventsEditor
  | ExternalLayoutEditor
  | ResourcesEditor
  | SceneEditor;

export type EditorTab = {|
  render: (isCurrentTab: boolean) => React$Element<*>,
  editorRef: ?EditorRef,
  name: string,
  key: string,
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

type renderEditorProps = {|
  isActive: boolean,
  editorRef: Function,
|};

export const openEditorTab = (
  state: EditorTabsState,
  {
    name,
    renderEditor,
    key,
    dontFocusTab,
    closable,
  }: {
    name: string,
    renderEditor: (props: renderEditorProps) => React$Element<*>,
    key: string,
    dontFocusTab?: boolean,
    closable?: boolean,
  }
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
    render: (isCurrentTab: boolean) =>
      renderEditor({
        isActive: isCurrentTab,
        editorRef: editorRef => (editorTab.editorRef = editorRef),
      }),
    editorRef: null,
    name,
    key,
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

export const closeAll = (): EditorTabsState => {
  return getEditorTabsInitialState();
};

export const closeEditorTab = (
  state: EditorTabsState,
  editorTab: EditorTab
): EditorTabsState => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(e => e !== editorTab),
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
    if (editorTab.editorRef && editorTab.editorRef.saveUiSettings) {
      editorTab.editorRef.saveUiSettings();
    }
  });
};

export const closeLayoutTabs = (state: EditorTabsState, layout: gdLayout) => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(editorTab => {
        const editorLayout =
          editorTab.editorRef && editorTab.editorRef.getLayout();
        return !editorLayout || editorLayout !== layout;
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

        if (editor instanceof ExternalLayoutEditor) {
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
        if (editor instanceof ExternalEventsEditor) {
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
        if (editor instanceof EventsFunctionsExtensionEditorWrapper) {
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
): ?{| editor: EventsFunctionsExtensionEditorWrapper, tabIndex: number |} => {
  for (let tabIndex = 0; tabIndex < state.editors.length; ++tabIndex) {
    const editor = state.editors[tabIndex].editorRef;
    if (
      editor instanceof EventsFunctionsExtensionEditorWrapper &&
      editor.getEventsFunctionsExtension() === eventsFunctionsExtension
    ) {
      return { editor, tabIndex };
    }
  }

  return null;
};
