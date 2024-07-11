// @flow
import * as React from 'react';
import { enumerateGroups } from '../ObjectsList/EnumerateObjects';
import { useCommandWithOptions } from '../CommandPalette/CommandHooks';

type Props = {|
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: ?gdObjectsContainer,
  onEditObjectGroup: (group: gdObjectGroup) => void,
|};

const useObjectGroupsListCommands = (props: Props) => {
  const { globalObjectsContainer, objectsContainer, onEditObjectGroup } = props;

  useCommandWithOptions('EDIT_OBJECT_GROUP', true, {
    generateOptions: React.useCallback(
      () =>
        [
          ...(objectsContainer
            ? enumerateGroups(objectsContainer.getObjectGroups())
            : []),
          ...(globalObjectsContainer
            ? enumerateGroups(globalObjectsContainer.getObjectGroups())
            : []),
        ].map(group => ({
          text: group.getName(),
          handler: () => onEditObjectGroup(group),
        })),
      [onEditObjectGroup, globalObjectsContainer, objectsContainer]
    ),
  });
};

export default useObjectGroupsListCommands;
