// @flow
import { useCommand } from '../CommandPalette/CommandHooks';
import useObjectsListCommands from '../ObjectsList/UseObjectsListCommands';
import useObjectGroupsListCommands from '../ObjectGroupsList/UseObjectGroupsListCommands';
import useLayersListCommands from '../LayersList/UseLayersListCommands';

type Props = {|
  project: gdProject,
  layersContainer: gdLayersContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  onEditObject: (object: gdObject) => void,
  onEditObjectVariables: (object: gdObject) => void,
  onOpenSceneProperties: () => void,
  onEditObjectGroup: (group: gdObjectGroup) => void,
  onEditLayerEffects: (layer: gdLayer) => void,
  onEditLayer: (layer: gdLayer) => void,
|};

const UseSceneEditorCommands = (props: Props) => {
  const {
    project,
    layersContainer,
    globalObjectsContainer,
    objectsContainer,
    onEditObject,
    onEditObjectVariables,
    onOpenSceneProperties,
    onEditObjectGroup,
    onEditLayerEffects,
    onEditLayer,
  } = props;

  useCommand('OPEN_SCENE_PROPERTIES', true, {
    handler: onOpenSceneProperties,
  });

  useObjectsListCommands({
    project,
    globalObjectsContainer,
    objectsContainer,
    onEditObject,
    onEditObjectVariables,
  });

  useObjectGroupsListCommands({
    globalObjectsContainer,
    objectsContainer,
    onEditObjectGroup,
  });

  useLayersListCommands({
    layersContainer,
    onEditLayerEffects,
    onEditLayer,
  });

  return null;
};

export default UseSceneEditorCommands;
