// @flow
import type { ToolbarButtonConfig } from '../CustomToolbarButton';
import type { HandleCustomButtonClick } from './useNpmScriptRunner';

import NpmScriptConfirmDialog from './NpmScriptConfirmDialog';
import useNpmScriptRunner from './useNpmScriptRunner';

import * as React from 'react';

export type EditorLifecycleState = {|
  isEditorReady: boolean,
  hasPreviewsRunning: boolean,
|};

const defaultNpmScriptButtonHandler: HandleCustomButtonClick = () => {};

const NpmScriptRunnerContext = React.createContext<HandleCustomButtonClick>(
  defaultNpmScriptButtonHandler
);

export const useNpmScriptButtonHandler = (): HandleCustomButtonClick =>
  React.useContext(NpmScriptRunnerContext);

type NpmScriptRunnerProviderProps = {|
  isEditorReady: boolean,
  hasPreviewsRunning: boolean,
  children: React.Node,
  toolbarButtons: Array<ToolbarButtonConfig>,
  projectPath: ?string,
|};

const NpmScriptRunnerProvider: React.ComponentType<NpmScriptRunnerProviderProps> = React.memo(
  ({
    isEditorReady,
    hasPreviewsRunning,
    children,
    toolbarButtons,
    projectPath,
  }: NpmScriptRunnerProviderProps): React.Node => {
    const {
      handleCustomButtonClick,
      handleDismiss,
      handleConfirm,
      confirmDialogOpen,
      scriptNames,
      callingHookName,
      isAutoRun,
    } = useNpmScriptRunner({
      toolbarButtons,
      projectPath,
      isEditorReady,
      hasPreviewsRunning,
    });

    return (
      <NpmScriptRunnerContext.Provider value={handleCustomButtonClick}>
        <NpmScriptConfirmDialog
          open={confirmDialogOpen}
          scriptNames={scriptNames}
          hookName={callingHookName}
          onConfirm={handleConfirm}
          onDismiss={handleDismiss}
          isAutoRun={isAutoRun}
        />
        {children}
      </NpmScriptRunnerContext.Provider>
    );
  }
);

export default NpmScriptRunnerProvider;
