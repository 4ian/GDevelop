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
import { type HomePageEditorInterface } from '../EditorContainers/HomePage';
import {
  type RenderEditorContainerPropsWithRef,
  type EditorContainerExtraProps,
} from '../EditorContainers/BaseEditor';
import { type AskAiEditorInterface } from '../../AiGeneration/AskAiEditorContainer';
import { type HTMLDataset } from '../../Utils/HTMLDataset';
import { CustomObjectEditorContainer } from '../EditorContainers/CustomObjectEditorContainer';

// Supported editors
type EditorRef =
  | DebuggerEditorContainer
  | EventsEditorContainer
  | EventsFunctionsExtensionEditorContainer
  | ExternalEventsEditorContainer
  | ExternalLayoutEditorContainer
  | ResourcesEditorContainer
  | SceneEditorContainer
  | HomePageEditorInterface
  | AskAiEditorInterface;

type TabOptions = {| data?: HTMLDataset |};

export type EditorTab = {|
  /** The function to render the tab editor. */
  renderEditorContainer: RenderEditorContainerPropsWithRef => React.Node,
  /** A reference to the editor. */
  editorRef: ?EditorRef,
  /** The label shown on the tab. */
  label?: string,
  icon?: React.Node,
  renderCustomIcon: ?(brightness: number) => React.Node,
  /** the html dataset object to set on the tab button. */
  tabOptions?: TabOptions,
  /** The name of the layout/external layout/external events/extension. */
  projectItemName: ?string,
  /** A unique key for the tab. */
  key: string,
  /** Extra props to pass to editors. */
  extraEditorProps: ?EditorContainerExtraProps,
  /** If set to false, the tab can't be closed. */
  closable: boolean,
|};

export type EditorTabsState = {|
  panes: {
    [paneIdentifier: string]: {|
      editors: Array<EditorTab>,
      currentTab: number,
    |},
  },
|};

export type EditorKind =
  | 'layout'
  | 'layout events'
  | 'external layout'
  | 'external events'
  | 'events functions extension'
  | 'custom object'
  | 'debugger'
  | 'resources'
  | 'ask-ai'
  | 'start page';

type EditorTabMetadata = {|
  /** The name of the layout/external layout/external events/extension. */
  projectItemName: ?string,
  /** The editor kind. */
  editorKind: EditorKind,
|};

export type EditorTabsPersistedState = {|
  editors: Array<EditorTabMetadata>,
  currentTab: number,
|};

export type EditorOpeningOptions = {|
  paneIdentifier: string,
  label?: string,
  icon?: React.Node,
  renderCustomIcon?: ?(brightness: number) => React.Node,
  projectItemName: ?string,
  tabOptions?: TabOptions,
  renderEditorContainer: (
    props: RenderEditorContainerPropsWithRef
  ) => React.Node,
  key: string,
  extraEditorProps?: EditorContainerExtraProps,
  dontFocusTab?: boolean,
  closable?: boolean,
|};

export const getEditorTabMetadata = (
  editorTab: EditorTab
): EditorTabMetadata => {
  return {
    projectItemName: editorTab.projectItemName,
    editorKind:
      editorTab.editorRef instanceof SceneEditorContainer
        ? 'layout'
        : editorTab.editorRef instanceof ExternalEventsEditorContainer
        ? 'external events'
        : editorTab.editorRef instanceof ExternalLayoutEditorContainer
        ? 'external layout'
        : editorTab.editorRef instanceof ResourcesEditorContainer
        ? 'resources'
        : editorTab.editorRef instanceof EventsEditorContainer
        ? 'layout events'
        : editorTab.editorRef instanceof EventsFunctionsExtensionEditorContainer
        ? 'events functions extension'
        : editorTab.editorRef instanceof CustomObjectEditorContainer
        ? 'custom object'
        : editorTab.editorRef instanceof DebuggerEditorContainer
        ? 'debugger'
        : editorTab.key === 'ask-ai'
        ? 'ask-ai'
        : 'start page',
  };
};

export const getEditorTabsInitialState = (): EditorTabsState => {
  return {
    panes: {
      left: {
        editors: [],
        currentTab: 0,
      },
      center: {
        editors: [],
        currentTab: 0,
      },
      right: {
        editors: [],
        currentTab: 0,
      },
    },
  };
};

