// @flow
import * as React from 'react';
import PreferencesContext, {
  type EditorStateForPropertyPanel,
} from '../MainFrame/Preferences/PreferencesContext';
import { type ScrollViewInterface } from '../UI/ScrollView';

type Props = {|
  project: gdProject,
  scrollViewRef: {| current: ?ScrollViewInterface |},
  scrollKey: string,
  persistedPanelStateType:
    | 'instances-of-object'
    | 'object'
    | 'scene'
    | 'objectGroup'
    | 'layer',
  persistedPanelStateId: string | null,
  saveDebounceTimeInMs?: number,
|};

// The positions saved in the preferences, also kept here: a save is a React
// state update, which a panel mounted right after (reopened by an undo) can
// still read as not applied.
const latestSavedScrollPositions: Map<string, number> = new Map();

export const usePersistedScrollPosition = ({
  project,
  scrollViewRef,
  scrollKey,
  persistedPanelStateType,
  persistedPanelStateId,
  saveDebounceTimeInMs = 300,
}: Props): (() => void) => {
  const {
    getEditorStateForProject,
    setEditorStateForProject,
  } = React.useContext(PreferencesContext);
  const projectId = project.getProjectUuid();

  const saveScrollTimeoutId = React.useRef<?TimeoutID>(null);
  // The save of the latest scroll position is debounced: when the panel is
  // closed before it happened, do it right away (or the panel would open
  // again where it was a moment before being closed).
  const savePendingScrollPositionRef = React.useRef<() => void>(() => {});
  React.useEffect(
    () => () => {
      if (saveScrollTimeoutId.current) {
        clearTimeout(saveScrollTimeoutId.current);
        saveScrollTimeoutId.current = null;
        savePendingScrollPositionRef.current();
      }
    },
    []
  );

  React.useLayoutEffect(
    () => {
      const scrollView = scrollViewRef.current;
      if (!persistedPanelStateId || !scrollView) {
        return;
      }
      const editorStateForProject = getEditorStateForProject(projectId);
      if (!editorStateForProject) return;

      const latestSavedScrollPosition = latestSavedScrollPositions.get(
        `${projectId}/${persistedPanelStateType}/${persistedPanelStateId}`
      );
      const scrollPosition =
        latestSavedScrollPosition !== undefined
          ? latestSavedScrollPosition
          : editorStateForProject.propertiesPanel[persistedPanelStateType]?.[
              persistedPanelStateId
            ]?.scrollPosition;
      if (!Number.isFinite(scrollPosition)) {
        return;
      }

      scrollView.scrollToPosition(scrollPosition);
    },
    [
      getEditorStateForProject,
      persistedPanelStateId,
      persistedPanelStateType,
      projectId,
      scrollKey,
      scrollViewRef,
    ]
  );

  const onScroll = React.useCallback(
    () => {
      const scrollView = scrollViewRef.current;
      if (!scrollView || !persistedPanelStateId) return;
      if (saveScrollTimeoutId.current) {
        clearTimeout(saveScrollTimeoutId.current);
      }

      // Read now: the scroll view can be gone when saved after the panel
      // is closed.
      const scrollPosition = scrollView.getScrollPosition();
      const saveScrollPosition = () => {
        saveScrollTimeoutId.current = null;
        latestSavedScrollPositions.set(
          `${projectId}/${persistedPanelStateType}/${persistedPanelStateId}`,
          scrollPosition
        );
        const currentEditorState = getEditorStateForProject(projectId);

        const panelState: EditorStateForPropertyPanel = {
          collapsedSections: {},
          ...currentEditorState?.propertiesPanel[persistedPanelStateType]?.[
            persistedPanelStateId
          ],
          scrollPosition,
        };

        setEditorStateForProject(projectId, {
          propertiesPanel: {
            ...currentEditorState?.propertiesPanel,
            [persistedPanelStateType]: {
              ...currentEditorState?.propertiesPanel[persistedPanelStateType],
              [persistedPanelStateId]: panelState,
            },
          },
        });
      };
      savePendingScrollPositionRef.current = saveScrollPosition;
      saveScrollTimeoutId.current = setTimeout(
        saveScrollPosition,
        saveDebounceTimeInMs
      );
    },
    [
      getEditorStateForProject,
      persistedPanelStateId,
      persistedPanelStateType,
      projectId,
      saveDebounceTimeInMs,
      scrollViewRef,
      setEditorStateForProject,
    ]
  );

  return onScroll;
};
