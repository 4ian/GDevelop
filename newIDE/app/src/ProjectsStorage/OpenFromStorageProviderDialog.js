// @flow
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { type StorageProvider } from '.';
import { List } from '../UI/List';
import StorageProviderListItem from './StorageProviderListItem';
import AlertMessage from '../UI/AlertMessage';
import Computer from '../UI/CustomSvgIcons/Computer';
import { isNativeMobileApp } from '../Utils/Platform';
import optionalRequire from '../Utils/OptionalRequire';
const electron = optionalRequire('electron');

type Props = {|
  storageProviders: Array<StorageProvider>,
  onChooseProvider: StorageProvider => void,
  onClose: () => void,
|};

const fakeLocalFileStorageProvider: StorageProvider = {
  internalName: 'LocalFile',
  name: t`Open from computer with GDevelop desktop app`,
  disabled: true,
  renderIcon: props => <Computer fontSize={props.size} />,
  createOperations: () => ({}),
};

const OpenFromStorageProviderDialog = ({
  onClose,
  storageProviders,
  onChooseProvider,
}: Props) => {
  const isCloudStorageProviderEnabled = storageProviders.some(
    provider => provider.internalName === 'Cloud'
  );
  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Choose where to load the project from</Trans>}
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
          {isCloudStorageProviderEnabled && (
            <AlertMessage kind="info">
              <Trans>
                You can find your cloud projects in the Create section of the
                homepage.
              </Trans>
            </AlertMessage>
          )}
          <List useGap>
            {storageProviders
              .filter(storageProvider => !storageProvider.hiddenInOpenDialog)
              .map(storageProvider => (
                <React.Fragment key={storageProvider.internalName}>
                  <StorageProviderListItem
                    onChooseProvider={onChooseProvider}
                    storageProvider={storageProvider}
                  />
                </React.Fragment>
              ))}
            {!electron && !isNativeMobileApp() && (
              <StorageProviderListItem
                onChooseProvider={onChooseProvider}
                storageProvider={fakeLocalFileStorageProvider}
              />
            )}
          </List>
        </Dialog>
      )}
    </I18n>
  );
};

export default OpenFromStorageProviderDialog;
