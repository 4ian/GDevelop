// @flow
import * as React from 'react';
import PreferencesContext from '../Preferences/PreferencesContext';
import { runNpmScript } from '../../Utils/NpmScriptExecutor';
import type {
  ToolbarButtonConfig,
  ToolbarButtonHooksNames,
} from '../CustomToolbarButton';
import NpmScriptConfirmDialog from './NpmScriptConfirmDialog';

type Props = {|
  toolbarButtons: Array<ToolbarButtonConfig>,
  projectPath: ?string,
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
  projectPath,
  previewCount,
}: Props): ReturnType => {
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

  const callHook = React.useCallback(
    (hookName: ToolbarButtonHooksNames) => {
      if (!projectPath) return;
      const scripts = getScriptsByHookName(toolbarButtons, hookName);
      scheduleOrRun(scripts, projectPath, hookName);
    },
    [toolbarButtons, projectPath, scheduleOrRun]
  );

  const triggerNpmScript = React.useCallback(
    (npmScript: string) => {
      if (!projectPath) return;
      scheduleOrRun([npmScript], projectPath);
    },
    [projectPath, scheduleOrRun]
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
    // `callHook` is intentionally omitted from deps: including it would re-fire
    // the hook on every render where `toolbarButtons` or `projectPath` change,
    // while we only want a single fire on the `isEditorReady` true→true transition
    // (i.e. when the project finishes loading). The stable identity of `callHook`
    // is not required here — only the `isEditorReady` value drives the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEditorReady]
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
    // `callHook` is intentionally omitted: we only want to react to changes in
    // `previewCount` (each window open/close), not to toolbar config updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previewCount]
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
  };
};

export default useNpmScriptRunner;
