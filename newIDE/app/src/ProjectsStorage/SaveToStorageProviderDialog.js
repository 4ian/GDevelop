// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { List } from '../UI/List';

import StorageProviderListItem from './StorageProviderListItem';
import { type StorageProvider } from '.';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  checkIfHasTooManyCloudProjects,
  MaxProjectCountAlertMessage,
} from '../MainFrame/EditorContainers/HomePage/CreateSection/MaxProjectCountAlertMessage';

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
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const { profile, cloudProjects } = authenticatedUser;

  const isLoadingCloudProjects = !!profile && !cloudProjects;
  const isCloudProjectsMaximumReached = checkIfHasTooManyCloudProjects(
    authenticatedUser
  );

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
            <React.Fragment key={storageProvider.internalName}>
              <StorageProviderListItem
                onChooseProvider={onChooseProvider}
                storageProvider={storageProvider}
                disabled={
                  storageProvider.internalName === 'Cloud' &&
                  (isCloudProjectsMaximumReached || isLoadingCloudProjects)
                }
              />
              {storageProvider.internalName === 'Cloud' &&
                isCloudProjectsMaximumReached && (
                  <MaxProjectCountAlertMessage margin="dense" />
                )}
            </React.Fragment>
          ))}
      </List>
    </Dialog>
  );
};

export default SaveToStorageProviderDialog;
