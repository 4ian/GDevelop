// @flow
import * as React from 'react';
import optionalRequire from '../Utils/OptionalRequire';
import { useCommandWithOptions } from '../CommandPalette/CommandHooks';
import { getElectronAccelerator } from '../KeyboardShortcuts';
import { useShortcutMap } from '../KeyboardShortcuts';
import { t } from '@lingui/macro';
import { isMacLike } from '../Utils/Platform';
import { type MainMenuProps } from './MainMenu.flow';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

type MainMenuEvent =
  | 'main-menu-open'
  | 'main-menu-open-recent'
  | 'main-menu-save'
  | 'main-menu-save-as'
  | 'main-menu-close'
  | 'main-menu-close-app'
  | 'main-menu-export'
  | 'main-menu-create'
  | 'main-menu-open-project-manager'
  | 'main-menu-open-start-page'
  | 'main-menu-open-debugger'
  | 'main-menu-open-about'
  | 'main-menu-open-preferences'
  | 'main-menu-open-language'
  | 'main-menu-open-profile'
  | 'update-status';

type MenuItemTemplate =
  | {|
      onClickSendEvent?: MainMenuEvent,
      onClickOpenLink?: string,
      accelerator?: string,
      enabled?: boolean,
      label?: string,
      eventArgs?: any,
    |}
  | {|
      submenu: Array<MenuItemTemplate>,
      label: string,
    |}
  | {|
      submenu: Array<MenuItemTemplate>,
      role: string,
    |}
  | {|
      type: 'separator',
    |}
  | {|
      role: string,
    |};

type RootMenuTemplate =
  | {|
      label: string,
      submenu: Array<MenuItemTemplate>,
    |}
  | {|
      role: string,
      submenu: Array<MenuItemTemplate>,
    |};

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

