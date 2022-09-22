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
  React.useEffect(
    () => {
      (async () => {
        setIsFetchingDetails(true);
        // TODO: handle 404 or any other error
        const details = await getPrivateAssetPackDetails(id);
        setAssetPackDetails(details);
        setIsFetchingDetails(false);
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
    >
      <Text>{description}</Text>
      {assetPackDetails && <Text>{assetPackDetails.longDescription}</Text>}
    </Dialog>
  );
};

export default PrivateAssetPackDialog;
