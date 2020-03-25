// @flow
import * as React from 'react';
import MainFrame from '.';
import optionalRequire from '../Utils/OptionalRequire';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import { isMacLike } from '../Utils/Platform';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

type Props = {|
  children: React.Element<typeof MainFrame>,
  i18n: I18nType,
|};

type MainMenuEvent =
  | 'main-menu-open'
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

/**
 * Forward events received from Electron main process
 * to the underlying child React component.
 */
class ElectronMainMenu extends React.Component<Props, {||}> {
  _editor: ?MainFrame;
  _language: ?string;

  componentDidMount() {
    if (!ipcRenderer) return;

    ipcRenderer.on(
      ('main-menu-open': MainMenuEvent),
      event => this._editor && this._editor.chooseProject()
    );
    ipcRenderer.on(
      ('main-menu-save': MainMenuEvent),
      event => this._editor && this._editor.saveProject()
    );
    ipcRenderer.on(
      ('main-menu-save-as': MainMenuEvent),
      event => this._editor && this._editor.saveProjectAs()
    );
    ipcRenderer.on(
      ('main-menu-close': MainMenuEvent),
      event => this._editor && this._editor.askToCloseProject()
    );
    ipcRenderer.on(
      ('main-menu-close-app': MainMenuEvent),
      event => this._editor && this._editor.closeApp()
    );
    ipcRenderer.on(
      ('main-menu-export': MainMenuEvent),
      event => this._editor && this._editor.openExportDialog()
    );
    ipcRenderer.on(
      ('main-menu-create': MainMenuEvent),
      event => this._editor && this._editor.openCreateDialog()
    );
    ipcRenderer.on(
      ('main-menu-open-project-manager': MainMenuEvent),
      event => this._editor && this._editor.openProjectManager()
    );
    ipcRenderer.on(
      ('main-menu-open-start-page': MainMenuEvent),
      event => this._editor && this._editor.openStartPage()
    );
    ipcRenderer.on(
      ('main-menu-open-debugger': MainMenuEvent),
      event => this._editor && this._editor.openDebugger()
    );
    ipcRenderer.on(
      ('main-menu-open-about': MainMenuEvent),
      event => this._editor && this._editor.openAboutDialog()
    );
    ipcRenderer.on(
      ('main-menu-open-preferences': MainMenuEvent),
      event => this._editor && this._editor.openPreferences()
    );
    ipcRenderer.on(
      ('main-menu-open-language': MainMenuEvent),
      event => this._editor && this._editor.openLanguage()
    );
    ipcRenderer.on(
      ('main-menu-open-profile': MainMenuEvent),
      event => this._editor && this._editor.openProfile()
    );
    ipcRenderer.on(
      ('update-status': MainMenuEvent),
      (event, status) => this._editor && this._editor.setUpdateStatus(status)
    );

    this._buildAndSendMenuTemplate();
  }

  componentDidUpdate() {
    if (this.props.i18n.language !== this._language) {
      this._buildAndSendMenuTemplate();
      this._language = this.props.i18n.language;
    }
  }

  _buildAndSendMenuTemplate() {
    const { i18n } = this.props;
    const fileTemplate = {
      label: i18n._(t`File`),
      submenu: [
        {
          label: i18n._(t`Create a New Project...`),
          accelerator: 'CommandOrControl+N',
          onClickSendEvent: 'main-menu-create',
        },
        { type: 'separator' },
        {
          label: i18n._(t`Open...`),
          accelerator: 'CommandOrControl+O',
          onClickSendEvent: 'main-menu-open',
        },
        { type: 'separator' },
        {
          label: i18n._(t`Save`),
          accelerator: 'CommandOrControl+S',
          onClickSendEvent: 'main-menu-save',
        },
        {
          label: i18n._(t`Save as...`),
          accelerator: 'CommandOrControl+Alt+S',
          onClickSendEvent: 'main-menu-save-as',
        },
        { type: 'separator' },
        {
          label: i18n._(t`Export (web, iOS, Android)...`),
          accelerator: 'CommandOrControl+E',
          onClickSendEvent: 'main-menu-export',
        },
        { type: 'separator' },
        {
          label: i18n._(t`Close Project`),
          accelerator: 'CommandOrControl+Shift+W',
          onClickSendEvent: 'main-menu-close',
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
          accelerator: 'Control+Q',
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
          accelerator: 'CommandOrControl+Alt+P',
          onClickSendEvent: 'main-menu-open-project-manager',
        },
        {
          label: i18n._(t`Show Start Page`),
          onClickSendEvent: 'main-menu-open-start-page',
        },
        {
          label: i18n._(t`Open Debugger`),
          onClickSendEvent: 'main-menu-open-debugger',
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
  }

  render() {
    return React.cloneElement(this.props.children, {
      ref: editor => (this._editor = editor),
    });
  }
}

export default ElectronMainMenu;
