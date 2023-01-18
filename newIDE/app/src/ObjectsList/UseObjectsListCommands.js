// @flow
import * as React from 'react';
import { enumerateObjects } from './EnumerateObjects';
import { useCommandWithOptions } from '../CommandPalette/CommandHooks';
import { type CommandOption } from '../CommandPalette/CommandManager';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';

const generateLayoutObjectsOptions = (
  project: gdProject,
  layout: gdLayout,
  onChoose: (object: gdObject, arg: ?string) => void,
  onChooseArg: ?string
): Array<CommandOption> => {
  return enumerateObjects(project, layout).containerObjectsList.map(item => ({
    text: item.object.getName(),
    handler: () => onChoose(item.object, onChooseArg),
    iconSrc: ObjectsRenderingService.getThumbnail.bind(ObjectsRenderingService)(
      project,
      item.object.getConfiguration()
    ),
  }));
};

type Props = {|
  project: gdProject,
  layout: gdLayout,
  onEditObject: (object: gdObject, initialTab: ?string) => void,
  onEditObjectVariables: (object: gdObject) => void,
|};

const useObjectsListCommands = (props: Props) => {
  const { project, layout, onEditObject, onEditObjectVariables } = props;
  useCommandWithOptions('EDIT_OBJECT', true, {
    generateOptions: React.useCallback(
      () => generateLayoutObjectsOptions(project, layout, onEditObject),
      [project, layout, onEditObject]
    ),
  });

  useCommandWithOptions('EDIT_OBJECT_BEHAVIORS', true, {
    generateOptions: React.useCallback(
      () =>
        generateLayoutObjectsOptions(
          project,
          layout,
          onEditObject,
          'behaviors'
        ),
      [project, layout, onEditObject]
    ),
  });

  useCommandWithOptions('EDIT_OBJECT_EFFECTS', true, {
    generateOptions: React.useCallback(
      () =>
        generateLayoutObjectsOptions(project, layout, onEditObject, 'effects'),
      [project, layout, onEditObject]
    ),
  });

  useCommandWithOptions('EDIT_OBJECT_VARIABLES', true, {
    generateOptions: React.useCallback(
      () =>
        generateLayoutObjectsOptions(project, layout, onEditObjectVariables),
      [project, layout, onEditObjectVariables]
    ),
  });
};

export default useObjectsListCommands;
