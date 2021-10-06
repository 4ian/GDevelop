// @flow
import { Trans } from '@lingui/macro';
import React from 'react';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { getUserPublicProfile } from '../Utils/GDevelopServices/User';
import ProfileDetails from './ProfileDetails';

type Props = {|
  userId: string,
  onClose: () => void,
|};

export default ({ userId, onClose }: Props) => {
  const [profile, setProfile] = React.useState(null);
  React.useEffect(
    () => {
      setProfile(null);
      getUserPublicProfile(userId).then(profile => setProfile(profile));
    },
    [userId]
  );

  return (
    <Dialog
      open={true}
      actions={[
        <FlatButton
            key="close"
            label={<Trans>Close</Trans>}
            primary={false}
            onClick={onClose}
          />,
      ]}
    >
      <ProfileDetails profile={profile} />
    </Dialog>
  );
};
