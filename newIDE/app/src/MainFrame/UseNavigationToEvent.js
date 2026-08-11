// @flow
import * as React from 'react';
import { type EditorTabsState } from './EditorTabs/EditorTabsHandler';
import type { EventPath } from '../Utils/EventPath';
import type { LocationType } from '../Utils/Search';

export type EventNavigationTarget = {|
  name: string,
  locationType: LocationType,
  eventPath: EventPath,
  functionName?: string,
  lifecycleFunctionName?: string,
  behaviorName?: ?string,
  objectName?: ?string,
|};

type UseNavigationToEventProps = {|
  editorTabs: EditorTabsState,
|};

type UseNavigationToEventResult = {|
  setPendingEventNavigation: (target: EventNavigationTarget | null) => void,
|};

const EDITOR_MOUNT_DELAY_MS = 300;
const FUNCTION_SELECT_DELAY_MS = 150;

/**
 * Hook to handle navigation to a specific event in an events editor.
 * Sets up a pending navigation that will scroll to the event once the editor is mounted.
 */
export const useNavigationToEvent = ({
  editorTabs,
}: UseNavigationToEventProps): UseNavigationToEventResult => {
  const [
    pendingEventNavigation,
    setPendingEventNavigation,
  ] = React.useState<?EventNavigationTarget>(null);
  const scrollTimeoutIdRef = React.useRef<?TimeoutID>(null);

  React.useEffect(
    () => {
      if (!pendingEventNavigation) return;

      const timeoutId = setTimeout(() => {
        const {
          name,
          locationType,
          eventPath,
          functionName,
          lifecycleFunctionName,
          behaviorName,
          objectName,
        } = pendingEventNavigation;
        const getIsMatchingEditor = (editor: any): boolean => {
          if (locationType === 'layout') {
            return (
              editor.kind === 'layout events' && editor.projectItemName === name
            );
          }
          if (locationType === 'external-events') {
            return (
              editor.kind === 'external events' &&
              editor.projectItemName === name
            );
          }
          if (locationType === 'extension' && behaviorName) {
            return (
              editor.kind === 'behavior detail' &&
              editor.projectItemName === name + '::' + behaviorName
            );
          }
          if (
            locationType === 'extension' &&
            functionName &&
            !behaviorName &&
            !objectName
          ) {
            return (
              editor.kind === 'function detail' &&
              editor.projectItemName === name + '::' + functionName
            );
          }
          return (
            editor.kind === 'events functions extension' &&
            editor.projectItemName === name
          );
        };

        for (const paneIdentifier in editorTabs.panes) {
          const pane = editorTabs.panes[paneIdentifier];
          for (const editor of pane.editors) {
            if (getIsMatchingEditor(editor) && editor.editorRef) {
              const ref = editor.editorRef;

              if (
                locationType === 'extension' &&
                functionName &&
                // $FlowFixMe[method-unbinding]
                ref.selectEventsFunctionByName
              ) {
                // $FlowFixMe[not-a-function]
                ref.selectEventsFunctionByName(
                  functionName,
                  behaviorName,
                  objectName
                );
                // $FlowFixMe[method-unbinding]
                if (ref.scrollToEventPath) {
                  scrollTimeoutIdRef.current = setTimeout(() => {
                    scrollTimeoutIdRef.current = null;
                    // $FlowFixMe[not-a-function]
                    // $FlowFixMe[prop-missing]
                    ref.scrollToEventPath(eventPath);
                    setPendingEventNavigation(null);
                  }, FUNCTION_SELECT_DELAY_MS);
                } else {
                  setPendingEventNavigation(null);
                }
              } else if (
                locationType !== 'extension' &&
                lifecycleFunctionName &&
                // $FlowFixMe[method-unbinding]
                ref.selectLifecycleFunctionByName
              ) {
                // $FlowFixMe[not-a-function]
                ref.selectLifecycleFunctionByName(lifecycleFunctionName);
                // $FlowFixMe[method-unbinding]
                if (ref.scrollToEventPath) {
                  scrollTimeoutIdRef.current = setTimeout(() => {
                    scrollTimeoutIdRef.current = null;
                    // $FlowFixMe[not-a-function]
                    // $FlowFixMe[prop-missing]
                    ref.scrollToEventPath(eventPath);
                    setPendingEventNavigation(null);
                  }, FUNCTION_SELECT_DELAY_MS);
                } else {
                  setPendingEventNavigation(null);
                }
              } else {
                // $FlowFixMe[method-unbinding]
                if (ref.scrollToEventPath) {
                  // $FlowFixMe[not-a-function]
                  ref.scrollToEventPath(eventPath);
                }
                setPendingEventNavigation(null);
              }

              return;
            }
          }
        }

        setPendingEventNavigation(null);
      }, EDITOR_MOUNT_DELAY_MS);

      return () => {
        clearTimeout(timeoutId);
        if (scrollTimeoutIdRef.current) {
          clearTimeout(scrollTimeoutIdRef.current);
          scrollTimeoutIdRef.current = null;
        }
      };
    },
    [pendingEventNavigation, editorTabs]
  );

  return { setPendingEventNavigation };
};
