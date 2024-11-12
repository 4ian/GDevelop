// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { type StorageProvider } from '.';
import { List } from '../UI/List';
import optionalRequire from '../Utils/OptionalRequire';
import BackgroundText from '../UI/BackgroundText';
import { Column, Line } from '../UI/Grid';
import StorageProviderListItem from './StorageProviderListItem';
import AlertMessage from '../UI/AlertMessage';
import Text from '../UI/Text';
const electron = optionalRequire('electron');

type Props = {|
  storageProviders: Array<StorageProvider>,
  onChooseProvider: StorageProvider => void,
  onClose: () => void,
|};

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
                You can find your cloud projects in the Build section of the
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
                  {storageProvider.internalName === 'GoogleDrive' && (
                    <Column noMargin expand>
                      <AlertMessage kind="warning">
                        <Text size={'sub-title'} noMargin>
                          <Trans>End of Google Drive support</Trans>
                        </Text>
                        <Text noMargin>
                          <Trans>
                            Google Drive support will be dropped on January
                            31st.
                            <br />
                            Save your project in the GDevelop Cloud to make sure
                            you can access it past this date.
                          </Trans>
                        </Text>
                      </AlertMessage>
                    </Column>
                  )}
                </React.Fragment>
              ))}
          </List>
          {!electron && (
            <Line>
              <Column noMargin>
                <BackgroundText>
                  <Trans>
                    If you have a popup blocker interrupting the opening, allow
                    the popups and try a second time to open the project.
                  </Trans>
                </BackgroundText>
              </Column>
            </Line>
          )}
        </Dialog>
      )}
    </I18n>
  );
};

export default OpenFromStorageProviderDialog;
