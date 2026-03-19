// @flow
import * as React from 'react';
import ExternalEditorWindow from './ExternalEditorWindow';
import {
  getExternalEditors,
  type EditorTab,
} from './EditorTabs/EditorTabsHandler';
import { type EditorTabsPaneCommonProps } from './EditorTabsPane';

type Props = {|
  ...EditorTabsPaneCommonProps,
  onClose: (editorTab: EditorTab) => void,
  onPopIn: (editorTab: EditorTab) => void,
|};

const ExternalEditorWindows = (props: Props): React.Node => {
  const { onClose, onPopIn, ...sharedProps } = props;
  const externalEditors = getExternalEditors(props.editorTabs);

  if (externalEditors.length === 0) return null;

  return (
    <>
      {externalEditors.map(editorTab => (
        <ExternalEditorWindow
          key={`external-${editorTab.key}`}
          editorTab={editorTab}
          onClose={onClose}
          onPopIn={onPopIn}
          {...sharedProps}
        />
      ))}
    </>
  );
};

export default ExternalEditorWindows;
