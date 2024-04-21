// @flow

import { type Node as ReactNode } from 'react';

/**
 * The type describing a menu item supported both as in an Electron
 * menu and as a material-ui menu (for the web-app).
 */
export type MenuItemTemplate =
  // "Classic" menu item
  | {|
      id?: string,
      label: string,
      visible?: boolean,
      enabled?: boolean,
      disabled?: boolean,
      click?: ?() => void | Promise<void>,
      accelerator?: string,
    |}
  // Sub menu
  | {|
      id?: string,
      label: string,
      submenu: Array<MenuItemTemplate>,
    |}
  // Checkbox
  | {|
      id?: string,
      type: 'checkbox',
      label: string,
      visible?: boolean,
      enabled?: boolean,
      checked: boolean,
      click?: ?() => void | (() => Promise<void>),
    |}
  // A separator
  | {|
      type: 'separator',
    |};

export interface ContextMenuImplementation {
  buildFromTemplate(
    template: Array<MenuItemTemplate>,
    forceUpdate?: () => void
  ): ?ReactNode;
  showMenu(dimensions: {|
    left: number,
    top: number,
    width: number,
    height: number,
  |}): void;
}

/**
 * The type describing a menu item without any function for the clicks.
 * Instead, `onClickSendEvent` or `onClickOpenLink` are plain strings
 * representing the action to do.
 *
 * This allows to send a template of a menu to the Electron main process
 * to generate the application main menu.
 */
export type MenuDeclarativeItemTemplate =
  // "Classic" menu item
  | {|
      label: string,
      visible?: boolean,
      enabled?: boolean,
      accelerator?: string,

      onClickSendEvent?: string,
      eventArgs?: any,
      onClickOpenLink?: string,
    |}
  // Sub menu
  | {|
      label: string,
      submenu: Array<MenuDeclarativeItemTemplate>,
    |}
  // A separator
  | {|
      type: 'separator',
    |}
  // A special menu for Electron to display a system menu.
  | {|
      label?: string,
      role:
        | 'services'
        | 'hide'
        | 'hideothers'
        | 'unhide'
        | 'quit'
        | 'undo'
        | 'redo'
        | 'cut'
        | 'copy'
        | 'paste'
        | 'pasteandmatchstyle'
        | 'delete'
        | 'selectall'
        | 'minimize'
        | 'toggledevtools'
        | 'togglefullscreen'
        | 'startspeaking'
        | 'stopspeaking'
        | 'zoom'
        | 'front'
        | 'help'
        | 'window',
      submenu?: Array<MenuDeclarativeItemTemplate>,
    |};
