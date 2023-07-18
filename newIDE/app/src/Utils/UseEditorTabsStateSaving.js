// @flow
import * as React from 'react';

import {
  getEditorTabMetadata,
  type EditorTabsState,
  type EditorOpeningOptions,
  type EditorKind,
} from '../MainFrame/EditorTabs/EditorTabsHandler';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { useDebounce } from './UseDebounce';

type Props = {|
  editorTabs: EditorTabsState,
  projectId: string | null,
  getEditorOpeningOptions: (
    kind: EditorKind,
    name: string
  ) => EditorOpeningOptions,
|};

const useEditorTabsStateSaving = ({
  projectId,
  editorTabs,
  getEditorOpeningOptions,
}: Props) => {
  const {
    setEditorStateForProject,
    getEditorStateForProject,
  } = React.useContext(PreferencesContext);
  const saveEditorState = React.useCallback(
    () => {
      if (!projectId) return;
      const editorState = {
        currentTab: editorTabs.currentTab,
        editors: editorTabs.editors
          .filter(editor => editor.key !== 'start page')
          .map(getEditorTabMetadata),
      };

      setEditorStateForProject(
        projectId,
        editorState.editors.length === 0
          ? undefined
          : { editorTabs: editorState }
      );
    },
    [projectId, editorTabs, setEditorStateForProject]
  );

  const saveEditorStateDebounced = useDebounce(saveEditorState, 1000);

  React.useEffect(
    () => {
      saveEditorStateDebounced();
    },
    [saveEditorStateDebounced, projectId, editorTabs, setEditorStateForProject]
  );

  const openEditorsAccordingToPersistedState = React.useCallback(
    () => {
      if (!projectId) return;
      const editorState = getEditorStateForProject(projectId);
      if (!editorState) return;
      const editorsOpeningOptions = editorState.editorTabs.editors.map(
        editorMetadata =>
          getEditorOpeningOptions(
            editorMetadata.editorKind,
            editorMetadata.projectItemName || ''
          )
      );
    },
    [getEditorOpeningOptions, projectId]
  );
};

export default useEditorTabsStateSaving;
