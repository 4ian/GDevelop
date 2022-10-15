// @flow

/**
 * The type describing a menu item supported both as in an Electron
 * menu and as a material-ui menu (for the web-app).
 */
export type MenuItemTemplate =
  // "Classic" menu item
  | {|
      label: string,
      visible?: boolean,
      enabled?: boolean,
      disabled?: boolean,
      click?: ?() => void | Promise<void>,
      accelerator?: string,
    |}
  // Sub menu
  | {|
      label: string,
      submenu: Array<MenuItemTemplate>,
    |}
  // Checkbox
  | {|
      type: 'checkbox',
      label: string,
      visible?: boolean,
      enabled?: boolean,
      checked: boolean,
      click?: ?() => void | (() => Promise<void>),
    |}
  // A separator
  | {| type: 'separator' |};
