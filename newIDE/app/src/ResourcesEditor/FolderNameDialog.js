// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import TextField from '../UI/TextField';

type Props = {|
  open: boolean,
  error: ?string,
  onCancel: () => void,
  onCreate: string => void | Promise<void>,
|};

export const normalizeFolderName = (rawFolderName: string): string => {
  const folderName = rawFolderName
    .trim()
    .replace(/[<>:"/\\|?*]/g, '-')
    .replace(/[. ]+$/g, '');
  if (folderName === '.' || folderName === '..') return '';
  return folderName;
};

const FolderNameDialog = ({
  open,
  error,
  onCancel,
  onCreate,
}: Props): React.Node => {
  const [folderName, setFolderName] = React.useState('New folder');
  const normalizedFolderName = normalizeFolderName(folderName);

  React.useEffect(
    () => {
      if (open) setFolderName('New folder');
    },
    [open]
  );

  if (!open) return null;

  return (
    <Dialog
      title={<Trans>Create folder</Trans>}
      open
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onCancel}
        />,
        <DialogPrimaryButton
          key="create"
          label={<Trans>Create</Trans>}
          primary
          disabled={!normalizedFolderName}
          onClick={() => onCreate(normalizedFolderName)}
        />,
      ]}
      onRequestClose={onCancel}
      onApply={() => {
        if (normalizedFolderName) onCreate(normalizedFolderName);
      }}
      maxWidth="sm"
    >
      <TextField
        value={folderName}
        onChange={(event, value) => setFolderName(value)}
        floatingLabelText={<Trans>Folder name</Trans>}
        fullWidth
        autoFocus="desktop"
      />
      {!!normalizedFolderName && (
        <Text noMargin color="secondary">
          <Trans>Folder to create:</Trans> {normalizedFolderName}
        </Text>
      )}
      {!!error && (
        <Text noMargin color="error">
          {error}
        </Text>
      )}
    </Dialog>
  );
};

export default FolderNameDialog;
