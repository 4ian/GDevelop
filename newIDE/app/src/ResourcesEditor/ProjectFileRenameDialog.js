// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import TextField from '../UI/TextField';
import { normalizeFolderName } from './FolderNameDialog';

type Props = {|
  open: boolean,
  initialName: string,
  error: ?string,
  onCancel: () => void,
  onRename: string => void | Promise<void>,
|};

export const normalizeProjectFileRename = (rawName: string): string =>
  normalizeFolderName(rawName);

const ProjectFileRenameDialog = ({
  open,
  initialName,
  error,
  onCancel,
  onRename,
}: Props): React.Node => {
  const [name, setName] = React.useState(initialName);
  const normalizedName = normalizeProjectFileRename(name);
  const isUnchanged = normalizedName === initialName;

  React.useEffect(
    () => {
      if (open) setName(initialName);
    },
    [initialName, open]
  );

  if (!open) return null;

  return (
    <Dialog
      title={<Trans>Rename</Trans>}
      open
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onCancel}
        />,
        <DialogPrimaryButton
          key="rename"
          label={<Trans>Rename</Trans>}
          primary
          disabled={!normalizedName || isUnchanged}
          onClick={() => onRename(normalizedName)}
        />,
      ]}
      onRequestClose={onCancel}
      onApply={() => {
        if (normalizedName && !isUnchanged) onRename(normalizedName);
      }}
      maxWidth="sm"
    >
      <TextField
        value={name}
        onChange={(event, value) => setName(value)}
        floatingLabelText={<Trans>Name</Trans>}
        fullWidth
        autoFocus="desktop"
      />
      {!!normalizedName && (
        <Text noMargin color="secondary">
          <Trans>New name:</Trans> {normalizedName}
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

export default ProjectFileRenameDialog;
