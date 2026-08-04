// @flow
import * as React from 'react';
import PoppedOutEditorContainerWindow from './PoppedOutEditorContainerWindow';
import {
  getExternalEditors,
  type EditorTab,
} from './EditorTabs/EditorTabsHandler';
import { type EditorTabsPaneCommonProps } from './EditorTabsPane';
import CommandsContextWindowProvider from '../CommandPalette/CommandsWindowContext';

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
        // Give each popped out window its own command manager, so that the
        // commands registered by its editor stay in this window: a keyboard
        // shortcut must always run the command of the window where it was
        // pressed, and not the one of another window.
        <CommandsContextWindowProvider key={`external-${editorTab.key}`}>
          <PoppedOutEditorContainerWindow
            editorTab={editorTab}
            onClose={onClose}
            onPopIn={onPopIn}
            {...sharedProps}
          />
        </CommandsContextWindowProvider>
      ))}
    </>
  );
};

export default PoppedOutWindows;
