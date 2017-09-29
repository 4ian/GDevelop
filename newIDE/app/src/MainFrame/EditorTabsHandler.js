import React from 'react';
import findIndex from 'lodash.findindex';

export const getEditorTabsInitialState = () => {
  return {
    editors: [],
    currentTab: 0,
  };
};

export const openEditorTab = (
  state,
  { name, editorCreator, key, dontFocusTab }
) => {
  const existingEditorId = findIndex(
    state.editors,
    editor => editor.key === key
  );
  if (existingEditorId !== -1) {
    return {
      ...state,
      currentTab: existingEditorId,
    };
  }

  const editorTab = {
    render: () =>
      React.cloneElement(editorCreator(), {
        ref: editorRef => editorTab.editorRef = editorRef,
      }),
    editorRef: null,
    name,
    key,
  };

  return {
    ...state,
    editors: [...state.editors, editorTab],
    currentTab: dontFocusTab ? state.currentTab : state.editors.length,
  };
};

export const changeCurrentTab = (state, newTabId) => {
  return {
    ...state,
    currentTab: Math.max(0, Math.min(newTabId, state.editors.length - 1)),
  };
};

export const closeAll = () => {
  return getEditorTabsInitialState();
};

export const closeEditorTab = (state, editorTab) => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(e => e !== editorTab),
    },
    state.currentTab
  );
};

export const getEditors = state => {
  return state.editors;
};

export const getCurrentTabIndex = state => {
  return state.currentTab;
};

export const getCurrentTab = state => {
  return state.editors[state.currentTab];
};

export const closeProjectTabs = (state, project) => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(editorTab => {
        return !editorTab.editorRef ||
          !editorTab.editorRef.getProject() ||
          editorTab.editorRef.getProject() !== project;
      }),
    },
    state.currentTab
  );
};

export const closeLayoutTabs = (state, layout) => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(editorTab => {
        return !editorTab.editorRef ||
          !editorTab.editorRef.getLayout ||
          !editorTab.editorRef.getLayout() ||
          editorTab.editorRef.getLayout() !== layout;
      }),
    },
    state.currentTab
  );
};

export const closeExternalLayoutTabs = (state, externalLayout) => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(editorTab => {
        return !editorTab.editorRef ||
          !editorTab.editorRef.getExternalLayout ||
          !editorTab.editorRef.getExternalLayout() ||
          editorTab.editorRef.getExternalLayout() !== externalLayout;
      }),
    },
    state.currentTab
  );
};

export const closeExternalEventsTabs = (state, externalEvents) => {
  return changeCurrentTab(
    {
      ...state,
      editors: state.editors.filter(editorTab => {
        return !editorTab.editorRef ||
          !editorTab.editorRef.getExternalEvents ||
          !editorTab.editorRef.getExternalEvents() ||
          editorTab.editorRef.getExternalEvents() !== externalEvents;
      }),
    },
    state.currentTab
  );
};
