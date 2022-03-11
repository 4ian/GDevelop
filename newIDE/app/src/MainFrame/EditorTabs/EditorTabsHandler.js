// @flow
import * as React from 'react';
import findIndex from 'lodash/findIndex';
import { EventsEditorContainer } from '../EditorContainers/EventsEditorContainer';
import { DebuggerEditorContainer } from '../EditorContainers/DebuggerEditorContainer';
import { EventsFunctionsExtensionEditorContainer } from '../EditorContainers/EventsFunctionsExtensionEditorContainer';
import { ExternalEventsEditorContainer } from '../EditorContainers/ExternalEventsEditorContainer';
import { ExternalLayoutEditorContainer } from '../EditorContainers/ExternalLayoutEditorContainer';
import { ResourcesEditorContainer } from '../EditorContainers/ResourcesEditorContainer';
import { SceneEditorContainer } from '../EditorContainers/SceneEditorContainer';
import {
  type RenderEditorContainerPropsWithRef,
  type EditorContainerExtraProps,
} from '../EditorContainers/BaseEditor';

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

export const closeTabsExceptIf = (
  state: EditorTabsState,
  keepPredicate: (editorTab: EditorTab) => boolean
) => {
  const currentEditorTab = getCurrentTab(state);
  const remainingEditors = state.editors.filter(keepPredicate);
  return changeCurrentTab(
    {
      ...state,
      editors: remainingEditors,
    },
    // Keep the focus on the current editor tab, or if it was closed
    // go back to the first tab.
    remainingEditors.indexOf(currentEditorTab) || 0
  );
};

export const closeAllEditorTabs = (state: EditorTabsState): EditorTabsState => {
  return closeTabsExceptIf(state, editorTab => !editorTab.closable);
};

export const closeEditorTab = (
  state: EditorTabsState,
  chosenEditorTab: EditorTab
): EditorTabsState => {
  return closeTabsExceptIf(state, editorTab => editorTab !== chosenEditorTab);
};

export const closeOtherEditorTabs = (
  state: EditorTabsState,
  chosenEditorTab: EditorTab
): EditorTabsState => {
  return closeTabsExceptIf(
    state,
    editorTab => !editorTab.closable || editorTab === chosenEditorTab
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
  return closeTabsExceptIf(state, editorTab => {
    const editorProject =
      editorTab.editorRef && editorTab.editorRef.getProject();
    return !editorProject || editorProject !== project;
  });
};

/**
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

/**
 * Notify the editors that the preview will start. This gives a chance
 * to editors with changes to commit them (like modified extensions).
 */
export const notifyPreviewWillStart = (state: EditorTabsState) => {
  state.editors.forEach(editorTab => {
    const editor = editorTab.editorRef;

    if (editor instanceof EventsFunctionsExtensionEditorContainer) {
      editor.previewWillStart();
    }
  });
};

export const closeLayoutTabs = (state: EditorTabsState, layout: gdLayout) => {
  return closeTabsExceptIf(state, editorTab => {
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
  });
};

export const closeExternalLayoutTabs = (
  state: EditorTabsState,
  externalLayout: gdExternalLayout
) => {
  return closeTabsExceptIf(state, editorTab => {
    const editor = editorTab.editorRef;

    if (editor instanceof ExternalLayoutEditorContainer) {
      return (
        !editor.getExternalLayout() ||
        editor.getExternalLayout() !== externalLayout
      );
    }

    return true;
  });
};

export const closeExternalEventsTabs = (
  state: EditorTabsState,
  externalEvents: gdExternalEvents
) => {
  return closeTabsExceptIf(state, editorTab => {
    const editor = editorTab.editorRef;
    if (editor instanceof ExternalEventsEditorContainer) {
      return (
        !editor.getExternalEvents() ||
        editor.getExternalEvents() !== externalEvents
      );
    }

    return true;
  });
};

export const closeEventsFunctionsExtensionTabs = (
  state: EditorTabsState,
  eventsFunctionsExtension: gdEventsFunctionsExtension
) => {
  return closeTabsExceptIf(state, editorTab => {
    const editor = editorTab.editorRef;
    if (editor instanceof EventsFunctionsExtensionEditorContainer) {
      return (
        !editor.getEventsFunctionsExtension() ||
        editor.getEventsFunctionsExtension() !== eventsFunctionsExtension
      );
    }

    return true;
  });
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

export const moveTabToTheRightOfHoveredTab = (
  editorTabsState: EditorTabsState,
  movingTabIndex: number,
  hoveredTabIndex: number
): EditorTabsState => {
  // If the tab is dragged backward, we want it to be placed on the right
  // of the hovered tab so as to match the position of the drop indicator.
  const destinationIndex =
    movingTabIndex > hoveredTabIndex ? hoveredTabIndex + 1 : hoveredTabIndex;

  return moveTabToPosition(editorTabsState, movingTabIndex, destinationIndex);
};

export const moveTabToPosition = (
  editorTabsState: EditorTabsState,
  fromIndex: number,
  toIndex: number
): EditorTabsState => {
  const currentEditorTabs = [...getEditors(editorTabsState)];
  const movingTab = currentEditorTabs[fromIndex];
  currentEditorTabs.splice(fromIndex, 1);
  currentEditorTabs.splice(toIndex, 0, movingTab);

  let currentTabIndex = getCurrentTabIndex(editorTabsState);
  let currentTabNewIndex = currentTabIndex;

  const movingTabIsCurrentTab = fromIndex === currentTabIndex;
  const tabIsMovedFromLeftToRightOfCurrentTab =
    fromIndex < currentTabIndex && toIndex >= currentTabIndex;
  const tabIsMovedFromRightToLeftOfCurrentTab =
    fromIndex > currentTabIndex && toIndex <= currentTabIndex;

  if (movingTabIsCurrentTab) currentTabNewIndex = toIndex;
  else if (tabIsMovedFromLeftToRightOfCurrentTab) currentTabNewIndex -= 1;
  else if (tabIsMovedFromRightToLeftOfCurrentTab) currentTabNewIndex += 1;

  return { editors: currentEditorTabs, currentTab: currentTabNewIndex };
};
