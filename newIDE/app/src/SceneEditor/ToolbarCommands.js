// @flow
import { t } from '@lingui/macro';
import { useCommand } from '../CommandPalette/CommandHooks';

const openObjectsListCommandText = t`Open the objects editor`;
const openObjectGroupsListCommandText = t`Open the object groups editor`;
const openPropertiesPanelCommandText = t`Open the properties panel`;
const toggleInstancesPanelCommandText = t`Open the list of instances`;
const toggleLayersPanelCommandText = t`Open the layers editor`;
const undoCommandText = t`Undo the last changes`;
const redoCommandText = t`Redo the last changes`;
const deleteSelectionCommandText = t`Delete the selected instances from the scene`;
const toggleWindowMaskCommandText = t`Toggle mask`;
const toggleGridCommandText = t`Toggle grid`;
const setupGridCommandText = t`Setup grid`;

type Props = {
  openObjectsList: () => void,
  openObjectGroupsList: () => void,
  openPropertiesPanel: () => void,
  toggleInstancesList: () => void,
  toggleLayersList: () => void,
  undo: () => void,
  canUndo: boolean,
  redo: () => void,
  canRedo: boolean,
  deleteSelection: () => void,
  canDeleteSelection: boolean,
  toggleWindowMask: () => void,
  toggleGrid: () => void,
  setupGrid: () => void,
};

const ToolbarCommands = (props: Props) => {
  useCommand('OPEN_OBJECTS_PANEL', {
    displayText: openObjectsListCommandText,
    enabled: true,
    handler: props.openObjectsList,
  });

  useCommand('OPEN_OBJECT_GROUPS_PANEL', {
    displayText: openObjectGroupsListCommandText,
    enabled: true,
    handler: props.openObjectGroupsList,
  });

  useCommand('OPEN_PROPERTIES_PANEL', {
    displayText: openPropertiesPanelCommandText,
    enabled: true,
    handler: props.openPropertiesPanel,
  });

  useCommand('TOGGLE_INSTANCES_PANEL', {
    displayText: toggleInstancesPanelCommandText,
    enabled: true,
    handler: props.toggleInstancesList,
  });

  useCommand('TOGGLE_LAYERS_PANEL', {
    displayText: toggleLayersPanelCommandText,
    enabled: true,
    handler: props.toggleLayersList,
  });

  useCommand('UNDO', {
    displayText: undoCommandText,
    enabled: props.canUndo,
    handler: props.undo,
  });

  useCommand('REDO', {
    displayText: redoCommandText,
    enabled: props.canRedo,
    handler: props.redo,
  });

  useCommand('DELETE_INSTANCES', {
    displayText: deleteSelectionCommandText,
    enabled: props.canDeleteSelection,
    handler: props.deleteSelection,
  });

  useCommand('TOGGLE_WINDOW_MASK', {
    displayText: toggleWindowMaskCommandText,
    enabled: true,
    handler: props.toggleWindowMask,
  });

  useCommand('TOGGLE_GRID', {
    displayText: toggleGridCommandText,
    enabled: true,
    handler: props.toggleGrid,
  });

  useCommand('OPEN_SETUP_GRID', {
    displayText: setupGridCommandText,
    enabled: true,
    handler: props.setupGrid,
  });

  return null;
};

export default ToolbarCommands;
