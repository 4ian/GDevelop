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

const styles = {
  listItem: {
    padding: '4px 10px',
    borderRadius: 8,
    overflowWrap: 'anywhere', // Ensure everything is wrapped on small devices.
  },
};

type Props = {|
  member: User,
  onListUserProjects: User => Promise<void>,
  disabled: boolean,
  isLoading: boolean,
|};

const TeamMemberRow = ({
  member,
  onListUserProjects,
  disabled,
  isLoading,
}: Props) => {
  return (
    <ListItem style={styles.listItem}>
      <LineStackLayout
        noMargin
        alignItems="center"
        justifyContent="space-between"
        expand
      >
        <LineStackLayout noMargin alignItems="center">
          <DragHandle />
          <Text allowSelection noMargin>
            {member.username || member.email}
          </Text>
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
};

export default TeamMemberRow;
