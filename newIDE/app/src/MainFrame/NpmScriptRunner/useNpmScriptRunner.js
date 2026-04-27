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

export type TriggerNpmScript = (npmScript: string) => void;

type ReturnType = {|
  triggerNpmScript: TriggerNpmScript,
  renderNpmScriptConfirmDialog: () => React.Node,
  projectPath: ?string,
|};

const getScriptsByHookName = (
  toolbarButtons: Array<ToolbarButtonConfig>,
  hookName: ToolbarButtonHooksNames
): Array<string> => {
  return toolbarButtons.reduce((scripts, btn) => {
    if (btn.hook === hookName) scripts.push(btn.npmScript);
    return scripts;
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
    scripts: Array<string>,
    path: string,
    hookName?: ToolbarButtonHooksNames,
  |} | null>(null);

  const scheduleOrRun = React.useCallback(
    (
      scripts: Array<string>,
      path: string,
      hookName?: ToolbarButtonHooksNames
    ) => {
      if (!scripts.length) return;
      if (!disableNpmScriptConfirmation) {
        setPending({ scripts, path, hookName });
        setConfirmDialogOpen(true);
        return;
      }
      scripts.forEach(s => runNpmScript(path, s));
    },
    [disableNpmScriptConfirmation]
  );

  const scheduleOrRunRef = React.useRef(scheduleOrRun);
  scheduleOrRunRef.current = scheduleOrRun;

  const callHook = React.useCallback(
    (hookName: ToolbarButtonHooksNames) => {
      if (!projectPath) return;
      const scripts = getScriptsByHookName(toolbarButtons, hookName);
      scheduleOrRunRef.current(scripts, projectPath, hookName);
    },
    [toolbarButtons, projectPath]
  );

  const triggerNpmScript = React.useCallback(
    (npmScript: string) => {
      if (!projectPath) return;
      scheduleOrRunRef.current([npmScript], projectPath);
    },
    [projectPath]
  );

  const handleConfirm = React.useCallback(
    (dontShowAgain: boolean) => {
      setConfirmDialogOpen(false);
      if (dontShowAgain) setDisableNpmScriptConfirmation(true);
      if (pending) {
        pending.scripts.forEach(s => runNpmScript(pending.path, s));
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
    ? pending.scripts.join(', ')
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
