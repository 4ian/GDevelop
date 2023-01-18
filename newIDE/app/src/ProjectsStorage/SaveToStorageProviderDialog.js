// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { List } from '../UI/List';

import StorageProviderListItem from './StorageProviderListItem';
import { type StorageProvider } from '.';

type Props = {|
  storageProviders: Array<StorageProvider>,
  onChooseProvider: StorageProvider => void,
  onClose: () => void,
|};

const SaveToStorageProviderDialog = ({
  onClose,
  storageProviders,
  onChooseProvider,
}: Props) => {
  return (
    <Dialog
      title={<Trans>Choose where to save the project to</Trans>}
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          key="close"
          primary={false}
          onClick={onClose}
        />,
      ]}
      onRequestClose={onClose}
      open
      maxWidth="sm"
    >
      <List useGap>
        {storageProviders
          .filter(storageProvider => !storageProvider.hiddenInSaveDialog)
          .map(storageProvider => (
            <StorageProviderListItem
              key={storageProvider.internalName}
              onChooseProvider={onChooseProvider}
              storageProvider={storageProvider}
            />
          ))}
      </List>
    </Dialog>
  );
};

export default SaveToStorageProviderDialog;
