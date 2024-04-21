// @flow
import * as React from 'react';
import optionalRequire from '../Utils/OptionalRequire';
import { useCommandWithOptions } from '../CommandPalette/CommandHooks';
import {
  buildMainMenuDeclarativeTemplate,
  type BuildMainMenuProps,
  type MainMenuCallbacks,
  type MainMenuExtraCallbacks,
  type MainMenuEvent,
} from './MainMenu';
import PreferencesContext from './Preferences/PreferencesContext';
const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

// Custom hook to register and deregister IPC listener
const useIPCEventListener = ({
  ipcEvent,
  callback,
  shouldApply,
}: {
  ipcEvent: MainMenuEvent,
  callback: Function,
  shouldApply: boolean,
}) => {
  React.useEffect(
    () => {
      if (!ipcRenderer || !shouldApply) return;

      const handler = (event, ...eventArgs) => callback(...eventArgs);
      ipcRenderer.on(ipcEvent, handler);
      return () => ipcRenderer.removeListener(ipcEvent, handler);
    },
    [ipcEvent, callback, shouldApply]
  );
};

const useAppEventListener = ({
  event,
  callback,
}: {
  event: string,
  callback: Function,
}) => {
  React.useEffect(
    () => {
      if (!app) return;
      const handler = (event, ...eventArgs) => callback(...eventArgs);
      app.on(event, handler);
      return () => app.removeListener(event, handler);
    },
    [event, callback]
  );
};

const isMainWindow = (windowTitle: string): boolean => {
  if (!windowTitle) return false;
  const lowercaseTitle = windowTitle.toLowerCase();
  return (
    lowercaseTitle.startsWith('gdevelop') &&
    lowercaseTitle !== 'gdevelop dialogue tree editor (yarn)' &&
    lowercaseTitle !== 'gdevelop sound effects editor (jfxr)' &&
    lowercaseTitle !== 'gdevelop image editor (piskel)'
  );
};

/**
 * Create and update the editor main menu using Electron APIs.
 */
const ElectronMainMenu = ({
  props,
  callbacks,
  extraCallbacks,
}: {|
  props: BuildMainMenuProps,
  callbacks: MainMenuCallbacks,
  extraCallbacks: MainMenuExtraCallbacks,
|}) => {
  const {
    i18n,
    project,
    canSaveProjectAs,
    recentProjectFiles,
    shortcutMap,
    isApplicationTopLevelMenu,
  } = props;
  const { onClosePreview } = extraCallbacks;
  const language = i18n.language;
  const [
    isFocusedOnMainWindow,
    setIsFocusedOnMainWindow,
  ] = React.useState<boolean>(true);
  const [focusedWindowId, setFocusedWindowId] = React.useState<number>(
    remote.getCurrentWindow().id
  );
  const closePreviewWindow =
    !isFocusedOnMainWindow && onClosePreview
      ? () => onClosePreview(focusedWindowId)
      : null;
  const {
    values: { useShortcutToClosePreviewWindow },
  } = React.useContext(PreferencesContext);

  useAppEventListener({
    event: 'browser-window-focus',
    callback: window => {
      setFocusedWindowId(window.id);
      setIsFocusedOnMainWindow(isMainWindow(window.title));
    },
  });
  useAppEventListener({
    event: 'browser-window-blur',
    callback: window => {
      setIsFocusedOnMainWindow(!isMainWindow(window.title));
    },
  });

  // We could use a for loop, but for safety let's write every hook one by
  // one to avoid any change at runtime which would break the rules of hooks.
  useIPCEventListener({
    ipcEvent: 'main-menu-open',
    callback: callbacks.onChooseProject,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-open-recent',
    callback: callbacks.onOpenRecentFile,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-save',
    callback: callbacks.onSaveProject,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-save-as',
    callback: callbacks.onSaveProjectAs,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-show-version-history',
    callback: callbacks.onShowVersionHistory,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-close',
    callback:
      useShortcutToClosePreviewWindow && closePreviewWindow
        ? closePreviewWindow
        : callbacks.onCloseProject,
    shouldApply:
      useShortcutToClosePreviewWindow && closePreviewWindow
        ? true
        : isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-close-app',
    callback: callbacks.onCloseApp,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-export',
    callback: callbacks.onExportProject,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-invite-collaborators',
    callback: callbacks.onInviteCollaborators,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-create-template',
    callback: callbacks.onCreateProject,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-create-blank',
    callback: callbacks.onCreateBlank,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-open-project-manager',
    callback: callbacks.onOpenProjectManager,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-open-home-page',
    callback: callbacks.onOpenHomePage,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-open-debugger',
    callback: callbacks.onOpenDebugger,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-open-about',
    callback: callbacks.onOpenAbout,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-open-preferences',
    callback: callbacks.onOpenPreferences,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-open-language',
    callback: callbacks.onOpenLanguage,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'main-menu-open-profile',
    callback: callbacks.onOpenProfile,
    shouldApply: isFocusedOnMainWindow,
  });
  useIPCEventListener({
    ipcEvent: 'update-status',
    callback: callbacks.setElectronUpdateStatus,
    shouldApply: true, // Keep logic around app update even if on preview window
  });

  React.useEffect(
    () => {
      if (ipcRenderer) {
        ipcRenderer.send(
          'set-main-menu',
          buildMainMenuDeclarativeTemplate({
            project,
            canSaveProjectAs,
            i18n,
            recentProjectFiles,
            shortcutMap,
            isApplicationTopLevelMenu,
          })
        );
      }
    },
    [
      i18n,
      language,
      project,
      canSaveProjectAs,
      recentProjectFiles,
      shortcutMap,
      isApplicationTopLevelMenu,
    ]
  );

  const { onOpenRecentFile } = callbacks;
  useCommandWithOptions('OPEN_RECENT_PROJECT', true, {
    generateOptions: React.useCallback(
      () =>
        recentProjectFiles.map(item => ({
          text: item.fileMetadata.fileIdentifier,
          handler: () => onOpenRecentFile(item),
        })),
      [onOpenRecentFile, recentProjectFiles]
    ),
  });

  return null;
};

export default ElectronMainMenu;
