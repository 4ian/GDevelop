// @flow
import { useCommand } from '../CommandPalette/CommandHooks';

type Props = {|
  toggleObjectsList: () => void,
  toggleObjectGroupsList: () => void,
  togglePropertiesPanel: () => void,
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
  canRenameObject: boolean,
  onRenameObject: () => void,
|};

const ToolbarCommands = (props: Props) => {
  useCommand('OPEN_OBJECTS_PANEL', true, {
    handler: props.toggleObjectsList,
  });

  useCommand('OPEN_OBJECT_GROUPS_PANEL', true, {
    handler: props.toggleObjectGroupsList,
  });

  useCommand('OPEN_PROPERTIES_PANEL', true, {
    handler: props.togglePropertiesPanel,
  });

  useCommand('TOGGLE_INSTANCES_PANEL', true, {
    handler: props.toggleInstancesList,
  });

  useCommand('TOGGLE_LAYERS_PANEL', true, {
    handler: props.toggleLayersList,
  });

  useCommand('SCENE_EDITOR_UNDO', props.canUndo, {
    handler: props.undo,
  });

  useCommand('SCENE_EDITOR_REDO', props.canRedo, {
    handler: props.redo,
  });

  useCommand('DELETE_INSTANCES', props.canDeleteSelection, {
    handler: props.deleteSelection,
  });

  useCommand('TOGGLE_WINDOW_MASK', true, {
    handler: props.toggleWindowMask,
  });

  useCommand('TOGGLE_GRID', true, {
    handler: props.toggleGrid,
  });

  useCommand('OPEN_SETUP_GRID', true, {
    handler: props.setupGrid,
  });

  useCommand('RENAME_SCENE_OBJECT', props.canRenameObject, {
    handler: props.onRenameObject,
  });

  return null;
};

export default ToolbarCommands;
