// @flow
import * as React from 'react';
import optionalRequire from '../Utils/OptionalRequire';
import { useCommandWithOptions } from '../CommandPalette/CommandHooks';
import {
  buildMainMenuDeclarativeTemplate,
  type BuildMainMenuProps,
  type MainMenuCallbacks,
  type MainMenuEvent,
} from './MainMenu';
const electron = optionalRequire('electron');
const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;
const ipcRenderer = electron ? electron.ipcRenderer : null;

// Custom hook to register and deregister IPC listener
const useIPCEventListener = (
  ipcEvent: MainMenuEvent,
  func,
  shouldApply: boolean
) => {
  React.useEffect(
    () => {
      if (!ipcRenderer || !shouldApply) return;

      const handler = (event, ...eventArgs) => func(...eventArgs);
      ipcRenderer.on(ipcEvent, handler);
      return () => ipcRenderer.removeListener(ipcEvent, handler);
    },
    [ipcEvent, func, shouldApply]
  );
};

const useAppEventListener = (event, func) => {
  React.useEffect(
    () => {
      if (!app) return;
      const handler = (event, ...eventArgs) => func(...eventArgs);
      app.on(event, handler);
      return () => app.removeListener(event, handler);
    },
    [event, func]
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
}: {|
  props: BuildMainMenuProps,
  callbacks: MainMenuCallbacks,
|}) => {
  const { i18n, project, recentProjectFiles, shortcutMap } = props;
  const language = i18n.language;
  const [
    isFocusedOnMainWindow,
    setIsFocusedOnMainWindow,
  ] = React.useState<boolean>(true);
  useAppEventListener('browser-window-focus', window => {
    setIsFocusedOnMainWindow(isMainWindow(window.title));
  });
  useAppEventListener('browser-window-blur', window => {
    setIsFocusedOnMainWindow(!isMainWindow(window.title));
  });

  // We could use a for loop, but for safety let's write every hook one by
  // one to avoid any change at runtime which would break the rules of hooks.
  useIPCEventListener(
    'main-menu-open',
    callbacks.onChooseProject,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-open-recent',
    callbacks.onOpenRecentFile,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-save',
    callbacks.onSaveProject,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-save-as',
    callbacks.onSaveProjectAs,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-close',
    callbacks.onCloseProject,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-close-app',
    callbacks.onCloseApp,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-export',
    callbacks.onExportProject,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-create-template',
    callbacks.onCreateProject,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-create-blank',
    callbacks.onCreateBlank,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-open-project-manager',
    callbacks.onOpenProjectManager,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-open-home-page',
    callbacks.onOpenHomePage,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-open-debugger',
    callbacks.onOpenDebugger,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-open-about',
    callbacks.onOpenAbout,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-open-preferences',
    callbacks.onOpenPreferences,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-open-language',
    callbacks.onOpenLanguage,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-open-profile',
    callbacks.onOpenProfile,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'main-menu-open-games-dashboard',
    callbacks.onOpenGamesDashboard,
    isFocusedOnMainWindow
  );
  useIPCEventListener(
    'update-status',
    callbacks.setElectronUpdateStatus,
    true // Keep logic around app update even if on preview window
  );

  React.useEffect(
    () => {
      if (ipcRenderer) {
        ipcRenderer.send(
          'set-main-menu',
          buildMainMenuDeclarativeTemplate({
            project,
            i18n,
            recentProjectFiles,
            shortcutMap,
            isApplicationTopLevelMenu: true,
          })
        );
      }
    },
    [i18n, language, project, recentProjectFiles, shortcutMap]
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
