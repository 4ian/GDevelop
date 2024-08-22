// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import TeamContext from '../../../../Profile/Team/TeamContext';
import Dialog from '../../../../UI/Dialog';
import Text from '../../../../UI/Text';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import UserLine from '../../../../UI/User/UserLine';
import { Divider } from '@material-ui/core';

type Props = {|
  onClose: () => void,
|};

const ManageEducationAccountDialog = ({ onClose }: Props) => {
  const { profile } = React.useContext(AuthenticatedUserContext);
  const {
    groups,
    team,
    admins,
    members,
    memberships,
    onRefreshMembers,
  } = React.useContext(TeamContext);

  if (!admins || !members || !team || !groups) return null;

  return (
    <Dialog
      title={<Trans>Manage seats</Trans>}
      flexColumnBody
      fullHeight
      open
      onRequestClose={onClose}
    >
      <Text size="sub-title">
        <Trans>Teacher accounts</Trans>
      </Text>
      {admins &&
        admins.map(adminUser => (
          <UserLine
            username={adminUser.username}
            email={adminUser.email}
            level={null}
            onDelete={null}
            disabled={profile && adminUser.id === profile.id}
          />
        ))}
      <Divider />
      <Text size="sub-title">
        <Trans>Student accounts</Trans>
      </Text>
    </Dialog>
  );
};

export default ManageEducationAccountDialog;
