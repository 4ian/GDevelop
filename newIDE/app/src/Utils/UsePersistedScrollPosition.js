// @flow
import * as React from 'react';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
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
  React.useEffect(
    () => () => {
      if (saveScrollTimeoutId.current) {
        clearTimeout(saveScrollTimeoutId.current);
        saveScrollTimeoutId.current = null;
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

      const scrollPosition =
        editorStateForProject.propertiesPanel[persistedPanelStateType]?.[
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

      saveScrollTimeoutId.current = setTimeout(() => {
        const currentEditorState = getEditorStateForProject(projectId);

        setEditorStateForProject(projectId, {
          propertiesPanel: {
            ...currentEditorState?.propertiesPanel,
            [persistedPanelStateType]: {
              ...currentEditorState?.propertiesPanel[persistedPanelStateType],
              [persistedPanelStateId]: {
                ...currentEditorState?.propertiesPanel[
                  persistedPanelStateType
                ]?.[persistedPanelStateId],
                scrollPosition: scrollView.getScrollPosition(),
              },
            },
          },
        });
      }, saveDebounceTimeInMs);
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
