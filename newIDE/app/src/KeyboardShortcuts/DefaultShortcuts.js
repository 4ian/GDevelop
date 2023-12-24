// @flow
import { type CommandName } from '../CommandPalette/CommandsList';

export type ShortcutMap = { [CommandName]: string };

const defaultShortcuts: ShortcutMap = {
  QUIT_APP: 'CmdOrCtrl+KeyQ', // It's important to keep this shortcut, as this default cannot be overriden on Mac.
  OPEN_PROJECT_MANAGER: 'CmdOrCtrl+Alt+KeyE',
  LAUNCH_NEW_PREVIEW: 'F4',
  LAUNCH_DEBUG_PREVIEW: 'F6',
  HOT_RELOAD_PREVIEW: 'F5',
  LAUNCH_NETWORK_PREVIEW: 'F8',
  OPEN_HOME_PAGE: '',
  CREATE_NEW_PROJECT: 'CmdOrCtrl+Alt+KeyN',
  OPEN_PROJECT: 'CmdOrCtrl+KeyO',
  SAVE_PROJECT: 'CmdOrCtrl+KeyS',
  SAVE_PROJECT_AS: 'CmdOrCtrl+Shift+KeyS',
  CLOSE_PROJECT: 'CmdOrCtrl+KeyW',
  EXPORT_GAME: 'CmdOrCtrl+Shift+KeyE',
  INVITE_COLLABORATORS: 'CmdOrCtrl+Shift+KeyI',
  OPEN_RECENT_PROJECT: '',
  OPEN_COMMAND_PALETTE: 'CmdOrCtrl+KeyP',

  OPEN_PROJECT_PROPERTIES: '',
  OPEN_PROJECT_LOADING_SCREEN: '',
  OPEN_PROJECT_VARIABLES: '',
  OPEN_PLATFORM_SPECIFIC_ASSETS_DIALOG: '',
  OPEN_PROJECT_RESOURCES: '',

  OPEN_LAYOUT: 'Alt+KeyS',
  OPEN_EXTERNAL_EVENTS: 'Alt+KeyV',
  OPEN_EXTERNAL_LAYOUT: 'Alt+KeyW',
  OPEN_EXTENSION: 'Alt+KeyE',

  OPEN_SCENE_PROPERTIES: 'KeyS',
  OPEN_SCENE_VARIABLES: 'KeyV',

  OPEN_OBJECTS_PANEL: 'KeyO',
  OPEN_OBJECT_GROUPS_PANEL: 'KeyG',
  OPEN_PROPERTIES_PANEL: 'KeyP',
  TOGGLE_INSTANCES_PANEL: 'KeyI',
  TOGGLE_LAYERS_PANEL: 'KeyL',
  RENAME_SCENE_OBJECT: 'F2',
  TOGGLE_WINDOW_MASK: 'KeyM',
  TOGGLE_GRID: 'Alt+KeyG',
  OPEN_SETUP_GRID: 'CmdOrCtrl+Shift+KeyG',
  EDIT_LAYER_EFFECTS: 'KeyE',
  EDIT_LAYER: 'KeyT',
  EDIT_OBJECT: 'Shift+KeyE',
  EDIT_OBJECT_VARIABLES: 'Shift+KeyV',
  EDIT_OBJECT_GROUP: 'Shift+KeyG',

  ADD_STANDARD_EVENT: 'Shift+KeyA',
  ADD_SUBEVENT: 'Shift+KeyD',
  ADD_COMMENT_EVENT: '',
  TOGGLE_EVENT_DISABLED: 'KeyD',
  TOGGLE_CONDITION_INVERTED: 'KeyJ',
  CHOOSE_AND_ADD_EVENT: 'Shift+KeyW',
  MOVE_EVENTS_IN_NEW_GROUP: 'CmdOrCtrl+KeyG',
  OPEN_EXTENSION_SETTINGS: '',
};

export default defaultShortcuts;
