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
const ipcRenderer = electron ? electron.ipcRenderer : null;

// Custom hook to register and deregister IPC listener
const useIPCEventListener = (ipcEvent: MainMenuEvent, func) => {
  React.useEffect(
    () => {
      if (!ipcRenderer) return;
      const handler = (event, ...eventArgs) => func(...eventArgs);
      ipcRenderer.on(ipcEvent, handler);
      return () => ipcRenderer.removeListener(ipcEvent, handler);
    },
    [ipcEvent, func]
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

  // We could use a for loop, but for safety let's write every hook one by
  // one to avoid any change at runtime which would break the rules of hooks.
  useIPCEventListener('main-menu-open', callbacks.onChooseProject);
  useIPCEventListener('main-menu-open-recent', callbacks.onOpenRecentFile);
  useIPCEventListener('main-menu-save', callbacks.onSaveProject);
  useIPCEventListener('main-menu-save-as', callbacks.onSaveProjectAs);
  useIPCEventListener('main-menu-close', callbacks.onCloseProject);
  useIPCEventListener('main-menu-close-app', callbacks.onCloseApp);
  useIPCEventListener('main-menu-export', callbacks.onExportProject);
  useIPCEventListener('main-menu-create-template', callbacks.onCreateProject);
  useIPCEventListener('main-menu-create-blank', callbacks.onCreateBlank);
  useIPCEventListener(
    'main-menu-open-project-manager',
    callbacks.onOpenProjectManager
  );
  useIPCEventListener('main-menu-open-home-page', callbacks.onOpenHomePage);
  useIPCEventListener('main-menu-open-debugger', callbacks.onOpenDebugger);
  useIPCEventListener('main-menu-open-about', callbacks.onOpenAbout);
  useIPCEventListener(
    'main-menu-open-preferences',
    callbacks.onOpenPreferences
  );
  useIPCEventListener('main-menu-open-language', callbacks.onOpenLanguage);
  useIPCEventListener('main-menu-open-profile', callbacks.onOpenProfile);
  useIPCEventListener(
    'main-menu-open-games-dashboard',
    callbacks.onOpenGamesDashboard
  );
  useIPCEventListener('update-status', callbacks.setElectronUpdateStatus);

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

  // TODO: move this? And ensure stability.
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
