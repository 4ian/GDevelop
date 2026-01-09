// @flow
import * as React from 'react';
import { type EditorTabsState } from './EditorTabs/EditorTabsHandler';

export type EventNavigationTarget = {|
  name: string,
  locationType: 'layout' | 'external-events',
  eventPath: Array<number>,
|};

type UseEventNavigationProps = {|
  editorTabs: EditorTabsState,
|};

type UseEventNavigationResult = {|
  setPendingEventNavigation: (target: EventNavigationTarget | null) => void,
|};

const EDITOR_MOUNT_DELAY_MS = 300;

/**
 * Hook to handle navigation to a specific event in an events editor.
 * Sets up a pending navigation that will scroll to the event once the editor is mounted.
 */
export const useNavigationToEvent = ({
  editorTabs,
}: UseEventNavigationProps): UseEventNavigationResult => {
  const [
    pendingEventNavigation,
    setPendingEventNavigation,
  ] = React.useState<?EventNavigationTarget>(null);

  React.useEffect(
    () => {
      if (!pendingEventNavigation) return;

      const timeoutId = setTimeout(() => {
        const { name, locationType, eventPath } = pendingEventNavigation;
        const editorKind =
          locationType === 'layout' ? 'layout events' : 'external events';

        for (const paneIdentifier in editorTabs.panes) {
          const pane = editorTabs.panes[paneIdentifier];
          for (const editor of pane.editors) {
            if (
              editor.kind === editorKind &&
              editor.projectItemName === name &&
              editor.editorRef &&
              editor.editorRef.scrollToEventPath
            ) {
              editor.editorRef.scrollToEventPath(eventPath);
              setPendingEventNavigation(null);
              return;
            }
          }
        }

        setPendingEventNavigation(null);
      }, EDITOR_MOUNT_DELAY_MS);

      return () => clearTimeout(timeoutId);
    },
    [pendingEventNavigation, editorTabs]
  );

  return { setPendingEventNavigation };
};
