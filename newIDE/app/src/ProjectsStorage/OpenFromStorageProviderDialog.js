// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { type StorageProvider } from '.';
import { List, ListItem } from '../UI/List';
import optionalRequire from '../Utils/OptionalRequire';
import BackgroundText from '../UI/BackgroundText';
import { Column, Line } from '../UI/Grid';
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
          <List>
            {storageProviders
              .filter(storageProvider => !storageProvider.hiddenInOpenDialog)
              .map(storageProvider => (
                <ListItem
                  key={storageProvider.internalName}
                  disabled={!!storageProvider.disabled}
                  primaryText={i18n._(storageProvider.name)}
                  leftIcon={
                    storageProvider.renderIcon
                      ? storageProvider.renderIcon({})
                      : undefined
                  }
                  onClick={() => onChooseProvider(storageProvider)}
                />
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
