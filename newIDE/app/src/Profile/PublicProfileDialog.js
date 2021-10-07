// @flow
import { Trans } from '@lingui/macro';
import React from 'react';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import {
  getUserPublicProfile,
  type UserPublicProfile,
} from '../Utils/GDevelopServices/User';
import ProfileDetails from './ProfileDetails';

type Props = {|
  userId: string,
  onClose: () => void,
|};

const PublicProfileDialog = ({ userId, onClose }: Props) => {
  const [profile, setProfile] = React.useState<?UserPublicProfile>(null);
  const [error, setError] = React.useState<?Error>(null);

  const fetchProfile = React.useCallback(
    async () => {
      if (!userId) return;
      setProfile(null);
      try {
        const profile = await getUserPublicProfile(userId);
        setProfile(profile);
      } catch (error) {
        setError(error);
      }
    },
    [userId]
  );

  React.useEffect(
    () => {
      fetchProfile();
    },
    [userId, fetchProfile]
  );

  const onRetry = () => {
    setError(null);
    fetchProfile();
  };

  return (
    <Dialog
      open={true}
      maxWidth="sm"
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary={false}
          onClick={onClose}
        />,
      ]}
    >
      <ProfileDetails profile={profile} error={error} onRetry={onRetry} />
    </Dialog>
  );
};

export default PublicProfileDialog;
