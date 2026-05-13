// @flow
import * as React from 'react';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { type ScrollViewInterface } from '../UI/ScrollView';

type Props = {|
  project: gdProject,
  scrollViewRef: {| current: ?ScrollViewInterface |},
  scrollKey: string,
  persistedScrollType: 'instances-of-object' | 'object',
  persistedScrollId: string | null,
  saveDebounceTimeInMs?: number,
|};

export const usePersistedScrollPosition = ({
  project,
  scrollViewRef,
  scrollKey,
  persistedScrollType,
  persistedScrollId,
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
      if (!persistedScrollId || !scrollView) {
        return;
      }
      const editorStateForProject = getEditorStateForProject(projectId);
      if (!editorStateForProject) return;

      const scrollPosition =
        editorStateForProject.propertiesPanelScroll[persistedScrollType]?.[
          persistedScrollId
        ];
      if (!Number.isFinite(scrollPosition)) {
        return;
      }

      scrollView.scrollToPosition(scrollPosition);
    },
    [
      getEditorStateForProject,
      persistedScrollId,
      persistedScrollType,
      projectId,
      scrollKey,
      scrollViewRef,
    ]
  );

  return React.useCallback(
    () => {
      const scrollView = scrollViewRef.current;
      if (!scrollView || !persistedScrollId) return;
      if (saveScrollTimeoutId.current) {
        clearTimeout(saveScrollTimeoutId.current);
      }

      saveScrollTimeoutId.current = setTimeout(() => {
        const currentEditorState = getEditorStateForProject(projectId);

        setEditorStateForProject(projectId, {
          propertiesPanelScroll: {
            ...currentEditorState?.propertiesPanelScroll,
            [persistedScrollType]: {
              ...currentEditorState?.propertiesPanelScroll[persistedScrollType],
              [persistedScrollId]: scrollView.getScrollPosition(),
            },
          },
        });
      }, saveDebounceTimeInMs);
    },
    [
      getEditorStateForProject,
      persistedScrollId,
      persistedScrollType,
      projectId,
      saveDebounceTimeInMs,
      scrollViewRef,
      setEditorStateForProject,
    ]
  );
};
