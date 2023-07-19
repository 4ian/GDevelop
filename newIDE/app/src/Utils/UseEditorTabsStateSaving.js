// @flow
import * as React from 'react';

import {
  getEditorTabMetadata,
  type EditorTabsState,
  type EditorOpeningOptions,
  type EditorKind,
  openEditorTab,
  changeCurrentTab,
  isStartPageTabPresent,
  closeAllEditorTabs,
} from '../MainFrame/EditorTabs/EditorTabsHandler';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { useDebounce } from './UseDebounce';

type Props = {|
  editorTabs: EditorTabsState,
  setEditorTabs: EditorTabsState => void,
  currentProjectId: string | null,
  getEditorOpeningOptions: ({
    kind: EditorKind,
    name: string,
    dontFocusTab?: boolean,
  }) => EditorOpeningOptions,
|};

const useEditorTabsStateSaving = ({
  currentProjectId,
  editorTabs,
  getEditorOpeningOptions,
  setEditorTabs,
}: Props) => {
  const {
    setEditorStateForProject,
    getEditorStateForProject,
  } = React.useContext(PreferencesContext);
  const saveEditorState = React.useCallback(
    () => {
      // Do not save the state if the user is on the start page
      if (!currentProjectId || editorTabs.currentTab === 0) return;
      const editorState = {
        currentTab: editorTabs.currentTab,
        editors: editorTabs.editors
          .filter(editor => editor.key !== 'start page')
          .map(getEditorTabMetadata),
      };

      setEditorStateForProject(
        currentProjectId,
        editorState.editors.length === 0
          ? undefined
          : { editorTabs: editorState }
      );
    },
    [currentProjectId, editorTabs, setEditorStateForProject]
  );

  const saveEditorStateDebounced = useDebounce(
    saveEditorState,
    // Debounce should be deactivated when there is currentProjectId.
    // Otherwise, if a project is open and the user switches
    // to the Home tab and then selects another project, this might save the
    // second project tabs state for the first project.
    !!currentProjectId ? 1000 : 0
  );

  React.useEffect(
    () => {
      saveEditorStateDebounced();
    },
    [
      saveEditorStateDebounced,
      currentProjectId,
      editorTabs,
      setEditorStateForProject,
    ]
  );

  const hasARecordForEditorTabs = React.useCallback(
    (project: gdProject) => {
      const projectId = project.getProjectUuid();
      return !!getEditorStateForProject(projectId);
    },
    [getEditorStateForProject]
  );

  const openEditorsAccordingToPersistedState = React.useCallback(
    (project: gdProject) => {
      const projectId = project.getProjectUuid();
      const editorState = getEditorStateForProject(projectId);
      if (!editorState) return;
      const editorsOpeningOptions = editorState.editorTabs.editors.map(
        editorMetadata =>
          getEditorOpeningOptions({
            kind: editorMetadata.editorKind,
            name: editorMetadata.projectItemName || '',
            dontFocusTab: true,
          })
      );

      // Close all current tabs
      let newEditorTabs = closeAllEditorTabs(editorTabs);

      // Always make sure the start page is included in the new editor tabs
      if (!isStartPageTabPresent(newEditorTabs)) {
        newEditorTabs = openEditorTab(
          newEditorTabs,
          getEditorOpeningOptions({
            kind: 'start page',
            name: '',
          })
        );
      }

      for (const editorOpeningOption of editorsOpeningOptions) {
        newEditorTabs = openEditorTab(newEditorTabs, editorOpeningOption);
      }
      newEditorTabs = changeCurrentTab(
        newEditorTabs,
        editorState.editorTabs.currentTab
      );
      setEditorTabs(newEditorTabs);
    },
    [
      getEditorOpeningOptions,
      setEditorTabs,
      editorTabs,
      getEditorStateForProject,
    ]
  );

  return {
    hasARecordForEditorTabs,
    openEditorsAccordingToPersistedState,
  };
};

export default useEditorTabsStateSaving;
