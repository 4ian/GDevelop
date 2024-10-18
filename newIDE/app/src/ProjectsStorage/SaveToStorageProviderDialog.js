// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { List } from '../UI/List';

import StorageProviderListItem from './StorageProviderListItem';
import { type StorageProvider } from '.';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { MaxProjectCountAlertMessage } from '../MainFrame/EditorContainers/HomePage/BuildSection/MaxProjectCountAlertMessage';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';

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
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );

  const { profile, limits, cloudProjects } = authenticatedUser;

  const isLoadingCloudProjects = !!profile && !cloudProjects;
  const isCloudProjectsMaximumReached =
    !!limits &&
    !!cloudProjects &&
    limits.capabilities.cloudProjects.maximumCount > 0 &&
    cloudProjects.filter(cloudProject => !cloudProject.deletedAt).length >=
      limits.capabilities.cloudProjects.maximumCount;

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
                isCloudProjectsMaximumReached &&
                limits && (
                  <MaxProjectCountAlertMessage
                    margin="dense"
                    limits={limits}
                    onUpgrade={() =>
                      openSubscriptionDialog({
                        analyticsMetadata: {
                          reason: 'Cloud Project limit reached',
                        },
                      })
                    }
                  />
                )}
            </React.Fragment>
          ))}
      </List>
    </Dialog>
  );
};

export default SaveToStorageProviderDialog;
