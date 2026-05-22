// @flow
import * as React from 'react';
import PreferencesContext from '../Preferences/PreferencesContext';
import { runNpmScript } from '../../Utils/NpmScriptExecutor';
import type {
  ToolbarButtonConfig,
  ToolbarButtonHooksNames,
} from '../CustomToolbarButton';
import NpmScriptConfirmDialog from './NpmScriptConfirmDialog';
import { getProjectDirectory } from '../../Utils/ProjectSettingsReader';

type Props = {|
  toolbarButtons: Array<ToolbarButtonConfig>,
  fileIdentifier: ?string,
  /**
   * Number of currently active non-edition preview windows, derived from
   * debugger connections. Note: hook callbacks fire *after* the preview window
   * connects (post-launch), not before the launch begins.
   */
  previewCount: number,
|};

export type TriggerNpmScript = (
  npmScript: string,
  keepTerminalOpen?: boolean
) => void;

type ReturnType = {|
  triggerNpmScript: TriggerNpmScript,
  renderNpmScriptConfirmDialog: () => React.Node,
  projectPath: ?string,
|};

type ScriptEntry = {| script: string, keepTerminalOpen: boolean |};

const getScriptsByHookName = (
  toolbarButtons: Array<ToolbarButtonConfig>,
  hookName: ToolbarButtonHooksNames
): Array<ScriptEntry> => {
  return toolbarButtons.reduce((entries, btn) => {
    if (btn.hook === hookName)
      entries.push({
        script: btn.npmScript,
        keepTerminalOpen: btn.keepTerminalOpen === true,
      });
    return entries;
  }, []);
};

/**
 * Manages both manual toolbar button clicks and automatic editor lifecycle
 * hooks (onEditorReady, onPreviewStart, onPreviewEnd) through a single
 * confirmation dialog. Reads lifecycle state from EditorLifecycleContext.
 */
const useNpmScriptRunner = ({
  toolbarButtons,
  fileIdentifier,
  previewCount,
}: Props): ReturnType => {
  const projectPath = React.useMemo(
    () => (fileIdentifier ? getProjectDirectory(fileIdentifier) : null),
    [fileIdentifier]
  );

  const isEditorReady = !!projectPath && toolbarButtons.length > 0;
  const {
    values: { disableNpmScriptConfirmation },
    setDisableNpmScriptConfirmation,
  } = React.useContext(PreferencesContext);

  const prevPreviewCountRef = React.useRef(0);

  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [pending, setPending] = React.useState<{|
    entries: Array<ScriptEntry>,
    path: string,
    hookName?: ToolbarButtonHooksNames,
  |} | null>(null);

  const scheduleOrRun = React.useCallback(
    (
      entries: Array<ScriptEntry>,
      path: string,
      hookName?: ToolbarButtonHooksNames
    ) => {
      if (!entries.length) return;
      if (!disableNpmScriptConfirmation) {
        setPending({ entries, path, hookName });
        setConfirmDialogOpen(true);
        return;
      }
      entries.forEach(e => runNpmScript(path, e.script, e.keepTerminalOpen));
    },
    [disableNpmScriptConfirmation]
  );

  const scheduleOrRunRef = React.useRef(scheduleOrRun);
  scheduleOrRunRef.current = scheduleOrRun;

  const callHook = React.useCallback(
    (hookName: ToolbarButtonHooksNames) => {
      if (!projectPath) return;
      const entries = getScriptsByHookName(toolbarButtons, hookName);
      scheduleOrRunRef.current(entries, projectPath, hookName);
    },
    [toolbarButtons, projectPath]
  );

  const triggerNpmScript = React.useCallback(
    (npmScript: string, keepTerminalOpen?: boolean) => {
      if (!projectPath) return;
      scheduleOrRunRef.current(
        [{ script: npmScript, keepTerminalOpen: keepTerminalOpen === true }],
        projectPath
      );
    },
    [projectPath]
  );

  const handleConfirm = React.useCallback(
    (dontShowAgain: boolean) => {
      setConfirmDialogOpen(false);
      if (dontShowAgain) setDisableNpmScriptConfirmation(true);
      if (pending) {
        pending.entries.forEach(e =>
          runNpmScript(pending.path, e.script, e.keepTerminalOpen)
        );
      }
      setPending(null);
    },
    [pending, setDisableNpmScriptConfirmation]
  );

  const handleDismiss = React.useCallback(() => {
    setConfirmDialogOpen(false);
    setPending(null);
  }, []);

  React.useEffect(
    () => {
      if (isEditorReady) callHook('onEditorReady');
    },
    [callHook, isEditorReady]
  );

  React.useEffect(
    () => {
      const prev = prevPreviewCountRef.current;
      if (previewCount > prev) {
        callHook('onPreviewStart');
      } else if (previewCount < prev) {
        callHook('onPreviewEnd');
      }
      prevPreviewCountRef.current = previewCount;
    },
    [callHook, previewCount]
  );

  const isAutoRun = !!(pending && pending.hookName);
  const scriptNames = pending
    ? pending.entries.map(e => e.script).join(', ')
    : toolbarButtons.map(b => b.npmScript).join(', ');
  const callingHookName =
    pending && pending.hookName ? pending.hookName : undefined;

  const renderNpmScriptConfirmDialog = React.useCallback(
    () => (
      <NpmScriptConfirmDialog
        open={confirmDialogOpen}
        scriptNames={scriptNames}
        hookName={callingHookName}
        onConfirm={handleConfirm}
        onDismiss={handleDismiss}
        isAutoRun={isAutoRun}
      />
    ),
    [
      confirmDialogOpen,
      scriptNames,
      callingHookName,
      handleConfirm,
      handleDismiss,
      isAutoRun,
    ]
  );

  return {
    triggerNpmScript,
    renderNpmScriptConfirmDialog,
    projectPath,
  };
};

export default useNpmScriptRunner;
