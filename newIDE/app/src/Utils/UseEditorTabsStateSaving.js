// @flow
import * as React from 'react';

import {
  getEditorTabMetadata,
  type EditorTabsState,
} from '../MainFrame/EditorTabs/EditorTabsHandler';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { useDebounce } from './UseDebounce';

type Props = {|
  editorTabs: EditorTabsState,
  projectId: string | null,
|};

const useEditorTabsStateSaving = ({ projectId, editorTabs }: Props) => {
  const { setEditorStateForProject } = React.useContext(PreferencesContext);
  const saveEditorState = React.useCallback(
    () => {
      if (!projectId) return;
      const editorState = {
        currentTab: editorTabs.currentTab,
        editors: editorTabs.editors
          .filter(editor => editor.key !== 'start page')
          .map(getEditorTabMetadata),
      };
      setEditorStateForProject(projectId, { editorTabs: editorState });
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
};

export default useEditorTabsStateSaving;
