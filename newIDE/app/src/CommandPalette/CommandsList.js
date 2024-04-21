// @flow
import { t } from '@lingui/macro';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';

export type CommandName =
  | 'QUIT_APP'
  | 'OPEN_PROJECT_MANAGER'
  | 'LAUNCH_NEW_PREVIEW'
  | 'LAUNCH_DEBUG_PREVIEW'
  | 'LAUNCH_NETWORK_PREVIEW'
  | 'HOT_RELOAD_PREVIEW'
  | 'OPEN_HOME_PAGE'
  | 'CREATE_NEW_PROJECT'
  | 'OPEN_PROJECT'
  | 'SAVE_PROJECT'
  | 'SAVE_PROJECT_AS'
  | 'CLOSE_PROJECT'
  | 'EXPORT_GAME'
  | 'INVITE_COLLABORATORS'
  | 'OPEN_RECENT_PROJECT'
  | 'OPEN_COMMAND_PALETTE'
  | 'OPEN_PROJECT_PROPERTIES'
  | 'OPEN_PROJECT_LOADING_SCREEN'
  | 'OPEN_PROJECT_VARIABLES'
  | 'OPEN_PLATFORM_SPECIFIC_ASSETS_DIALOG'
  | 'OPEN_PROJECT_RESOURCES'
  | 'OPEN_SEARCH_EXTENSIONS_DIALOG'
  | 'OPEN_LAYOUT'
  | 'OPEN_EXTERNAL_EVENTS'
  | 'OPEN_EXTERNAL_LAYOUT'
  | 'OPEN_EXTENSION'
  | 'OPEN_SCENE_PROPERTIES'
  | 'OPEN_SCENE_VARIABLES'
  | 'OPEN_OBJECTS_PANEL'
  | 'OPEN_OBJECT_GROUPS_PANEL'
  | 'OPEN_PROPERTIES_PANEL'
  | 'TOGGLE_INSTANCES_PANEL'
  | 'TOGGLE_LAYERS_PANEL'
  | 'SCENE_EDITOR_UNDO'
  | 'SCENE_EDITOR_REDO'
  | 'RENAME_SCENE_OBJECT'
  | 'DELETE_INSTANCES'
  | 'TOGGLE_WINDOW_MASK'
  | 'TOGGLE_GRID'
  | 'OPEN_SETUP_GRID'
  | 'EDIT_LAYER_EFFECTS'
  | 'EDIT_LAYER'
  | 'EDIT_NETWORK_PREVIEW'
  | 'EDIT_OBJECT'
  | 'EDIT_OBJECT_BEHAVIORS'
  | 'EDIT_OBJECT_EFFECTS'
  | 'EDIT_OBJECT_VARIABLES'
  | 'EDIT_OBJECT_GROUP'
  | 'ADD_STANDARD_EVENT'
  | 'ADD_SUBEVENT'
  | 'ADD_COMMENT_EVENT'
  | 'TOGGLE_EVENT_DISABLED'
  | 'TOGGLE_CONDITION_INVERTED'
  | 'CHOOSE_AND_ADD_EVENT'
  | 'MOVE_EVENTS_IN_NEW_GROUP'
  | 'EVENTS_EDITOR_UNDO'
  | 'EVENTS_EDITOR_REDO'
  | 'DELETE_SELECTION'
  | 'SEARCH_EVENTS'
  | 'OPEN_EXTENSION_SETTINGS'
  | 'OPEN_PROFILE';

export const commandAreas = {
  GENERAL: t`General`,
  IDE: t`IDE`,
  PROJECT: t`Project`,
  SCENE: t`Scene`,
  EVENTS: t`Events`,
};

type CommandArea = $Keys<typeof commandAreas>;

type CommandMetadata = {|
  area: CommandArea,
  displayText: MessageDescriptor,
  noShortcut?: boolean, // If true, command won't show up in shortcuts list
  ghost?: boolean, // If true, command won't show up in palette
  handledByElectron?: boolean, // If true, command shortcut is handled by Electron in desktop app
|};

