// @flow
import * as React from 'react';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';
import {
  getPrivateAssetPackDetails,
  type PrivateAssetPackDetails,
} from '../Utils/GDevelopServices/Asset';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';
import Dialog from '../UI/Dialog';
import TextButton from '../UI/TextButton';
import AlertMessage from '../UI/AlertMessage';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import { Column } from '../UI/Grid';
import {
  getUserPublicProfile,
  type UserPublicProfile,
} from '../Utils/GDevelopServices/User';
import PublicProfileDialog from '../Profile/PublicProfileDialog';
import Link from '../UI/Link';

type Props = {|
  privateAssetPack: PrivateAssetPackListingData,
  onClose: () => void,
|};

const PrivateAssetPackDialog = ({
  privateAssetPack: { id, name, description, sellerId },
  onClose,
}: Props) => {
  const [
    assetPackDetails,
    setAssetPackDetails,
  ] = React.useState<?PrivateAssetPackDetails>(null);
  const [isFetchingDetails, setIsFetchingDetails] = React.useState<boolean>(
    false
  );
  const [
    openSellerPublicProfileDialog,
    setOpenSellerPublicProfileDialog,
  ] = React.useState<boolean>(false);
  const [
    sellerPublicProfile,
    setSellerPublicProfile,
  ] = React.useState<?UserPublicProfile>(null);
  const [errorText, setErrorText] = React.useState<?string>(null);
  React.useEffect(
    () => {
      (async () => {
        setIsFetchingDetails(true);
        try {
          const details = await getPrivateAssetPackDetails(id);
          const profile = await getUserPublicProfile(sellerId);
          setAssetPackDetails(details);
          setSellerPublicProfile(profile);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setErrorText(
              'Asset pack not found - An error occurred, please try again later.'
            );
          } else {
            setErrorText('Unknown error');
          }
        } finally {
          setIsFetchingDetails(false);
        }
      })();
    },
    [id, sellerId]
  );

  return (
    <>
      <Dialog
        maxWidth="md"
        open
        onRequestClose={onClose}
        actions={[
          <TextButton
            key="cancel"
            label={<Trans>Cancel</Trans>}
            onClick={onClose}
          />,
        ]}
        onApply={() => {}}
        flexColumnBody
        fullHeight
      >
        {errorText ? (
          <AlertMessage kind="error">
            <Text>{errorText}</Text>
          </AlertMessage>
        ) : isFetchingDetails ? (
          <PlaceholderLoader />
        ) : assetPackDetails && sellerPublicProfile ? (
          <>
            <Column noMargin>
              <Text size="title">{name}</Text>
              <Text size="body2">
                <Trans>by</Trans>{' '}
                <Link
                  onClick={() => setOpenSellerPublicProfileDialog(true)}
                  href=""
                >
                  {sellerPublicProfile.username || ''}
                </Link>
              </Text>
            </Column>
            <ResponsiveLineStackLayout noColumnMargin noMargin>
              <Column useFullHeight expand>
                Salut
              </Column>
              <Column useFullHeight expand>
                {assetPackDetails && (
                  <Text>{assetPackDetails.longDescription}</Text>
                )}
              </Column>
            </ResponsiveLineStackLayout>
          </>
        ) : null}
      </Dialog>
      {openSellerPublicProfileDialog && (
        <PublicProfileDialog
          userId={sellerId}
          onClose={() => setOpenSellerPublicProfileDialog(false)}
        />
      )}
    </>
  );
};

export default PrivateAssetPackDialog;
