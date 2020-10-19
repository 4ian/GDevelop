// @flow
import { useCommand } from '../CommandPalette/CommandHooks';
import useObjectsListCommands from '../ObjectsList/UseObjectsListCommands';
import useObjectGroupsListCommands from '../ObjectGroupsList/UseObjectGroupsListCommands';
import useLayersListCommands from '../LayersList/UseLayersListCommands';

type Props = {|
  project: gdProject,
  layout: gdLayout,
  onEditObject: (object: gdObject) => void,
  onEditObjectVariables: (object: gdObject) => void,
  onOpenSceneProperties: () => void,
  onOpenSceneVariables: () => void,
  onEditObjectGroup: (group: gdObjectGroup) => void,
  onEditLayerEffects: (layer: gdLayer) => void,
  onEditLightingLayer: (layer: gdLayer) => void,
|};

const UseSceneEditorCommands = (props: Props) => {
  const {
    project,
    layout,
    onEditObject,
    onEditObjectVariables,
    onOpenSceneProperties,
    onOpenSceneVariables,
    onEditObjectGroup,
    onEditLayerEffects,
    onEditLightingLayer,
  } = props;

  useCommand('OPEN_SCENE_PROPERTIES', true, {
    handler: onOpenSceneProperties,
  });

  useCommand('OPEN_SCENE_VARIABLES', true, {
    handler: onOpenSceneVariables,
  });

  useObjectsListCommands({
    project,
    layout,
    onEditObject,
    onEditObjectVariables,
  });

  useObjectGroupsListCommands({
    project,
    layout,
    onEditObjectGroup,
  });

  useLayersListCommands({
    layout,
    onEditLayerEffects,
    onEditLightingLayer,
  });

  return null;
};

export default UseSceneEditorCommands;
