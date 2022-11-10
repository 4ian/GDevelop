// @flow

import * as React from 'react';
import InAppTutorialOrchestrator from './InAppTutorialOrchestrator';
import { type EditorIdentifier } from './InAppTutorialContext';
import { type EditorTabsState } from '../MainFrame/EditorTabs/EditorTabsHandler';
import { getCurrentTab } from '../MainFrame/EditorTabs/EditorTabsHandler';

type Props = {|
  editorTabs: EditorTabsState,
|};

const useInAppTutorialOrchestrator = ({ editorTabs }: Props) => {
  const [currentEditor, setCurrentEditor] = React.useState<EditorIdentifier | null>(
    null
  );

  React.useEffect(
    () => {
      const currentTab = getCurrentTab(editorTabs);
      if (!currentTab) {
        setCurrentEditor(null);
        return;
      }
      const editorIdentifier = currentTab.key.startsWith('start page')
        ? 'Home'
        : currentTab.key.startsWith('layout event')
        ? 'EventsSheet'
        : 'Scene';
      setCurrentEditor(editorIdentifier);
    },
    [editorTabs]
  );

  return {
    InAppTutorialOrchestrator,
    orchestratorProps: { currentEditor },
  };
};

export default useInAppTutorialOrchestrator;
