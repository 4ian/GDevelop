// @flow
import * as React from 'react';
import PreferencesContext, {
  type EditorStateForPropertyPanel,
} from '../MainFrame/Preferences/PreferencesContext';

type Props = {|
  project: gdProject,
  persistedPanelStateType:
    | 'instances-of-object'
    | 'object'
    | 'scene'
    | 'objectGroup'
    | 'layer',
  persistedPanelStateId: string | null,
  foldedByDefault?: boolean,
|};

export const usePersistedCollapsedSection = ({
  project,
  persistedPanelStateType,
  persistedPanelStateId,
  foldedByDefault,
}: Props): {
  // The default of a section can be given when nothing is persisted for it.
  isSectionFolded: (sectionId: string, foldedByDefault?: boolean) => boolean,
  setSectionFolded: (sectionId: string, isCollapsed: boolean) => void,
  toggleSectionFolded: (sectionId: string, foldedByDefault?: boolean) => void,
} => {
  const {
    getEditorStateForProject,
    setEditorStateForProject,
  } = React.useContext(PreferencesContext);
  const projectId = project.getProjectUuid();

  const isSectionFolded = React.useCallback(
    (sectionId: string, sectionFoldedByDefault?: boolean): boolean => {
      const defaultValue =
        sectionFoldedByDefault === undefined
          ? !!foldedByDefault
          : sectionFoldedByDefault;
      const editorStateForProject = getEditorStateForProject(projectId);
      if (!editorStateForProject || !persistedPanelStateId) return defaultValue;

      const panelStates =
        editorStateForProject.propertiesPanel[persistedPanelStateType];
      const panelState = panelStates
        ? panelStates[persistedPanelStateId]
        : null;
      if (!panelState) return defaultValue;

      const persistedValue = panelState.collapsedSections[sectionId];
      return persistedValue === undefined ? defaultValue : persistedValue;
    },
    [
      getEditorStateForProject,
      persistedPanelStateId,
      persistedPanelStateType,
      projectId,
      foldedByDefault,
    ]
  );

  const setSectionFolded = React.useCallback(
    (sectionId: string, isCollapsed: boolean): void => {
      if (!persistedPanelStateId) return;
      const currentEditorState = getEditorStateForProject(projectId);
      const currentPropertiesPanel = currentEditorState
        ? currentEditorState.propertiesPanel
        : null;
      const currentPanelStates = currentPropertiesPanel
        ? currentPropertiesPanel[persistedPanelStateType]
        : null;
      const currentPanelState = currentPanelStates
        ? currentPanelStates[persistedPanelStateId]
        : null;

      const panelState: EditorStateForPropertyPanel = {
        scrollPosition: 0,
        ...currentPanelState,
        collapsedSections: {
          ...(currentPanelState ? currentPanelState.collapsedSections : null),
          [sectionId]: isCollapsed,
        },
      };

      setEditorStateForProject(projectId, {
        propertiesPanel: {
          ...currentPropertiesPanel,
          [persistedPanelStateType]: {
            ...currentPanelStates,
            [persistedPanelStateId]: panelState,
          },
        },
      });
    },
    [
      getEditorStateForProject,
      persistedPanelStateId,
      persistedPanelStateType,
      projectId,
      setEditorStateForProject,
    ]
  );

  const toggleSectionFolded = React.useCallback(
    (sectionId: string, sectionFoldedByDefault?: boolean) =>
      setSectionFolded(
        sectionId,
        !isSectionFolded(sectionId, sectionFoldedByDefault)
      ),
    [isSectionFolded, setSectionFolded]
  );

  return React.useMemo(
    () => ({ isSectionFolded, setSectionFolded, toggleSectionFolded }),
    [isSectionFolded, setSectionFolded, toggleSectionFolded]
  );
};
