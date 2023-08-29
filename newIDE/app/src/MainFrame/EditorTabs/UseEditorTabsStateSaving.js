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
} from './EditorTabsHandler';
import PreferencesContext from '../Preferences/PreferencesContext';
import { useDebounce } from '../../Utils/UseDebounce';

type Props = {|
  editorTabs: EditorTabsState,
  setEditorTabs: EditorTabsState => void,
  currentProjectId: string | null,
  getEditorOpeningOptions: ({|
    kind: EditorKind,
    name: string,
    dontFocusTab?: boolean,
  |}) => EditorOpeningOptions,
|};

const projectHasItem = ({
  project,
  kind,
  name,
}: {|
  project: gdProject,
  kind: EditorKind,
  name: string,
|}) => {
  if (['debugger', 'start page', 'resources'].includes(kind)) return true;
  switch (kind) {
    case 'events functions extension':
      return project.hasEventsFunctionsExtensionNamed(name);
    case 'layout':
      return project.hasLayoutNamed(name);
    case 'layout events':
      return project.hasLayoutNamed(name);
    case 'external layout':
      return project.hasExternalLayoutNamed(name);
    case 'external events':
      return project.hasExternalEventsNamed(name);
    default:
      return false;
  }
};

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
    // Debounce should be deactivated when currentProjectId is null.
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

  const hasAPreviousSaveForEditorTabsState = React.useCallback(
    (project: gdProject) => {
      const projectId = project.getProjectUuid();
      return !!getEditorStateForProject(projectId);
    },
    [getEditorStateForProject]
  );

  const openEditorTabsFromPersistedState = React.useCallback(
    (project: gdProject): number => {
      const projectId = project.getProjectUuid();
      const editorState = getEditorStateForProject(projectId);
      if (!editorState) return 0;
      let shouldOpenSavedCurrentTab = true;

      const editorsOpeningOptions = editorState.editorTabs.editors
        .map(editorMetadata => {
          if (
            projectHasItem({
              project,
              kind: editorMetadata.editorKind,
              name: editorMetadata.projectItemName || '',
            })
          ) {
            return getEditorOpeningOptions({
              kind: editorMetadata.editorKind,
              name: editorMetadata.projectItemName || '',
              dontFocusTab: true,
            });
          }
          // If the project does not contain the target item (it could happen if
          // the user opens an old version of the project that did not have a scene
          // for instance), the currentTab will surely be outdated so we don't use it.
          shouldOpenSavedCurrentTab = false;
          return null;
        })
        .filter(Boolean);

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
        shouldOpenSavedCurrentTab
          ? editorState.editorTabs.currentTab
          : newEditorTabs.editors.length >= 1
          ? 1
          : 0
      );
      setEditorTabs(newEditorTabs);
      return editorsOpeningOptions.length;
    },
    [
      getEditorOpeningOptions,
      setEditorTabs,
      editorTabs,
      getEditorStateForProject,
    ]
  );

  return {
    hasAPreviousSaveForEditorTabsState,
    openEditorTabsFromPersistedState,
  };
};

export default useEditorTabsStateSaving;
