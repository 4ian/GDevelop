// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import {
  useCommand,
  useCommandWithOptions,
} from '../CommandPalette/CommandHooks';
import { type CommandOption } from '../CommandPalette/CommandManager';
import { mapReverseFor } from '../Utils/MapFor';
import {
  enumerateObjects,
  enumerateGroups,
} from '../ObjectsList/EnumerateObjects';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';

const editObjectCommandText = t`Edit object...`;
const editObjectVariablesCommandText = t`Edit object variables...`;
const openScenePropertiesCommandText = t`Open scene properties`;
const openSceneVariablesCommandText = t`Open scene variables`;
const editObjectGroupCommandText = t`Edit object group...`;
const editLayerEffectsCommandText = t`Edit layer effects...`;

/**
 * Helper function to generate options list
 */
const generateLayoutObjectsOptions = (
  project: gdProject,
  layout: gdLayout,
  onChoose: (object: gdObject) => void
): Array<CommandOption<gdObject>> => {
  return enumerateObjects(project, layout).containerObjectsList.map(item => ({
    text: item.object.getName(),
    value: item.object,
    handler: () => onChoose(item.object),
    iconSrc: ObjectsRenderingService.getThumbnail.bind(ObjectsRenderingService)(
      project,
      item.object
    ),
  }));
};

type Props = {
  project: gdProject,
  layout: gdLayout,
  onEditObject: (object: gdObject) => void,
  onEditObjectVariables: (object: gdObject) => void,
  onOpenSceneProperties: () => void,
  onOpenSceneVariables: () => void,
  onEditObjectGroup: (group: gdObjectGroup) => void,
  onEditLayerEffects: (layer: gdLayer) => void,
};

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

  useCommand('OPEN_SCENE_PROPERTIES', {
    displayText: openScenePropertiesCommandText,
    enabled: true,
    handler: onOpenSceneProperties,
  });

  useCommand('OPEN_SCENE_VARIABLES', {
    displayText: openSceneVariablesCommandText,
    enabled: true,
    handler: onOpenSceneVariables,
  });

  useCommandWithOptions('EDIT_OBJECT', {
    displayText: editObjectCommandText,
    enabled: true,
    generateOptions: React.useCallback(
      () => generateLayoutObjectsOptions(project, layout, onEditObject),
      [project, layout, onEditObject]
    ),
  });

  useCommandWithOptions('EDIT_OBJECT_VARIABLES', {
    displayText: editObjectVariablesCommandText,
    enabled: true,
    generateOptions: React.useCallback(
      () =>
        generateLayoutObjectsOptions(project, layout, onEditObjectVariables),
      [project, layout, onEditObjectVariables]
    ),
  });

  useCommandWithOptions('EDIT_OBJECT_GROUP', {
    displayText: editObjectGroupCommandText,
    enabled: true,
    generateOptions: React.useCallback(
      () =>
        [
          ...enumerateGroups(layout.getObjectGroups()),
          ...enumerateGroups(project.getObjectGroups()),
        ].map(group => ({
          text: group.getName(),
          value: group,
          handler: () => onEditObjectGroup(group),
        })),
      [onEditObjectGroup, project, layout]
    ),
  });

  useCommandWithOptions('EDIT_LAYER_EFFECTS', {
    displayText: editLayerEffectsCommandText,
    enabled: true,
    generateOptions: React.useCallback(
      () => {
        const layersCount = layout.getLayersCount();
        return mapReverseFor(0, layersCount, i => {
          const layer = layout.getLayerAt(i);
          return {
            value: layer,
            text: layer.getName() || 'Base layer',
            handler: () => onEditLayerEffects(layer),
          };
        });
      },
      [layout, onEditLayerEffects]
    ),
  });

  return null;
};

export default UseSceneEditorCommands;
