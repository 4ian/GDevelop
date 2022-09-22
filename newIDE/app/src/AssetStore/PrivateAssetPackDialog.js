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

type Props = {|
  privateAssetPack: PrivateAssetPackListingData,
  onClose: () => void,
|};

const PrivateAssetPackDialog = ({
  privateAssetPack: { id, name, description },
  onClose,
}: Props) => {
  const [
    assetPackDetails,
    setAssetPackDetails,
  ] = React.useState<?PrivateAssetPackDetails>(null);
  const [isFetchingDetails, setIsFetchingDetails] = React.useState<boolean>(
    false
  );
  const [errorText, setErrorText] = React.useState<?string>(null);
  React.useEffect(
    () => {
      (async () => {
        setIsFetchingDetails(true);
        try {
          const details = await getPrivateAssetPackDetails(id);
          setAssetPackDetails(details);
        } catch (error) {
          if (error.status === 404) {
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
    [id]
  );
  return (
    <Dialog
      maxWidth="md"
      title={name}
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
          <Text>${errorText}</Text>
        </AlertMessage>
      ) : isFetchingDetails ? (
        <PlaceholderLoader />
      ) : (
        <>
          <Text>{description}</Text>
          {assetPackDetails && <Text>{assetPackDetails.longDescription}</Text>}
        </>
      )}
    </Dialog>
  );
};

export default PrivateAssetPackDialog;
