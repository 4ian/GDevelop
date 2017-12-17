// @flow

import React from 'react';
import findIndex from 'lodash/findIndex';

export type EditorTab = {|
  render: () => React$Element<*>,
  editorRef: ?any,
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

export const openEditorTab = (
  state: EditorTabsState,
  {
    name,
    editorCreator,
    key,
    dontFocusTab,
    closable,
  }: {
    name: string,
    editorCreator: () => React$Element<*>,
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

  const editorTab = {
    render: () =>
      React.cloneElement(editorCreator(), {
        ref: editorRef => (editorTab.editorRef = editorRef),
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

export const closeProjectTabs = (state: EditorTabsState, project: ?gdProject) => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(editorTab => {
        return (
          !editorTab.editorRef ||
          !editorTab.editorRef.getProject() ||
          editorTab.editorRef.getProject() !== project
        );
      }),
    },
    state.currentTab
  );
};

export const closeLayoutTabs = (state: EditorTabsState, layout: gdLayout) => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(editorTab => {
        return (
          !editorTab.editorRef ||
          !editorTab.editorRef.getLayout ||
          !editorTab.editorRef.getLayout() ||
          editorTab.editorRef.getLayout() !== layout
        );
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
        return (
          !editorTab.editorRef ||
          !editorTab.editorRef.getExternalLayout ||
          !editorTab.editorRef.getExternalLayout() ||
          editorTab.editorRef.getExternalLayout() !== externalLayout
        );
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
        return (
          !editorTab.editorRef ||
          !editorTab.editorRef.getExternalEvents ||
          !editorTab.editorRef.getExternalEvents() ||
          editorTab.editorRef.getExternalEvents() !== externalEvents
        );
      }),
    },
    state.currentTab
  );
};
