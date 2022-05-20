// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { type StorageProvider } from '.';
import { List, ListItem } from '../UI/List';

type Props = {|
  storageProviders: Array<StorageProvider>,
  onChooseProvider: StorageProvider => void,
  onClose: () => void,
|};

const SaveToStorageProviderDialog = ({ onClose, storageProviders, onChooseProvider }: Props) => {
  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Choose where to save the project to</Trans>}
          onRequestClose={onClose}
          actions={[
            <FlatButton
              label={<Trans>Cancel</Trans>}
              key="close"
              primary={false}
              onClick={onClose}
            />,
          ]}
          cannotBeDismissed={true}
          open
          noMargin
          maxWidth="sm"
        >
          <List>
            {storageProviders
              .filter(storageProvider => !storageProvider.hiddenInSaveDialog)
              .map(storageProvider => (
                <ListItem
                  key={storageProvider.internalName}
                  disabled={!!storageProvider.disabled}
                  primaryText={i18n._(storageProvider.name)}
                  leftIcon={
                    storageProvider.renderIcon
                      ? storageProvider.renderIcon()
                      : undefined
                  }
                  onClick={() => onChooseProvider(storageProvider)}
                />
              ))}
          </List>
        </Dialog>
      )}
    </I18n>
  );
};

export default SaveToStorageProviderDialog;
