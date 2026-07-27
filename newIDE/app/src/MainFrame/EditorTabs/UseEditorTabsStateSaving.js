// @flow
import * as React from 'react';

import {
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
import {
  parseCustomObjectEditorTabName,
  getObjectTypeFromCustomObjectEditorTabName,
} from '../../Utils/CustomObjectEditorTabName';

type Props = {|
  editorTabs: EditorTabsState,
  setEditorTabs: EditorTabsState => void,
  currentProjectId: string | null,
  getEditorOpeningOptions: ({|
    kind: EditorKind,
    name: string,
    dontFocusTab?: boolean,
    project?: ?gdProject,
    paneIdentifier?: 'left' | 'center' | 'right',
    continueProcessingFunctionCallsOnMount?: boolean,
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
  if (['debugger', 'start page', 'resources', 'global-search'].includes(kind))
    return true;
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
    case 'custom object':
      const objectType = getObjectTypeFromCustomObjectEditorTabName(name);
      const variantName = parseCustomObjectEditorTabName(name).variantName;
      return (
        project.hasEventsBasedObject(objectType) &&
        (!variantName ||
          project
            .getEventsBasedObject(objectType)
            .getVariants()
            .getVariant(variantName))
      );
    default:
      return false;
  }
};

const useEditorTabsStateSaving = ({
  currentProjectId,
  editorTabs,
  getEditorOpeningOptions,
  setEditorTabs,
}: Props): {
  hasAPreviousSaveForEditorTabsState: (project: gdProject) => boolean,
  openEditorTabsFromPersistedState: (project: gdProject) => number,
} => {
  const {
    setEditorStateForProject,
    getEditorStateForProject,
  } = React.useContext(PreferencesContext);
  const saveEditorState = React.useCallback(
    () => {
      // TODO: adapt for saving multiple panes.
      if (!currentProjectId) return;
      const editors = editorTabs.panes.center.editors
        .filter(editor => editor.key !== 'start page')
        .map(editor => ({
          projectItemName: editor.projectItemName,
          editorKind: editor.kind,
        }));
      // The start page tab can't be closed, so having no other tab also means
      // that the project is being opened (its tabs are not restored yet) or
      // closed. Saving then would overwrite the state about to be restored.
      if (editors.length === 0) return;

      setEditorStateForProject(currentProjectId, {
        editorTabs: {
          currentTab: editorTabs.panes.center.currentTab,
          editors,
        },
      });
    },
    [currentProjectId, editorTabs, setEditorStateForProject]
  );

  const saveEditorStateDebounced = useDebounce(saveEditorState, 1000);

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

  const saveEditorStateRef = React.useRef(saveEditorState);
  React.useEffect(() => {
    saveEditorStateRef.current = saveEditorState;
  });

  React.useEffect(
    () => {
      // Save the changes still pending in the debounce before the project
      // changes: they belong to the project being left, and the debounced call
      // would otherwise run (or be dropped) once it's too late to know that.
      return () => saveEditorStateRef.current();
    },
    [currentProjectId]
  );

  const hasAPreviousSaveForEditorTabsState = React.useCallback(
    (project: gdProject) => {
      const projectId = project.getProjectUuid();
      const editorState = getEditorStateForProject(projectId);
      return !!(editorState && editorState.editorTabs);
    },
    [getEditorStateForProject]
  );

  const openEditorTabsFromPersistedState = React.useCallback(
    (project: gdProject): number => {
      const projectId = project.getProjectUuid();
      const editorState = getEditorStateForProject(projectId);
      if (!editorState || !editorState.editorTabs) return 0;
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
              project,
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
        'center',
        shouldOpenSavedCurrentTab && editorState.editorTabs
          ? editorState.editorTabs.currentTab
          : newEditorTabs.panes.center.editors.length >= 1
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
