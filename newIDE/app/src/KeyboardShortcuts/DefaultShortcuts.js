// @flow
import { type CommandName } from '../CommandPalette/CommandsList';

export type ShortcutMap = { [CommandName]: string };

const defaultShortcuts: ShortcutMap = {
  QUIT_APP: 'CmdOrCtrl+Shift+Q',
  OPEN_PROJECT_MANAGER: 'CmdOrCtrl+Shift+B',
  LAUNCH_PREVIEW: 'F5',
  LAUNCH_DEBUG_PREVIEW: 'F6',
  OPEN_START_PAGE: 'CmdOrCtrl+Shift+M',
  CREATE_NEW_PROJECT: 'CmdOrCtrl+Shift+N',
  OPEN_PROJECT: 'CmdOrCtrl+O',
  SAVE_PROJECT: 'CmdOrCtrl+S',
  SAVE_PROJECT_AS: 'CmdOrCtrl+Shift+S',
  CLOSE_PROJECT: 'CmdOrCtrl+Q',
  EXPORT_GAME: 'CmdOrCtrl+Shift+E',
  OPEN_RECENT_PROJECT: '',

  OPEN_PROJECT_PROPERTIES: '',
  OPEN_PROJECT_VARIABLES: '',
  OPEN_PLATFORM_SPECIFIC_ASSETS_DIALOG: '',
  OPEN_PROJECT_RESOURCES: '',

  OPEN_LAYOUT: 'CmdOrCtrl+Alt+L',
  OPEN_EXTERNAL_EVENTS: 'CmdOrCtrl+Alt+E',
  OPEN_EXTERNAL_LAYOUT: 'CmdOrCtrl+Alt+F',
  OPEN_EXTENSION: 'CmdOrCtrl+Alt+G',

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
  EDIT_OBJECT: 'CmdOrCtrl+Shift+O',
  EDIT_OBJECT_VARIABLES: 'CmdOrCtrl+Shift+V',
  EDIT_OBJECT_GROUP: 'CmdOrCtrl+Shift+G',

  ADD_STANDARD_EVENT: 'CmdOrCtrl+Shift+A',
  ADD_SUBEVENT: 'CmdOrCtrl+Shift+Z',
  ADD_COMMENT_EVENT: '',
  CHOOSE_AND_ADD_EVENT: 'CmdOrCtrl+Shift+W',
  OPEN_SETTINGS: '',
};

export default defaultShortcuts;
