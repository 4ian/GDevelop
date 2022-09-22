// @flow
import * as React from 'react';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';
import Text from '../UI/Text';
import { Trans } from '@lingui/macro';
import Dialog from '../UI/Dialog';
import TextButton from '../UI/TextButton';

type Props = {|
  privateAssetPack: PrivateAssetPackListingData,
  onClose: () => void,
|};

const PrivateAssetPackDialog = ({ privateAssetPack, onClose }: Props) => {
  return (
    <Dialog
      maxWidth="md"
      title={privateAssetPack.name}
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
    >
      <Text>{privateAssetPack.description}</Text>
    </Dialog>
  );
};

export default PrivateAssetPackDialog;