export const openEditorTab = (
  state: EditorTabsState,
  {
    label,
    icon,
    renderCustomIcon,
    projectItemName,
    tabOptions,
    renderEditorContainer,
    key,
    extraEditorProps,
    dontFocusTab,
    closable,
    paneIdentifier,
  }: EditorOpeningOptions
): EditorTabsState => {
  for (const paneIdentifier in state.panes) {
    const pane = state.panes[paneIdentifier];

    const existingEditorId = findIndex(
      pane.editors,
      editor => editor.key === key
    );
    if (existingEditorId !== -1) {
      return dontFocusTab
        ? { ...state }
        : changeCurrentTab(state, paneIdentifier, existingEditorId);
    }
  }

  const editorTab: EditorTab = {
    label,
    icon,
    renderCustomIcon,
    projectItemName,
    tabOptions,
    renderEditorContainer,
    key,
    extraEditorProps,
    editorRef: null,
    closable: typeof closable === 'undefined' ? true : !!closable,
  };

  const pane = state.panes[paneIdentifier];
  if (!pane) {
    throw new Error(`Pane with identifier "${paneIdentifier}" is not valid.`);
  }

  let newState = {
    ...state,
    panes: {
      ...state.panes,
      [paneIdentifier]: {
        ...pane,
        editors:
          // Make sure the home page is always the first tab.
          key === 'start page'
            ? [editorTab, ...pane.editors]
            : [...pane.editors, editorTab],
        currentTab: pane.currentTab,
      },
    },
  };
  if (!dontFocusTab) {
    newState = changeCurrentTab(newState, paneIdentifier, pane.editors.length);
  }
  return newState;
};

export const changeCurrentTab = (
  state: EditorTabsState,
  paneIdentifier: string,
  newTabId: number
): EditorTabsState => {
  const pane = state.panes[paneIdentifier];
  if (!pane) {
    throw new Error(`Pane with identifier "${paneIdentifier}" is not valid.`);
  }

  return {
    ...state,
    panes: {
      ...state.panes,
      [paneIdentifier]: {
        ...pane,
        currentTab: Math.max(0, Math.min(newTabId, pane.editors.length - 1)),
      },
    },
  };
};

export const isStartPageTabPresent = (state: EditorTabsState): boolean => {
  return hasEditorTabOpenedWithKey(state, 'start page');
};

