// @flow

import * as React from 'react';

import { type User } from '../../../../Utils/GDevelopServices/User';
import { ListItem } from '@material-ui/core';
import { LineStackLayout } from '../../../../UI/Layout';
import Text from '../../../../UI/Text';
import DragHandle from '../../../../UI/DragHandle';
import FlatButton from '../../../../UI/FlatButton';
import { Trans } from '@lingui/macro';
import LeftLoader from '../../../../UI/LeftLoader';
import { makeDragSourceAndDropTarget } from '../../../../UI/DragAndDrop/DragSourceAndDropTarget';

const styles = {
  listItem: {
    padding: '4px 10px',
    borderRadius: 8,
    overflowWrap: 'anywhere', // Ensure everything is wrapped on small devices.
  },
};

const DragSourceAndDropTarget = makeDragSourceAndDropTarget<{}>('team-groups');

type Props = {|
  member: User,
  onListUserProjects: User => Promise<void>,
  disabled: boolean,
  isLoading: boolean,
  onDrag: (user: User) => void,
|};

const TeamMemberRow = ({
  member,
  onListUserProjects,
  disabled,
  isLoading,
  onDrag,
}: Props) => {
  return (
    <DragSourceAndDropTarget
      canDrop={() => false}
      beginDrag={() => {
        onDrag(member);
        return {
          name: member.id,
          thumbnail: <Text>{member.username || member.email}</Text>,
        };
      }}
      drop={() => {}}
    >
      {({ connectDragSource, connectDragPreview }) => {
        return (
          <ListItem style={styles.listItem}>
            <LineStackLayout
              noMargin
              alignItems="center"
              justifyContent="space-between"
              expand
            >
              <LineStackLayout noMargin alignItems="center">
                {connectDragSource(
                  <div>
                    <DragHandle />
                  </div>
                )}
                {connectDragPreview(
                  <div>
                    <LineStackLayout noMargin alignItems="center">
                      {member.username && (
                        <Text allowSelection noMargin>
                          {member.username}
                        </Text>
                      )}
                      <Text allowSelection noMargin color="secondary">
                        {member.email}
                      </Text>
                    </LineStackLayout>
                  </div>
                )}
              </LineStackLayout>
              <LeftLoader isLoading={isLoading}>
                <FlatButton
                  disabled={disabled}
                  label={<Trans>See projects</Trans>}
                  onClick={() => onListUserProjects(member)}
                />
              </LeftLoader>
            </LineStackLayout>
          </ListItem>
        );
      }}
    </DragSourceAndDropTarget>
  );
};

export default TeamMemberRow;
