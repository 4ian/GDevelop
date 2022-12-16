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
import {
  type PrivateAssetPackListingData,
  listSellerProducts,
} from '../Utils/GDevelopServices/Shop';
import ProfileDetails from './ProfileDetails';

type Props = {|
  userId: string,
  onClose: () => void,
|};

const PublicProfileDialog = ({ userId, onClose }: Props) => {
  const [profile, setProfile] = React.useState<?UserPublicProfile>(null);
  const [badges, setBadges] = React.useState<?(Badge[])>(null);
  const [packs, setPacks] = React.useState<?(PrivateAssetPackListingData[])>(
    null
  );
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

  const fetchUserPacks = React.useCallback(
    async () => {
      if (!userId) return;
      setPacks(null);
      try {
        // Will return an empty array if the user is not a seller.
        const packs = await listSellerProducts({
          sellerId: userId,
          productType: 'asset-pack',
        });
        setPacks(packs);
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
      fetchUserPacks();
    },
    [userId, fetchProfile, fetchUserBadges, fetchUserPacks]
  );

  const onRetry = () => {
    setError(null);
    fetchProfile();
    fetchUserBadges();
  };

  return (
    <Dialog
      title={null} // Specific case where the title is handled by the content.
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
        packs={packs}
      />
    </Dialog>
  );
};

export default PublicProfileDialog;
