// @flow
export const OPEN_OBJECTS_PANEL_BUTTON_ID = 'toolbar-open-objects-panel-button';
export const OPEN_OBJECT_GROUPS_PANEL_BUTTON_ID =
  'toolbar-open-object-groups-panel-button';
export const OPEN_PROPERTIES_PANEL_BUTTON_ID =
  'toolbar-open-properties-panel-button';
export const OPEN_INSTANCES_PANEL_BUTTON_ID =
  'toolbar-open-instances-list-panel-button';
export const OPEN_LAYERS_PANEL_BUTTON_ID = 'toolbar-open-layers-panel-button';
export const TOOLBAR_COMMON_FORMATTED_BUTTON_IDS = [
  `#${OPEN_OBJECTS_PANEL_BUTTON_ID}`,
  `#${OPEN_OBJECT_GROUPS_PANEL_BUTTON_ID}`,
  `#${OPEN_PROPERTIES_PANEL_BUTTON_ID}`,
  `#${OPEN_INSTANCES_PANEL_BUTTON_ID}`,
  `#${OPEN_LAYERS_PANEL_BUTTON_ID}`,
];

export type EditorId =
  | 'objects-list'
  | 'properties'
  | 'object-groups-list'
  | 'instances-list'
  | 'layers-list';
