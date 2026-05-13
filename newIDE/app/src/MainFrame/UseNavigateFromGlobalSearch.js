// @flow

import * as React from 'react';
import type { EditorTabsState } from './EditorTabs/EditorTabsHandler';
import type { EventPath } from '../Utils/EventPath';
import { type State } from './MainFrameState';
import type {
  NavigateToEventFromGlobalSearchParams,
  LocationType,
} from '../Utils/Search';

type Props = {|
  editorTabs: EditorTabsState,
  setState: ((State => State) | State) => Promise<State>,
  setPendingEventNavigation: ({|
    name: string,
    locationType: LocationType,
    eventPath: EventPath,
    functionName?: string,
    behaviorName?: ?string,
    objectName?: ?string,
  |}) => void,
  openLayout: (
    name: string,
    options?: {|
      openEventsEditor: boolean,
      openSceneEditor: boolean,
      focusWhenOpened:
        | 'scene-or-events-otherwise'
        | 'scene'
        | 'events'
        | 'none',
    |}
  ) => void,
  openExternalEvents: (name: string) => void,
  openEventsFunctionsExtension: (
    name: string,
    initiallyFocusedFunctionName?: ?string,
    initiallyFocusedBehaviorName?: ?string,
    initiallyFocusedObjectName?: ?string
  ) => void,
|};

