// @flow
import { type CommandName } from '../CommandPalette/CommandsList';

export type ShortcutMap = { [CommandName]: string };

const defaultShortcuts: ShortcutMap = {
  QUIT_APP: 'CmdOrCtrl+Shift+KeyQ',
  OPEN_PROJECT_MANAGER: 'CmdOrCtrl+Shift+KeyB',
  LAUNCH_PREVIEW: 'F5',
  LAUNCH_DEBUG_PREVIEW: 'F6',
  OPEN_START_PAGE: 'CmdOrCtrl+Shift+KeyM',
  CREATE_NEW_PROJECT: 'CmdOrCtrl+Shift+KeyN',
  OPEN_PROJECT: 'CmdOrCtrl+KeyO',
  SAVE_PROJECT: 'CmdOrCtrl+KeyS',
  SAVE_PROJECT_AS: 'CmdOrCtrl+Shift+KeyS',
  CLOSE_PROJECT: 'CmdOrCtrl+KeyQ',
  EXPORT_GAME: 'CmdOrCtrl+Shift+KeyE',
  OPEN_RECENT_PROJECT: '',
  OPEN_COMMAND_PALETTE: 'CmdOrCtrl+KeyP',

  OPEN_PROJECT_PROPERTIES: '',
  OPEN_PROJECT_VARIABLES: '',
  OPEN_PLATFORM_SPECIFIC_ASSETS_DIALOG: '',
  OPEN_PROJECT_RESOURCES: '',

  OPEN_LAYOUT: 'CmdOrCtrl+Alt+KeyL',
  OPEN_EXTERNAL_EVENTS: 'CmdOrCtrl+Alt+KeyE',
  OPEN_EXTERNAL_LAYOUT: 'CmdOrCtrl+Alt+KeyF',
  OPEN_EXTENSION: 'CmdOrCtrl+Alt+KeyG',

  OPEN_SCENE_PROPERTIES: '',
  OPEN_SCENE_VARIABLES: '',

  OPEN_OBJECTS_PANEL: '',
  OPEN_OBJECT_GROUPS_PANEL: '',
  OPEN_PROPERTIES_PANEL: '',
  TOGGLE_INSTANCES_PANEL: '',
  TOGGLE_LAYERS_PANEL: '',
  DELETE_INSTANCES: '',
  TOGGLE_WINDOW_MASK: '',
  TOGGLE_GRID: '',
  OPEN_SETUP_GRID: '',
  EDIT_LAYER_EFFECTS: '',
  EDIT_OBJECT: 'CmdOrCtrl+Shift+KeyO',
  EDIT_OBJECT_VARIABLES: 'CmdOrCtrl+Shift+KeyV',
  EDIT_OBJECT_GROUP: 'CmdOrCtrl+Shift+KeyG',

  ADD_STANDARD_EVENT: 'CmdOrCtrl+Shift+KeyA',
  ADD_SUBEVENT: 'CmdOrCtrl+Shift+KeyZ',
  ADD_COMMENT_EVENT: '',
  CHOOSE_AND_ADD_EVENT: 'CmdOrCtrl+Shift+KeyW',
  OPEN_SETTINGS: '',
};

export default defaultShortcuts;
