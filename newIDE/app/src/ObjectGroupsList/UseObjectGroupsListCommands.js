// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { enumerateGroups } from '../ObjectsList/EnumerateObjects';
import { useCommandWithOptions } from '../CommandPalette/CommandHooks';

const editObjectGroupCommandText = t`Edit object group...`;

type Props = {
  project: gdProject,
  layout: gdLayout,
  onEditObjectGroup: (group: gdObjectGroup) => void,
};

const useObjectGroupsListCommands = (props: Props) => {
  const { project, layout, onEditObjectGroup } = props;

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
};

export default useObjectGroupsListCommands;
