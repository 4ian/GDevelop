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

type Props = {|
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
|};

const ToolbarCommands = (props: Props) => {
  useCommand('OPEN_OBJECTS_PANEL', true, {
    displayText: openObjectsListCommandText,
    handler: props.openObjectsList,
  });

  useCommand('OPEN_OBJECT_GROUPS_PANEL', true, {
    displayText: openObjectGroupsListCommandText,
    handler: props.openObjectGroupsList,
  });

  useCommand('OPEN_PROPERTIES_PANEL', true, {
    displayText: openPropertiesPanelCommandText,
    handler: props.openPropertiesPanel,
  });

  useCommand('TOGGLE_INSTANCES_PANEL', true, {
    displayText: toggleInstancesPanelCommandText,
    handler: props.toggleInstancesList,
  });

  useCommand('TOGGLE_LAYERS_PANEL', true, {
    displayText: toggleLayersPanelCommandText,
    handler: props.toggleLayersList,
  });

  useCommand('UNDO', props.canUndo, {
    displayText: undoCommandText,
    handler: props.undo,
  });

  useCommand('REDO', props.canRedo, {
    displayText: redoCommandText,
    handler: props.redo,
  });

  useCommand('DELETE_INSTANCES', props.canDeleteSelection, {
    displayText: deleteSelectionCommandText,
    handler: props.deleteSelection,
  });

  useCommand('TOGGLE_WINDOW_MASK', true, {
    displayText: toggleWindowMaskCommandText,
    handler: props.toggleWindowMask,
  });

  useCommand('TOGGLE_GRID', true, {
    displayText: toggleGridCommandText,
    handler: props.toggleGrid,
  });

  useCommand('OPEN_SETUP_GRID', true, {
    displayText: setupGridCommandText,
    handler: props.setupGrid,
  });

  return null;
};

export default ToolbarCommands;
