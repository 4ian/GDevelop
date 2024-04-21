// @flow

import * as React from 'react';
import InAppTutorialOrchestrator from './InAppTutorialOrchestrator';
import { type EditorIdentifier } from '../Utils/GDevelopServices/InAppTutorial';
import { type EditorTabsState } from '../MainFrame/EditorTabs/EditorTabsHandler';
import { getCurrentTab } from '../MainFrame/EditorTabs/EditorTabsHandler';

type Props = {|
  editorTabs: EditorTabsState,
|};

const useInAppTutorialOrchestrator = ({ editorTabs }: Props) => {
  const [
    currentEditor,
    setCurrentEditor,
  ] = React.useState<EditorIdentifier | null>(null);
  const [currentSceneName, setCurrentSceneName] = React.useState<string | null>(
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
        : currentTab.key.startsWith('external events')
        ? 'ExternalEvents'
        : currentTab.key.startsWith('external layout')
        ? 'ExternalLayout'
        : currentTab.key.startsWith('events functions extension')
        ? 'Extension'
        : currentTab.key.startsWith('resources')
        ? 'Resources'
        : 'Scene';
      setCurrentEditor(editorIdentifier);
      if (currentTab.key.startsWith('layout') && currentTab.projectItemName) {
        setCurrentSceneName(currentTab.projectItemName);
      }
    },
    [editorTabs]
  );

  return {
    InAppTutorialOrchestrator,
    orchestratorProps: { currentEditor, currentSceneName },
  };
};

export default useInAppTutorialOrchestrator;
