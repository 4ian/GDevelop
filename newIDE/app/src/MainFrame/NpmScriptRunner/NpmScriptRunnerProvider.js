// @flow
import type { ToolbarButtonConfig } from '../CustomToolbarButton';
import type { TriggerNpmScript } from './useNpmScriptRunner';

import NpmScriptConfirmDialog from './NpmScriptConfirmDialog';
import useNpmScriptRunner from './useNpmScriptRunner';

import * as React from 'react';

type NpmScriptRunnerContextValue = {|
  triggerNpmScript: TriggerNpmScript,
|};

const defaultNpmScriptRunnerContextValue: NpmScriptRunnerContextValue = {
  triggerNpmScript: () => {},
};

const NpmScriptRunnerContext = React.createContext<NpmScriptRunnerContextValue>(
  defaultNpmScriptRunnerContextValue
);

export const useNpmScriptRunnerContext = (): NpmScriptRunnerContextValue =>
  React.useContext(NpmScriptRunnerContext);

type NpmScriptRunnerProviderProps = {|
  hasPreviewsRunning: boolean,
  children: React.Node,
  toolbarButtons: Array<ToolbarButtonConfig>,
  projectPath: ?string,
|};

const NpmScriptRunnerProvider: React.ComponentType<NpmScriptRunnerProviderProps> = React.memo(
  ({
    hasPreviewsRunning,
    children,
    toolbarButtons,
    projectPath,
  }: NpmScriptRunnerProviderProps): React.Node => {
    const {
      triggerNpmScript,
      handleDismiss,
      handleConfirm,
      confirmDialogOpen,
      scriptNames,
      callingHookName,
      isAutoRun,
    } = useNpmScriptRunner({
      toolbarButtons,
      projectPath,
      hasPreviewsRunning,
    });

    const npmScriptRunnerContextValue = React.useMemo(
      () => ({ triggerNpmScript }),
      [triggerNpmScript]
    );

    return (
      <NpmScriptRunnerContext.Provider value={npmScriptRunnerContextValue}>
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
