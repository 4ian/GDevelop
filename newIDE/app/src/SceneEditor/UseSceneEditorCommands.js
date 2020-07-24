// @flow
import { t } from '@lingui/macro';
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
  });

  return null;
};

export default UseSceneEditorCommands;