export const closeTabsExceptIf = (
  state: EditorTabsState,
  keepPredicate: (editorTab: EditorTab) => boolean
) => {
  let newState = { ...state };
  for (const paneIdentifier in state.panes) {
    const pane = state.panes[paneIdentifier];
    if (!pane) {
      throw new Error(`Pane with identifier "${paneIdentifier}" is not valid.`);
    }

    const currentEditorTab = pane.editors[pane.currentTab] || null;
    const paneRemainingEditors = pane.editors.filter(keepPredicate);
    const currentEditorTabNewIndex = paneRemainingEditors.indexOf(
      currentEditorTab
    );
    newState.panes[paneIdentifier] = {
      ...pane,
      editors: paneRemainingEditors,

      // Keep the focus on the current editor tab, or if it was closed
      // go back to the first tab.
      currentTab:
        currentEditorTabNewIndex === -1 ? 0 : currentEditorTabNewIndex,
    };
  }

  return newState;
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

export const getEditorsForPane = (
  state: EditorTabsState,
  paneIdentifier: string
): Array<EditorTab> => {
  return state.panes[paneIdentifier].editors || [];
};

export const getCurrentTabIndexForPane = (
  state: EditorTabsState,
  paneIdentifier: string
): number => {
  const pane = state.panes[paneIdentifier];
  return pane.currentTab || 0;
};

export const getCurrentTabForPane = (
  state: EditorTabsState,
  paneIdentifier: string
): EditorTab | null => {
  const pane = state.panes[paneIdentifier];
  return pane.editors[pane.currentTab] || null;
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
  for (const paneIdentifier in state.panes) {
    const pane = state.panes[paneIdentifier];
    if (!pane) {
      continue;
    }

    pane.editors.forEach(editorTab => {
      if (
        editorTab.editorRef &&
        (editorTab.editorRef instanceof SceneEditorContainer ||
          editorTab.editorRef instanceof ExternalLayoutEditorContainer)
      ) {
        editorTab.editorRef.saveUiSettings();
      }
    });
  }
};

/**
 * Notify the editors that the preview will start. This gives a chance
 * to editors with changes to commit them (like modified extensions).
 */
export const notifyPreviewOrExportWillStart = (state: EditorTabsState) => {
  for (const paneIdentifier in state.panes) {
    const pane = state.panes[paneIdentifier];
    if (!pane) {
      continue;
    }

    pane.editors.forEach(editorTab => {
      const editor = editorTab.editorRef;

      if (editor instanceof EventsFunctionsExtensionEditorContainer) {
        editor.previewOrExportWillStart();
      }
    });
  }
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
  eventsFunctionsExtensionName: string
) => {
  return closeTabsExceptIf(state, editorTab => {
    const editor = editorTab.editorRef;
    if (
      editor instanceof EventsFunctionsExtensionEditorContainer ||
      editor instanceof CustomObjectEditorContainer
    ) {
      return (
        !editor.getEventsFunctionsExtensionName() ||
        editor.getEventsFunctionsExtensionName() !==
          eventsFunctionsExtensionName
      );
    }
    return true;
  });
};

export const closeCustomObjectTab = (
  state: EditorTabsState,
  eventsFunctionsExtensionName: string,
  eventsBasedObjectName: string
) => {
  return closeTabsExceptIf(state, editorTab => {
    const editor = editorTab.editorRef;
    if (editor instanceof CustomObjectEditorContainer) {
      return (
        (!editor.getEventsFunctionsExtensionName() ||
          editor.getEventsFunctionsExtensionName() !==
            eventsFunctionsExtensionName) &&
        (!editor.getEventsBasedObjectName() ||
          editor.getEventsBasedObjectName() !== eventsBasedObjectName)
      );
    }
    return true;
  });
};

export const closeEventsBasedObjectVariantTab = (
  state: EditorTabsState,
  eventsFunctionsExtensionName: string,
  eventsBasedObjectName: string,
  eventsBasedObjectVariantName: string
) => {
  return closeTabsExceptIf(state, editorTab => {
    const editor = editorTab.editorRef;
    if (editor instanceof CustomObjectEditorContainer) {
      return (
        (!editor.getEventsFunctionsExtensionName() ||
          editor.getEventsFunctionsExtensionName() !==
            eventsFunctionsExtensionName) &&
        (!editor.getEventsBasedObjectName() ||
          editor.getEventsBasedObjectName() !== eventsBasedObjectName) &&
        (!editor.getVariantName() ||
          editor.getVariantName() !== eventsBasedObjectVariantName)
      );
    }
    return true;
  });
};

export const getEventsFunctionsExtensionEditor = (
  state: EditorTabsState,
  eventsFunctionsExtension: gdEventsFunctionsExtension
): ?{|
  editor: EventsFunctionsExtensionEditorContainer,
  paneIdentifier: string,
  tabIndex: number,
|} => {
  for (const paneIdentifier in state.panes) {
    const pane = state.panes[paneIdentifier];
    for (let tabIndex = 0; tabIndex < pane.editors.length; ++tabIndex) {
      const editor = pane.editors[tabIndex].editorRef;
      if (
        editor instanceof EventsFunctionsExtensionEditorContainer &&
        editor.getEventsFunctionsExtension() === eventsFunctionsExtension
      ) {
        return { editor, paneIdentifier, tabIndex };
      }
    }
  }

  return null;
};

export const getCustomObjectEditor = (
  state: EditorTabsState,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject,
  variantName: string
): ?{|
  editor: CustomObjectEditorContainer,
  paneIdentifier: string,
  tabIndex: number,
|} => {
  for (const paneIdentifier in state.panes) {
    const pane = state.panes[paneIdentifier];
    for (let tabIndex = 0; tabIndex < pane.editors.length; ++tabIndex) {
      const editor = pane.editors[tabIndex].editorRef;
      if (
        editor instanceof CustomObjectEditorContainer &&
        editor.getEventsFunctionsExtension() === eventsFunctionsExtension &&
        editor.getEventsBasedObject() === eventsBasedObject &&
        editor.getVariantName() === variantName
      ) {
        return { editor, paneIdentifier, tabIndex };
      }
    }
  }

  return null;
};

export const moveTabToTheRightOfHoveredTab = (
  editorTabsState: EditorTabsState,
  paneIdentifier: string,
  movingTabIndex: number,
  hoveredTabIndex: number
): EditorTabsState => {
  // If the tab is dragged backward, we want it to be placed on the right
  // of the hovered tab so as to match the position of the drop indicator.
  const destinationIndex =
    movingTabIndex > hoveredTabIndex ? hoveredTabIndex + 1 : hoveredTabIndex;

  return moveTabToPosition(
    editorTabsState,
    paneIdentifier,
    movingTabIndex,
    destinationIndex
  );
};

export const moveTabToPosition = (
  editorTabsState: EditorTabsState,
  paneIdentifier: string,
  fromIndex: number,
  toIndex: number
): EditorTabsState => {
  const paneNewEditorTabs = [
    ...getEditorsForPane(editorTabsState, paneIdentifier),
  ];
  const movingTab = paneNewEditorTabs[fromIndex];
  paneNewEditorTabs.splice(fromIndex, 1);
  paneNewEditorTabs.splice(toIndex, 0, movingTab);

  let currentTabIndex = getCurrentTabIndexForPane(
    editorTabsState,
    paneIdentifier
  );
  let paneNewCurrentTab = currentTabIndex;

  const movingTabIsCurrentTab = fromIndex === currentTabIndex;
  const tabIsMovedFromLeftToRightOfCurrentTab =
    fromIndex < currentTabIndex && toIndex >= currentTabIndex;
  const tabIsMovedFromRightToLeftOfCurrentTab =
    fromIndex > currentTabIndex && toIndex <= currentTabIndex;

  if (movingTabIsCurrentTab) paneNewCurrentTab = toIndex;
  else if (tabIsMovedFromLeftToRightOfCurrentTab) paneNewCurrentTab -= 1;
  else if (tabIsMovedFromRightToLeftOfCurrentTab) paneNewCurrentTab += 1;

  // The index changes but the tab is the same so there is no need to call changeCurrentTab.
  return {
    ...editorTabsState,
    panes: {
      ...editorTabsState.panes,
      [paneIdentifier]: {
        ...editorTabsState.panes[paneIdentifier],
        editors: paneNewEditorTabs,
        currentTab: paneNewCurrentTab,
      },
    },
  };
};

export const getEditorTabOpenedWithKey = (
  editorTabsState: EditorTabsState,
  key: string
): {|
  paneIdentifier: string,
  editorTab: EditorTab,
|} | null => {
  for (const paneIdentifier in editorTabsState.panes) {
    const pane = editorTabsState.panes[paneIdentifier];
    const editorTab = pane && pane.editors.find(editor => editor.key === key);
    if (editorTab) {
      return { editorTab, paneIdentifier };
    }
  }

  return null;
};

const hasEditorTabOpenedWithKey = (
  editorTabsState: EditorTabsState,
  key: string
): boolean => {
  return getEditorTabOpenedWithKey(editorTabsState, key) !== null;
};

export const getOpenedAskAiEditor = (
  state: EditorTabsState
): null | {|
  askAiEditor: AskAiEditorInterface,
  editorTab: EditorTab,
  paneIdentifier: string,
|} => {
  const currentEditorTabAndPaneIdentifier = getEditorTabOpenedWithKey(
    state,
    'ask-ai'
  );
  if (!currentEditorTabAndPaneIdentifier) return null;

  return {
    // $FlowFixMe - the key ensures that the editor is an AskAiEditorInterface.
    askAiEditor: currentEditorTabAndPaneIdentifier.editorTab.editorRef,
    editorTab: currentEditorTabAndPaneIdentifier.editorTab,
    paneIdentifier: currentEditorTabAndPaneIdentifier.paneIdentifier,
  };
};

export const getAllEditorTabs = (state: EditorTabsState): Array<EditorTab> => {
  const allEditors = [];
  for (const paneIdentifier in state.panes) {
    const pane = state.panes[paneIdentifier];
    allEditors.push(...pane.editors);
  }
  return allEditors;
};

export const hasEditorsInPane = (
  state: EditorTabsState,
  paneIdentifier: string
): boolean => {
  const pane = state.panes[paneIdentifier];
  if (!pane) {
    return false;
  }

  return pane.editors.length > 0;
};
