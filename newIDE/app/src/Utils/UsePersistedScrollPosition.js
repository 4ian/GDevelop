// @flow
import * as React from 'react';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { type ScrollViewInterface } from '../UI/ScrollView';

type Props = {|
  project: gdProject,
  scrollViewRef: {| current: ?ScrollViewInterface |},
  scrollKey: string,
  persistedScrollId: string | null,
  saveDebounceTimeInMs?: number,
|};

export const usePersistedScrollPosition = ({
  project,
  scrollViewRef,
  scrollKey,
  persistedScrollId,
  saveDebounceTimeInMs = 300,
}: Props): (() => void) => {
  const { getEditorStateForProject, setEditorStateForProject } = React.useContext(
    PreferencesContext
  );
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
      if (!persistedScrollId || !scrollViewRef.current) {
        return;
      }
      const editorStateForProject = getEditorStateForProject(projectId);
      if (!editorStateForProject) return;

      const scrollPosition =
        editorStateForProject.propertiesPanelScroll[persistedScrollId];
      if (!Number.isFinite(scrollPosition)) return;

      scrollViewRef.current.scrollToPosition(scrollPosition);
    },
    [
      getEditorStateForProject,
      persistedScrollId,
      projectId,
      scrollKey,
      scrollViewRef,
    ]
  );

  return React.useCallback(
    () => {
      if (!scrollViewRef.current || !persistedScrollId) return;
      if (saveScrollTimeoutId.current) {
        clearTimeout(saveScrollTimeoutId.current);
      }

      saveScrollTimeoutId.current = setTimeout(() => {
        const currentEditorState = getEditorStateForProject(projectId);
        if (!currentEditorState) return;

        setEditorStateForProject(projectId, {
          propertiesPanelScroll: {
            ...currentEditorState.propertiesPanelScroll,
            [persistedScrollId]: scrollViewRef.current
              ? scrollViewRef.current.getScrollPosition()
              : 0,
          },
        });
      }, saveDebounceTimeInMs);
    },
    [
      getEditorStateForProject,
      persistedScrollId,
      projectId,
      saveDebounceTimeInMs,
      scrollViewRef,
      setEditorStateForProject,
    ]
  );
};
