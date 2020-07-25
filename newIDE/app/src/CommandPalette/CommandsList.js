// @flow
import { t } from '@lingui/macro';

const CommandsList = {
  // General commands
  QUIT_APP: t`Close GDevelop`,
  OPEN_PROJECT_MANAGER: t`Open project manager`,
  LAUNCH_PREVIEW: t`Launch preview`,
  LAUNCH_DEBUG_PREVIEW: t`Launch preview with debugger and profiler`,
  OPEN_START_PAGE: t`Open start page`,
  CREATE_NEW_PROJECT: t`Create a new project`,
  OPEN_PROJECT: t`Open project`,
  SAVE_PROJECT: t`Save project`,
  SAVE_PROJECT_AS: t`Save project as...`,
  CLOSE_PROJECT: t`Close project`,
  EXPORT_GAME: t`Export game`,
  OPEN_RECENT_PROJECT: t`Open recent project...`,

  // Project manager commands
  OPEN_PROJECT_PROPERTIES: t`Open project properties`,
  OPEN_PROJECT_VARIABLES: t`Edit global variables`,
  OPEN_PLATFORM_SPECIFIC_ASSETS_DIALOG: t`Open project icons`,
  OPEN_PROJECT_RESOURCES: t`Open project resources`,

  // Tab-opening commands
  OPEN_LAYOUT: t`Open scene...`,
  OPEN_EXTERNAL_EVENTS: t`Open external events...`,
  OPEN_EXTERNAL_LAYOUT: t`Open external layout...`,
  OPEN_EXTENSION: t`Open extension...`,

  // Scene editor commands
  OPEN_SCENE_PROPERTIES: t`Open scene properties`,
  OPEN_SCENE_VARIABLES: t`Open scene variables`,

  // Scene editor toolbar commands
  OPEN_OBJECTS_PANEL: t`Open the objects editor`,
  OPEN_OBJECT_GROUPS_PANEL: t`Open the object groups editor`,
  OPEN_PROPERTIES_PANEL: t`Open the properties panel`,
  TOGGLE_INSTANCES_PANEL: t`Open the list of instances`,
  TOGGLE_LAYERS_PANEL: t`Open the layers editor`,
  SCENE_EDITOR_UNDO: t`Undo the last changes`,
  SCENE_EDITOR_REDO: t`Redo the last changes`,
  DELETE_INSTANCES: t`Delete the selected instances from the scene`,
  TOGGLE_WINDOW_MASK: t`Toggle mask`,
  TOGGLE_GRID: t`Toggle grid`,
  OPEN_SETUP_GRID: t`Setup grid`,

  // Layers list commands
  EDIT_LAYER_EFFECTS: t`Edit layer effects...`,

  // Objects list commands
  EDIT_OBJECT: t`Edit object...`,
  EDIT_OBJECT_VARIABLES: t`Edit object variables...`,

  // Object groups list commands
  EDIT_OBJECT_GROUP: t`Edit object group...`,

  // Events editor toolbar commands
  ADD_STANDARD_EVENT: t`Add a new empty event`,
  ADD_SUBEVENT: t`Add a sub-event to the selected event`,
  ADD_COMMENT_EVENT: t`Add a comment`,
  CHOOSE_AND_ADD_EVENT: t`Choose and add an event...`,
  EVENTS_EDITOR_UNDO: t`Undo the last changes`,
  EVENTS_EDITOR_REDO: t`Redo the last changes`,
  DELETE_SELECTION: t`Delete the selected event(s)`,
  SEARCH_EVENTS: t`Search in events`,
  OPEN_SETTINGS: t`Open settings`,
};

export default CommandsList;
export type CommandName = $Keys<typeof CommandsList>;
