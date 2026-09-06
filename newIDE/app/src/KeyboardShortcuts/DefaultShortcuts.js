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
  OPEN_DIAGNOSTIC_REPORT: 'F7',
  OPEN_HOME_PAGE: '',
  CREATE_NEW_PROJECT: 'CmdOrCtrl+Alt+KeyN',
  OPEN_PROJECT: 'CmdOrCtrl+KeyO',
  SAVE_PROJECT: 'CmdOrCtrl+KeyS',
  SAVE_PROJECT_AS: 'CmdOrCtrl+Shift+KeyS',
  CLOSE_PROJECT: 'CmdOrCtrl+KeyW',
  RELOAD_PROJECT: '',
  EXPORT_GAME: 'CmdOrCtrl+Shift+KeyE',
  INVITE_COLLABORATORS: 'CmdOrCtrl+Shift+KeyI',
  OPEN_RECENT_PROJECT: '',
  OPEN_COMMAND_PALETTE: 'CmdOrCtrl+KeyP',

  OPEN_PROJECT_PROPERTIES: '',
  OPEN_PROJECT_LOADING_SCREEN: '',
  OPEN_PROJECT_VARIABLES: '',
  OPEN_PLATFORM_SPECIFIC_ASSETS_DIALOG: '',
  OPEN_PROJECT_RESOURCES: '',
  OPEN_GLOBAL_SEARCH: 'CmdOrCtrl+Shift+KeyF',

  OPEN_LAYOUT: '',
  OPEN_EXTERNAL_EVENTS: '',
  OPEN_EXTERNAL_LAYOUT: '',
  OPEN_EXTENSION: '',

  OPEN_SCENE_PROPERTIES: '',
  OPEN_SCENE_VARIABLES: 'KeyV',

  OPEN_OBJECTS_PANEL: 'KeyO',
  OPEN_OBJECT_GROUPS_PANEL: 'KeyG',
  OPEN_PROPERTIES_PANEL: 'KeyP',
  TOGGLE_INSTANCES_PANEL: 'KeyI',
  TOGGLE_LAYERS_PANEL: 'KeyL',
  TOGGLE_WINDOW_MASK: 'KeyM',
  TOGGLE_GRID: 'Alt+KeyG',
  OPEN_SETUP_GRID: 'CmdOrCtrl+Shift+KeyG',
  EDIT_LAYER_EFFECTS: 'KeyE',
  EDIT_LAYER: 'KeyT',
  EDIT_OBJECT: '',
  EDIT_OBJECT_VARIABLES: 'Shift+KeyV',
  EDIT_OBJECT_GROUP: 'Shift+KeyG',

  ADD_STANDARD_EVENT: 'Shift+KeyA',
  ADD_SUBEVENT: 'Shift+KeyD',
  ADD_LOCAL_VARIABLE: 'Shift+KeyL',
  ADD_COMMENT_EVENT: 'Shift+KeyC',
  TOGGLE_EVENT_DISABLED: 'KeyD',
  TOGGLE_CONDITION_INVERTED: 'KeyJ',
  CHOOSE_AND_ADD_EVENT: 'Shift+KeyW',
  MOVE_EVENTS_IN_NEW_GROUP: 'CmdOrCtrl+KeyG',
  OPEN_EXTENSION_SETTINGS: '',

  // Tile map painting tools. Inspired by Godot and Aseprite, but the letters
  // E, P, G, I and V are already used by the scene editor commands above, so
  // these tools use Shift with their first letter.
  TILEMAP_FREEHAND_BRUSH: 'KeyB',
  TILEMAP_RECTANGLE_PAINT: 'KeyR',
  TILEMAP_FILL_BUCKET: 'Shift+KeyF',
  TILEMAP_TILE_PICKER: 'Shift+KeyP',
  TILEMAP_ERASE: 'Shift+KeyE',
  TILEMAP_FLIP_HORIZONTALLY: 'Shift+KeyH',
  TILEMAP_FLIP_VERTICALLY: 'Shift+KeyY',

  // In-game (3D) editor. These shortcuts are only active when the game
  // preview has the focus, so they can reuse letters of the IDE commands.
  IN_GAME_EDITOR_TRANSLATE_MODE: 'Digit1',
  IN_GAME_EDITOR_ROTATE_MODE: 'Digit2',
  IN_GAME_EDITOR_SCALE_MODE: 'Digit3',
  IN_GAME_EDITOR_FOCUS_ON_SELECTION: 'KeyF',
  IN_GAME_EDITOR_MOVE_CAMERA_FORWARD: 'KeyW',
  IN_GAME_EDITOR_MOVE_CAMERA_BACKWARD: 'KeyS',
  IN_GAME_EDITOR_MOVE_CAMERA_LEFT: 'KeyA',
  IN_GAME_EDITOR_MOVE_CAMERA_RIGHT: 'KeyD',
  IN_GAME_EDITOR_MOVE_CAMERA_UP: 'KeyE',
  IN_GAME_EDITOR_MOVE_CAMERA_DOWN: 'KeyQ',
  IN_GAME_EDITOR_ORBIT_CAMERA: 'KeyO',
};

/**
 * Secondary (alternative) shortcuts for commands.
 * These are not user-customizable and provide additional
 * key bindings for commonly used commands.
 */
export const defaultSecondaryShortcuts: ShortcutMap = {
  OPEN_COMMAND_PALETTE: 'CmdOrCtrl+KeyK',
};

export type KeyboardLayout = 'qwerty' | 'azerty';

/**
 * On AZERTY keyboards, the keys used to move the camera of the 3D editor are
 * ZQSD (and A to go down) instead of WASD (and Q to go down).
 */
const azertyDefaultShortcutOverrides: ShortcutMap = {
  IN_GAME_EDITOR_MOVE_CAMERA_FORWARD: 'KeyZ',
  IN_GAME_EDITOR_MOVE_CAMERA_LEFT: 'KeyQ',
  IN_GAME_EDITOR_MOVE_CAMERA_DOWN: 'KeyA',
};

/**
 * The default shortcuts for the given keyboard layout.
 */
export const getDefaultShortcuts = (
  keyboardLayout: KeyboardLayout
): ShortcutMap =>
  keyboardLayout === 'azerty'
    ? { ...defaultShortcuts, ...azertyDefaultShortcutOverrides }
    : defaultShortcuts;

export default defaultShortcuts;