const useNavigateFromGlobalSearch = ({
  editorTabs,
  setState,
  setPendingEventNavigation,
  openLayout,
  openExternalEvents,
  openEventsFunctionsExtension,
}: Props): {|
  navigateToEventFromGlobalSearch: (
    params: NavigateToEventFromGlobalSearchParams
  ) => void,
  clearGlobalSearchHighlightsInEditorTabs: (
    editorTabs: EditorTabsState
  ) => void,
|} => {
  const hasGlobalSearchTab = React.useCallback(
    (editorTabs: EditorTabsState) => {
      for (const paneIdentifier in editorTabs.panes) {
        const pane = editorTabs.panes[paneIdentifier];
        if (pane.editors.some(editor => editor.kind === 'global-search')) {
          return true;
        }
      }
      return false;
    },
    []
  );

  const clearGlobalSearchHighlightsInEditorTabs = React.useCallback(
    (editorTabs: EditorTabsState) => {
      for (const paneIdentifier in editorTabs.panes) {
        const pane = editorTabs.panes[paneIdentifier];
        for (const editor of pane.editors) {
          const editorRef: any = editor.editorRef;
          if (
            (editor.kind === 'layout events' ||
              editor.kind === 'external events' ||
              editor.kind === 'events functions extension') &&
            editorRef &&
            editorRef.clearGlobalSearchResults
          ) {
            editorRef.clearGlobalSearchResults();
          }
        }
      }
    },
    []
  );

  const globalSearchRetryTimeoutIdRef = React.useRef<?TimeoutID>(null);

  const clearGlobalSearchRetryTimeoutId = React.useCallback(() => {
    if (globalSearchRetryTimeoutIdRef.current) {
      clearTimeout(globalSearchRetryTimeoutIdRef.current);
      globalSearchRetryTimeoutIdRef.current = null;
    }
  }, []);

  const previousEditorTabs = React.useRef<EditorTabsState>(editorTabs);

  React.useEffect(
    () => {
      const hadGlobalSearchTab = hasGlobalSearchTab(previousEditorTabs.current);
      const hasGlobalSearchTabNow = hasGlobalSearchTab(editorTabs);

      if (hadGlobalSearchTab && !hasGlobalSearchTabNow) {
        clearGlobalSearchHighlightsInEditorTabs(previousEditorTabs.current);
      }

      previousEditorTabs.current = editorTabs;
    },
    [editorTabs, hasGlobalSearchTab, clearGlobalSearchHighlightsInEditorTabs]
  );

  React.useEffect(
    () => () => {
      clearGlobalSearchRetryTimeoutId();
    },
    [clearGlobalSearchRetryTimeoutId]
  );

  const openSearchedEditor = React.useCallback(
    ({
      locationType,
      name,
      extensionName,
      functionName,
      behaviorName,
      objectName,
    }: {|
      locationType: LocationType,
      name: string,
      extensionName?: string,
      functionName?: string,
      behaviorName?: string,
      objectName?: string,
    |}): void => {
      const openTypeDic: { [typeof locationType]: () => void } = {
        layout: () =>
          openLayout(name, {
            openEventsEditor: true,
            openSceneEditor: false,
            focusWhenOpened: 'events',
          }),
        'external-events': () => openExternalEvents(name),
        extension: () =>
          openEventsFunctionsExtension(
            extensionName || name,
            functionName,
            behaviorName,
            objectName
          ),
      };

      return openTypeDic[locationType]();
    },
    [openEventsFunctionsExtension, openExternalEvents, openLayout]
  );

  const navigateToEventFromGlobalSearch = React.useCallback(
    ({
      locationType,
      name,
      eventPath,
      highlightedEventPaths,
      searchText,
      extensionName,
      functionName,
      behaviorName,
      objectName,
      searchFilterParams,
    }: NavigateToEventFromGlobalSearchParams) => {
      const {
        matchCase,
        searchInConditions,
        searchInActions,
        searchInEventStrings,
        searchInInstructionNames,
      } = searchFilterParams;
      clearGlobalSearchRetryTimeoutId();
      clearGlobalSearchHighlightsInEditorTabs(editorTabs);
      setPendingEventNavigation({
        name,
        locationType,
        eventPath,
        functionName,
        behaviorName,
        objectName,
      });

      openSearchedEditor({
        locationType,
        name,
        extensionName,
        functionName,
        behaviorName,
        objectName,
      });

      const EDITOR_MOUNT_INITIAL_DELAY_MS = 100;
      const EDITOR_MOUNT_RETRY_INTERVAL_MS = 100;
      const EDITOR_MOUNT_MAX_ATTEMPTS = 25; // ~2.5s total

      const editorKind =
        locationType === 'layout'
          ? 'layout events'
          : locationType === 'external-events'
          ? 'external events'
          : 'events functions extension';

      const tryApplyGlobalSearchResults = (attempt: number) => {
        setState(latestState => {
          for (const paneIdentifier in latestState.editorTabs.panes) {
            const pane = latestState.editorTabs.panes[paneIdentifier];
            for (const editor of pane.editors) {
              const editorRef: any = editor.editorRef;
              if (
                editor.kind === editorKind &&
                editor.projectItemName === name &&
                editorRef &&
                editorRef.setGlobalSearchResults
              ) {
                const applySearchResults = () => {
                  editorRef.setGlobalSearchResults(
                    highlightedEventPaths,
                    eventPath,
                    searchText,
                    {
                      searchInConditions,
                      searchInActions,
                      searchInEventStrings,
                      searchInInstructionNames,
                      matchCase,
                    }
                  );
                };
                // For extensions: ensure we're on the correct function before
                // setting search results. openEditorTab only focuses an
                // already-open tab and does not reapply extraEditorProps.
                if (
                  locationType === 'extension' &&
                  functionName &&
                  editorRef.selectEventsFunctionByName
                ) {
                  editorRef.selectEventsFunctionByName(
                    functionName,
                    behaviorName || null,
                    objectName || null
                  );
                  // Defer so React can re-render with the new function's events
                  requestAnimationFrame(() => {
                    requestAnimationFrame(applySearchResults);
                  });
                } else {
                  applySearchResults();
                }
                globalSearchRetryTimeoutIdRef.current = null;
                return latestState;
              }
            }
          }

          if (attempt < EDITOR_MOUNT_MAX_ATTEMPTS) {
            globalSearchRetryTimeoutIdRef.current = setTimeout(
              () => tryApplyGlobalSearchResults(attempt + 1),
              attempt === 0
                ? EDITOR_MOUNT_INITIAL_DELAY_MS
                : EDITOR_MOUNT_RETRY_INTERVAL_MS
            );
          } else {
            globalSearchRetryTimeoutIdRef.current = null;
          }
          return latestState;
        });
      };

      globalSearchRetryTimeoutIdRef.current = setTimeout(
        () => tryApplyGlobalSearchResults(0),
        EDITOR_MOUNT_INITIAL_DELAY_MS
      );
    },
    [
      clearGlobalSearchRetryTimeoutId,
      clearGlobalSearchHighlightsInEditorTabs,
      editorTabs,
      setPendingEventNavigation,
      openSearchedEditor,
      setState,
    ]
  );

  return {
    navigateToEventFromGlobalSearch,
    clearGlobalSearchHighlightsInEditorTabs,
  };
};

export default useNavigateFromGlobalSearch;