const buildAndSendMenuTemplate = (
  project,
  i18n,
  recentProjectFiles,
  shortcutMap
) => {
  const fileTemplate = {
    label: i18n._(t`File`),
    submenu: [
      {
        label: i18n._(t`Create a New Project...`),
        accelerator: getElectronAccelerator(shortcutMap['CREATE_NEW_PROJECT']),
        onClickSendEvent: 'main-menu-create',
      },
      { type: 'separator' },
      {
        label: i18n._(t`Open...`),
        accelerator: getElectronAccelerator(shortcutMap['OPEN_PROJECT']),
        onClickSendEvent: 'main-menu-open',
      },
      {
        label: i18n._(t`Open Recent`),
        submenu: recentProjectFiles.map(item => ({
          label: item.fileMetadata.fileIdentifier,
          onClickSendEvent: 'main-menu-open-recent',
          eventArgs: item,
        })),
      },
      { type: 'separator' },
      {
        label: i18n._(t`Save`),
        accelerator: getElectronAccelerator(shortcutMap['SAVE_PROJECT']),
        onClickSendEvent: 'main-menu-save',
        enabled: !!project,
      },
      {
        label: i18n._(t`Save as...`),
        accelerator: getElectronAccelerator(shortcutMap['SAVE_PROJECT_AS']),
        onClickSendEvent: 'main-menu-save-as',
        enabled: !!project,
      },
      { type: 'separator' },
      {
        label: i18n._(t`Export (web, iOS, Android)...`),
        accelerator: getElectronAccelerator(shortcutMap['EXPORT_GAME']),
        onClickSendEvent: 'main-menu-export',
        enabled: !!project,
      },
      { type: 'separator' },
      {
        label: i18n._(t`Close Project`),
        accelerator: getElectronAccelerator(shortcutMap['CLOSE_PROJECT']),
        onClickSendEvent: 'main-menu-close',
        enabled: !!project,
      },
    ],
  };
  if (!isMacLike()) {
    fileTemplate.submenu.push(
      { type: 'separator' },
      {
        label: i18n._(t`My Profile`),
        onClickSendEvent: 'main-menu-open-profile',
      },
      {
        label: i18n._(t`Preferences`),
        onClickSendEvent: 'main-menu-open-preferences',
      },
      {
        label: i18n._(t`Language`),
        onClickSendEvent: 'main-menu-open-language',
      },
      { type: 'separator' },
      {
        label: i18n._(t`Exit GDevelop`),
        accelerator: getElectronAccelerator(shortcutMap['QUIT_APP']),
        onClickSendEvent: 'main-menu-close-app',
      }
    );
  }

  const editTemplate = {
    label: i18n._(t`Edit`),
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' },
    ],
  };

  const viewTemplate = {
    label: i18n._(t`View`),
    submenu: [
      {
        label: i18n._(t`Show Project Manager`),
        accelerator: getElectronAccelerator(
          shortcutMap['OPEN_PROJECT_MANAGER']
        ),
        onClickSendEvent: 'main-menu-open-project-manager',
        enabled: !!project,
      },
      {
        label: i18n._(t`Show Start Page`),
        onClickSendEvent: 'main-menu-open-start-page',
      },
      {
        label: i18n._(t`Open Debugger`),
        onClickSendEvent: 'main-menu-open-debugger',
        enabled: !!project,
      },
      { type: 'separator' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  };

  const windowTemplate = {
    role: 'window',
    submenu: [{ role: 'minimize' }],
  };

  const helpTemplate = {
    role: 'help',
    submenu: [
      {
        label: i18n._(t`GDevelop website`),
        onClickOpenLink: 'http://gdevelop-app.com',
      },
      { type: 'separator' },
      {
        label: i18n._(t`Community Forums`),
        onClickOpenLink: 'https://forum.gdevelop-app.com',
      },
      {
        label: i18n._(t`Community Discord Chat`),
        onClickOpenLink: 'https://discord.gg/rjdYHvj',
      },
      { type: 'separator' },
      {
        label: i18n._(t`Contribute to GDevelop`),
        onClickOpenLink: 'https://gdevelop-app.com/contribute/',
      },
      {
        label: i18n._(t`Create Extensions for GDevelop`),
        onClickOpenLink:
          'https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md',
      },
      { type: 'separator' },
      {
        label: i18n._(t`Help to Translate GDevelop`),
        onClickOpenLink: 'https://crowdin.com/project/gdevelop',
      },
      {
        label: i18n._(t`Report a wrong translation`),
        onClickOpenLink: 'https://github.com/4ian/GDevelop/issues/969',
      },
    ],
  };
  if (!isMacLike()) {
    helpTemplate.submenu.push(
      { type: 'separator' },
      {
        label: i18n._(t`About GDevelop`),
        onClickSendEvent: 'main-menu-open-about',
      }
    );
  }

  const template: Array<RootMenuTemplate> = [
    fileTemplate,
    editTemplate,
    viewTemplate,
    windowTemplate,
    helpTemplate,
  ];

  if (isMacLike()) {
    template.unshift({
      label: i18n._(t`GDevelop 5`),
      submenu: [
        {
          label: i18n._(t`About GDevelop`),
          onClickSendEvent: 'main-menu-open-about',
        },
        { type: 'separator' },
        {
          label: i18n._(t`My Profile`),
          onClickSendEvent: 'main-menu-open-profile',
        },
        {
          label: i18n._(t`Preferences`),
          onClickSendEvent: 'main-menu-open-preferences',
        },
        {
          label: i18n._(t`Language`),
          onClickSendEvent: 'main-menu-open-language',
        },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });

    editTemplate.submenu.push(
      { type: 'separator' },
      {
        label: i18n._(t`Speech`),
        submenu: [{ role: 'startspeaking' }, { role: 'stopspeaking' }],
      }
    );

    windowTemplate.submenu = [
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' },
    ];
  }

  if (ipcRenderer) {
    ipcRenderer.send('set-main-menu', template);
  }
};

/**
 * Create and update the editor main menu using Electron APIs.
 */
const ElectronMainMenu = (props: MainMenuProps) => {
  const { i18n, project, recentProjectFiles, onOpenRecentFile } = props;
  const shortcutMap = useShortcutMap();
  const language = i18n.language;

  useIPCEventListener('main-menu-open', props.onChooseProject);
  useIPCEventListener('main-menu-open-recent', props.onOpenRecentFile);
  useIPCEventListener('main-menu-save', props.onSaveProject);
  useIPCEventListener('main-menu-save-as', props.onSaveProjectAs);
  useIPCEventListener('main-menu-close', props.onCloseProject);
  useIPCEventListener('main-menu-close-app', props.onCloseApp);
  useIPCEventListener('main-menu-export', props.onExportProject);
  useIPCEventListener('main-menu-create', props.onCreateProject);
  useIPCEventListener(
    'main-menu-open-project-manager',
    props.onOpenProjectManager
  );
  useIPCEventListener('main-menu-open-start-page', props.onOpenStartPage);
  useIPCEventListener('main-menu-open-debugger', props.onOpenDebugger);
  useIPCEventListener('main-menu-open-about', props.onOpenAbout);
  useIPCEventListener('main-menu-open-preferences', props.onOpenPreferences);
  useIPCEventListener('main-menu-open-language', props.onOpenLanguage);
  useIPCEventListener('main-menu-open-profile', props.onOpenProfile);
  useIPCEventListener('update-status', props.setUpdateStatus);

  React.useEffect(
    () => {
      buildAndSendMenuTemplate(project, i18n, recentProjectFiles, shortcutMap);
    },
    [i18n, language, project, recentProjectFiles, shortcutMap]
  );

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
