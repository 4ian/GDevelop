// @flow
import * as React from 'react';
import { getExternalEditors, type EditorTab } from './EditorTabs/EditorTabsHandler';
import type { EditorTabsPaneCommonProps } from './EditorTabsPane';
import ExternalEditorWindow from './ExternalEditorWindow';

type Props = {|
  onClose: (editorTab: EditorTab) => void,
  onPopIn: (editorTab: EditorTab) => void,
  commonProps: EditorTabsPaneCommonProps,
|};

/**
 * Renders all editors that have been popped out into external windows.
 * Each tab in the 'external' pane gets its own ExternalEditorWindow.
 */
const ExternalEditorWindows = ({
  onClose,
  onPopIn,
  commonProps,
}: Props): React.Node => {
  const externalEditors = getExternalEditors(commonProps.editorTabs);

  if (externalEditors.length === 0) return null;

  return (
    <>
      {externalEditors.map(editorTab => (
        <ExternalEditorWindow
          key={editorTab.key}
          editorTab={editorTab}
          onClose={onClose}
          onPopIn={onPopIn}
          commonProps={commonProps}
        />
      ))}
    </>
  );
};

export default ExternalEditorWindows;
