// @flow
import { Trans } from '@lingui/macro';
import React from 'react';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import {
  getUserPublicProfile,
  getUserBadges,
  type UserPublicProfile,
} from '../Utils/GDevelopServices/User';
import { type Badge } from '../Utils/GDevelopServices/Badge';
import ProfileDetails from './ProfileDetails';

type Props = {|
  userId: string,
  onClose: () => void,
|};

const PublicProfileDialog = ({ userId, onClose }: Props) => {
  const [profile, setProfile] = React.useState<?UserPublicProfile>(null);
  const [badges, setBadges] = React.useState<?(Badge[])>(null);
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

  const fetchUserBadges = React.useCallback(
    async () => {
      if (!userId) return;
      setBadges(null);
      try {
        const badges = await getUserBadges(userId);
        setBadges(badges);
      } catch (error) {
        setError(error);
      }
    },
    [userId]
  );

  React.useEffect(
    () => {
      fetchProfile();
      fetchUserBadges();
    },
    [userId, fetchProfile, fetchUserBadges]
  );

  const onRetry = () => {
    setError(null);
    fetchProfile();
    fetchUserBadges();
  };

  return (
    <Dialog
      title={<Trans>User profile</Trans>}
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
      onRequestClose={onClose}
    >
      <ProfileDetails
        profile={profile}
        error={error}
        onRetry={onRetry}
        badges={badges}
      />
    </Dialog>
  );
};

export default PublicProfileDialog;
