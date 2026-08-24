// @flow
import * as React from 'react';
import PoppedOutEditorContainerWindow from './PoppedOutEditorContainerWindow';
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

const PoppedOutWindows = (props: Props): React.Node => {
  const { onClose, onPopIn, ...sharedProps } = props;
  const externalEditors = getExternalEditors(props.editorTabs);

  if (externalEditors.length === 0) return null;

  return (
    <>
      {externalEditors.map(editorTab => (
        <PoppedOutEditorContainerWindow
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

export default PoppedOutWindows;
