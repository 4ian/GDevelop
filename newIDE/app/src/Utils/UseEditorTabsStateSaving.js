// @flow
import * as React from 'react';

import {
  getEditorTabMetadata,
  type EditorTabsState,
} from '../MainFrame/EditorTabs/EditorTabsHandler';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';

type Props = {|
  editorTabs: EditorTabsState,
  projectId: string | null,
|};

const useEditorTabsStateSaving = ({ projectId, editorTabs }: Props) => {
  const { setEditorStateForProject } = React.useContext(PreferencesContext);
  React.useEffect(
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
};

export default useEditorTabsStateSaving;
