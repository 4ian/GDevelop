// @flow
import * as React from 'react';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';

type Props = {|
  project: gdProject,
  persistedPanelStateType:
    | 'instances-of-object'
    | 'object'
    | 'scene'
    | 'objectGroup'
    | 'layer',
  persistedPanelStateId: string | null,
|};

export const usePersistedCollapsedSection = ({
  project,
  persistedPanelStateType,
  persistedPanelStateId,
}: Props): {
  isSectionFolded: (sectionId: string) => boolean,
  setSectionFolded: (sectionId: string, isCollapsed: boolean) => void,
  toggleSectionFolded: (sectionId: string) => void,
} => {
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

  const isSectionFolded = React.useCallback(
    (sectionId: string): boolean => {
      const editorStateForProject = getEditorStateForProject(projectId);
      if (!editorStateForProject || !persistedPanelStateId) return false;

      return editorStateForProject.propertiesPanel[persistedPanelStateType]?.[
        persistedPanelStateId
      ]?.collapsedSections[sectionId];
    },
    [
      getEditorStateForProject,
      persistedPanelStateId,
      persistedPanelStateType,
      projectId,
    ]
  );

  const setSectionFolded = React.useCallback(
    (sectionId: string, isCollapsed: boolean): void => {
      if (!persistedPanelStateId) return;

      const currentEditorState = getEditorStateForProject(projectId);
      setEditorStateForProject(projectId, {
        propertiesPanel: {
          ...currentEditorState?.propertiesPanel,
          [persistedPanelStateType]: {
            ...currentEditorState?.propertiesPanel[persistedPanelStateType],
            [persistedPanelStateId]: {
              ...currentEditorState?.propertiesPanel[persistedPanelStateType]?.[
                persistedPanelStateId
              ],
              collapsedSections: {
                ...currentEditorState?.propertiesPanel[
                  persistedPanelStateType
                ]?.[persistedPanelStateId]?.collapsedSections,
                [sectionId]: isCollapsed,
              },
            },
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
    (sectionId: string) =>
      setSectionFolded(sectionId, !isSectionFolded(sectionId)),
    [isSectionFolded, setSectionFolded]
  );

  return React.useMemo(
    () => ({ isSectionFolded, setSectionFolded, toggleSectionFolded }),
    [isSectionFolded, setSectionFolded, toggleSectionFolded]
  );
};
