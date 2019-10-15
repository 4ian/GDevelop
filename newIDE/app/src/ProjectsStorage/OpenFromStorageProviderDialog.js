// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { type StorageProvider } from '.';
import { List, ListItem } from '../UI/List';
import RaisedButton from '../UI/RaisedButton';

type Props = {|
  storageProviders: Array<StorageProvider>,
  onChooseProvider: StorageProvider => void,
  onClose: () => void,
  onCreateNewProject: () => void,
|};

export default ({
  onClose,
  storageProviders,
  onChooseProvider,
  onCreateNewProject,
}: Props) => {
  return (
    <Dialog
      title={<Trans>Choose where to load the project from</Trans>}
      onRequestClose={onClose}
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          key="close"
          primary={false}
          onClick={onClose}
        />,
      ]}
      secondaryActions={[
        <RaisedButton
          label={<Trans>Create a new project</Trans>}
          key="create-new-project"
          primary
          onClick={onCreateNewProject}
        />,
      ]}
      open
      noMargin
      maxWidth="sm"
    >
      <List>
        {storageProviders
          .filter(storageProvider => !storageProvider.hiddenInOpenDialog)
          .map(storageProvider => (
            <ListItem
              key={storageProvider.name}
              disabled={!!storageProvider.disabled}
              primaryText={storageProvider.name}
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
  );
};
