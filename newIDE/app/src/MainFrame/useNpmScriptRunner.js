// @flow
import * as React from 'react';
import PreferencesContext from './Preferences/PreferencesContext';
import { runNpmScript } from '../Utils/NpmScriptExecutor';
import type {
  ToolbarButtonConfig,
  ToolbarButtonHooksNames,
} from './CustomToolbarButton';

type Props = {|
  toolbarButtons: Array<ToolbarButtonConfig>,
  projectPath: ?string,
  isEditorReady: boolean,
  hasPreviewsRunning: boolean,
|};

export type HandleCustomButtonClick = (npmScript: string) => void;

type ReturnType = {|
  handleCustomButtonClick: HandleCustomButtonClick,
  confirmDialogOpen: boolean,
  scriptNames: string,
  callingHookName?: ToolbarButtonHooksNames,
  isAutoRun: boolean,
  handleDismiss: () => void,
  handleConfirm: (dontShowAgain: boolean) => void,
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
  isEditorReady,
  hasPreviewsRunning,
}: Props): ReturnType => {
  const {
    values: { disableNpmScriptConfirmation },
    setDisableNpmScriptConfirmation,
  } = React.useContext(PreferencesContext);

  const prevHasPreviewsRunningRef = React.useRef(false);

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

  const handleCustomButtonClick = React.useCallback(
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
      if (prevHasPreviewsRunningRef.current && !hasPreviewsRunning) {
        callHook('onPreviewEnd');
      }
      if (!prevHasPreviewsRunningRef.current && hasPreviewsRunning) {
        callHook('onPreviewStart');
      }
      prevHasPreviewsRunningRef.current = hasPreviewsRunning;
    },
    // Same reasoning as above: `callHook` is omitted so the effect only runs
    // when `hasPreviewsRunning` actually changes (start/stop edge), not on every
    // re-render caused by unrelated toolbar config updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasPreviewsRunning]
  );

  const isAutoRun = !!(pending && pending.hookName);
  const scriptNames = pending
    ? pending.scripts.join(', ')
    : toolbarButtons.map(b => b.npmScript).join(', ');
  const callingHookName =
    pending && pending.hookName ? pending.hookName : undefined;

  return {
    handleCustomButtonClick,
    confirmDialogOpen,
    scriptNames,
    callingHookName,
    isAutoRun,
    handleDismiss,
    handleConfirm,
  };
};

export default useNpmScriptRunner;
