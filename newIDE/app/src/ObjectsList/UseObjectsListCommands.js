// @flow
import * as React from 'react';
import { enumerateObjects } from './EnumerateObjects';
import { useCommandWithOptions } from '../CommandPalette/CommandHooks';
import { type CommandOption } from '../CommandPalette/CommandManager';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';

const generateLayoutObjectsOptions = (
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  onChoose: (object: gdObject, arg: ?string) => void,
  onChooseArg: ?string
): Array<CommandOption> => {
  return enumerateObjects(
    globalObjectsContainer,
    objectsContainer
  ).containerObjectsList.map(item => ({
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
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,
  onEditObject: (object: gdObject, initialTab: ?string) => void,
  onEditObjectVariables: (object: gdObject) => void,
|};

const useObjectsListCommands = (props: Props) => {
  const {
    project,
    globalObjectsContainer,
    objectsContainer,
    onEditObject,
    onEditObjectVariables,
  } = props;
  useCommandWithOptions('EDIT_OBJECT', true, {
    generateOptions: React.useCallback(
      () =>
        generateLayoutObjectsOptions(
          project,
          globalObjectsContainer,
          objectsContainer,
          onEditObject
        ),
      [project, globalObjectsContainer, objectsContainer, onEditObject]
    ),
  });

  useCommandWithOptions('EDIT_OBJECT_BEHAVIORS', true, {
    generateOptions: React.useCallback(
      () =>
        generateLayoutObjectsOptions(
          project,
          globalObjectsContainer,
          objectsContainer,
          onEditObject,
          'behaviors'
        ),
      [project, globalObjectsContainer, objectsContainer, onEditObject]
    ),
  });

  useCommandWithOptions('EDIT_OBJECT_EFFECTS', true, {
    generateOptions: React.useCallback(
      () =>
        generateLayoutObjectsOptions(
          project,
          globalObjectsContainer,
          objectsContainer,
          onEditObject,
          'effects'
        ),
      [project, globalObjectsContainer, objectsContainer, onEditObject]
    ),
  });

  useCommandWithOptions('EDIT_OBJECT_VARIABLES', true, {
    generateOptions: React.useCallback(
      () =>
        generateLayoutObjectsOptions(
          project,
          globalObjectsContainer,
          objectsContainer,
          onEditObjectVariables
        ),
      [project, globalObjectsContainer, objectsContainer, onEditObjectVariables]
    ),
  });
};

export default useObjectsListCommands;
