// @flow
import * as React from 'react';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';

type Props = {|
  project: gdProject,
  persistedScrollType:
    | 'instances-of-object'
    | 'object'
    | 'scene'
    | 'objectGroup'
    | 'layer',
  persistedScrollId: string | null,
|};

export const usePersistedCollapsedSection = ({
  project,
  persistedScrollType,
  persistedScrollId,
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
      if (!editorStateForProject || !persistedScrollId) return false;

      return editorStateForProject.propertiesPanel[persistedScrollType]?.[
        persistedScrollId
      ]?.collapsedSections[sectionId];
    },
    [
      getEditorStateForProject,
      persistedScrollId,
      persistedScrollType,
      projectId,
    ]
  );

  const setSectionFolded = React.useCallback(
    (sectionId: string, isCollapsed: boolean): void => {
      if (!persistedScrollId) return;

      const currentEditorState = getEditorStateForProject(projectId);
      setEditorStateForProject(projectId, {
        propertiesPanel: {
          ...currentEditorState?.propertiesPanel,
          [persistedScrollType]: {
            ...currentEditorState?.propertiesPanel[persistedScrollType],
            [persistedScrollId]: {
              ...currentEditorState?.propertiesPanel[persistedScrollType]?.[
                persistedScrollId
              ],
              collapsedSections: {
                ...currentEditorState?.propertiesPanel[persistedScrollType]?.[
                  persistedScrollId
                ]?.collapsedSections,
                [sectionId]: isCollapsed,
              },
            },
          },
        },
      });
    },
    [
      getEditorStateForProject,
      persistedScrollId,
      persistedScrollType,
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
