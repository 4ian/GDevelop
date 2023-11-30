// @flow
import { Trans } from '@lingui/macro';
import React from 'react';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import {
  getUserPublicProfile,
  type UserPublicProfile,
} from '../Utils/GDevelopServices/User';
import {
  type PrivateAssetPackListingData,
  listSellerAssetPacks,
} from '../Utils/GDevelopServices/Shop';
import ProfileDetails from './ProfileDetails';

type Props = {|
  userId: string,
  onClose: () => void,
  onAssetPackOpen?: (assetPack: PrivateAssetPackListingData) => void,
|};

const PublicProfileDialog = ({ userId, onClose, onAssetPackOpen }: Props) => {
  const [profile, setProfile] = React.useState<?UserPublicProfile>(null);
  const [
    assetPacksListingDatas,
    setAssetPacksListingDatas,
  ] = React.useState<?(PrivateAssetPackListingData[])>(null);
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
      setAssetPacksListingDatas(null);
      try {
        // Will return an empty array if the user is not a seller.
        const packs = await listSellerAssetPacks({
          sellerId: userId,
        });
        setAssetPacksListingDatas(packs);
      } catch (error) {
        setError(error);
      }
    },
    [userId]
  );

  React.useEffect(
    () => {
      fetchProfile();
      fetchUserPacks();
    },
    [userId, fetchProfile, fetchUserPacks]
  );

  const onRetry = () => {
    setError(null);
    fetchProfile();
  };

  const dialogSize =
    assetPacksListingDatas && assetPacksListingDatas.length > 4 ? 'md' : 'sm';

  return (
    <Dialog
      title={null} // Specific case where the title is handled by the content.
      open
      maxWidth={dialogSize}
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
        assetPacksListingDatas={assetPacksListingDatas}
        onAssetPackOpen={onAssetPackOpen}
      />
    </Dialog>
  );
};

export default PublicProfileDialog;