const commandsList: { [CommandName]: CommandMetadata } = {
  // General commands
  QUIT_APP: {
    area: 'GENERAL',
    displayText: t`Close GDevelop`,
    handledByElectron: true,
  },
  OPEN_PROJECT_MANAGER: {
    area: 'IDE',
    displayText: t`Open project manager`,
    handledByElectron: true,
  },
  OPEN_PROFILE: {
    area: 'IDE',
    displayText: t`Open My Profile`,
  },
  LAUNCH_NEW_PREVIEW: { area: 'PROJECT', displayText: t`Launch new preview` },
  LAUNCH_DEBUG_PREVIEW: {
    area: 'PROJECT',
    displayText: t`Launch preview with debugger and profiler`,
  },
  LAUNCH_NETWORK_PREVIEW: {
    area: 'PROJECT',
    displayText: t`Launch network preview over WiFi/LAN`,
  },
  HOT_RELOAD_PREVIEW: {
    area: 'PROJECT',
    displayText: t`Apply changes to the running preview`,
  },
  OPEN_HOME_PAGE: { area: 'IDE', displayText: t`Show Home` },
  CREATE_NEW_PROJECT: {
    area: 'GENERAL',
    displayText: t`Create a new project`,
    handledByElectron: true,
  },
  OPEN_PROJECT: {
    area: 'GENERAL',
    displayText: t`Open project`,
    handledByElectron: true,
  },
  SAVE_PROJECT: {
    area: 'GENERAL',
    displayText: t`Save project`,
    handledByElectron: true,
  },
  SAVE_PROJECT_AS: {
    area: 'GENERAL',
    displayText: t`Save project as...`,
    handledByElectron: true,
  },
  CLOSE_PROJECT: {
    area: 'GENERAL',
    displayText: t`Close project`,
    handledByElectron: true,
  },
  EXPORT_GAME: {
    area: 'PROJECT',
    displayText: t`Export game`,
    handledByElectron: true,
  },
  INVITE_COLLABORATORS: {
    area: 'PROJECT',
    displayText: t`Invite collaborators`,
    handledByElectron: true,
  },
  OPEN_RECENT_PROJECT: {
    area: 'GENERAL',
    displayText: t`Open recent project...`,
  },
  OPEN_COMMAND_PALETTE: {
    area: 'IDE',
    displayText: t`Open command palette`,
    ghost: true,
  },

  // Project manager commands
  OPEN_PROJECT_PROPERTIES: {
    area: 'PROJECT',
    displayText: t`Open project properties`,
  },
  OPEN_PROJECT_LOADING_SCREEN: {
    area: 'PROJECT',
    displayText: t`Edit loading screen`,
  },
  OPEN_PROJECT_VARIABLES: {
    area: 'PROJECT',
    displayText: t`Edit global variables`,
  },
  OPEN_PLATFORM_SPECIFIC_ASSETS_DIALOG: {
    area: 'PROJECT',
    displayText: t`Open project icons`,
  },
  OPEN_PROJECT_RESOURCES: {
    area: 'PROJECT',
    displayText: t`Open project resources`,
  },
  OPEN_SEARCH_EXTENSIONS_DIALOG: {
    area: 'PROJECT',
    displayText: t`Search/import extensions`,
  },

  // Tab-opening commands
  OPEN_LAYOUT: { area: 'IDE', displayText: t`Open scene...` },
  OPEN_EXTERNAL_EVENTS: {
    area: 'IDE',
    displayText: t`Open external events...`,
  },
  OPEN_EXTERNAL_LAYOUT: {
    area: 'IDE',
    displayText: t`Open external layout...`,
  },
  OPEN_EXTENSION: { area: 'IDE', displayText: t`Open extension...` },

  // Scene editor commands
  OPEN_SCENE_PROPERTIES: {
    area: 'SCENE',
    displayText: t`Open scene properties`,
  },
  OPEN_SCENE_VARIABLES: {
    area: 'SCENE',
    displayText: t`Open scene variables`,
  },

  // Scene editor toolbar commands
  OPEN_OBJECTS_PANEL: {
    area: 'SCENE',
    displayText: t`Toggle Objects Panel`,
  },
  OPEN_OBJECT_GROUPS_PANEL: {
    area: 'SCENE',
    displayText: t`Toggle Object Groups Panel`,
  },
  OPEN_PROPERTIES_PANEL: {
    area: 'SCENE',
    displayText: t`Toggle Properties Panel`,
  },
  TOGGLE_INSTANCES_PANEL: {
    area: 'SCENE',
    displayText: t`Toggle Instances List Panel`,
  },
  TOGGLE_LAYERS_PANEL: {
    area: 'SCENE',
    displayText: t`Toggle Layers Panel`,
  },
  SCENE_EDITOR_UNDO: {
    area: 'SCENE',
    displayText: t`Undo the last changes`,
    noShortcut: true,
  },
  SCENE_EDITOR_REDO: {
    area: 'SCENE',
    displayText: t`Redo the last changes`,
    noShortcut: true,
  },
  RENAME_SCENE_OBJECT: {
    area: 'SCENE',
    displayText: t`Rename the selected object`,
  },
  DELETE_INSTANCES: {
    area: 'SCENE',
    displayText: t`Delete the selected instances from the scene`,
    noShortcut: true,
  },
  TOGGLE_WINDOW_MASK: { area: 'SCENE', displayText: t`Toggle mask` },
  TOGGLE_GRID: { area: 'SCENE', displayText: t`Toggle grid` },
  OPEN_SETUP_GRID: { area: 'SCENE', displayText: t`Setup grid` },

  // Layers list commands
  EDIT_LAYER_EFFECTS: {
    area: 'SCENE',
    displayText: t`Edit layer effects...`,
  },
  EDIT_LAYER: {
    area: 'SCENE',
    displayText: t`Edit layer...`,
  },

  // Objects list commands
  EDIT_OBJECT: { area: 'SCENE', displayText: t`Edit object...` },
  EDIT_OBJECT_BEHAVIORS: {
    area: 'SCENE',
    displayText: t`Edit object behaviors...`,
  },
  EDIT_OBJECT_EFFECTS: {
    area: 'SCENE',
    displayText: t`Edit object effects...`,
  },
  EDIT_OBJECT_VARIABLES: {
    area: 'SCENE',
    displayText: t`Edit object variables...`,
  },

  // Object groups list commands
  EDIT_OBJECT_GROUP: { area: 'SCENE', displayText: t`Edit object group...` },

  // Events editor toolbar commands
  ADD_STANDARD_EVENT: {
    area: 'EVENTS',
    displayText: t`Add a new empty event`,
  },
  ADD_SUBEVENT: {
    area: 'EVENTS',
    displayText: t`Add a sub-event to the selected event`,
  },
  ADD_COMMENT_EVENT: { area: 'EVENTS', displayText: t`Add a comment` },
  TOGGLE_EVENT_DISABLED: {
    area: 'EVENTS',
    displayText: t`Toggle disabled event`,
  },
  TOGGLE_CONDITION_INVERTED: {
    area: 'EVENTS',
    displayText: t`Toggle inverted condition`,
  },
  CHOOSE_AND_ADD_EVENT: {
    area: 'EVENTS',
    displayText: t`Choose and add an event...`,
  },
  MOVE_EVENTS_IN_NEW_GROUP: {
    area: 'EVENTS',
    displayText: t`Move events into a new group`,
  },
  EVENTS_EDITOR_UNDO: {
    area: 'EVENTS',
    displayText: t`Undo the last changes`,
    noShortcut: true,
  },
  EVENTS_EDITOR_REDO: {
    area: 'EVENTS',
    displayText: t`Redo the last changes`,
    noShortcut: true,
  },
  DELETE_SELECTION: {
    area: 'EVENTS',
    displayText: t`Delete the selected event(s)`,
    noShortcut: true,
  },
  SEARCH_EVENTS: {
    area: 'EVENTS',
    displayText: t`Search in events`,
    noShortcut: true,
  },
  OPEN_EXTENSION_SETTINGS: {
    area: 'EVENTS',
    displayText: t`Open extension settings`,
  },
};

export default commandsList;
