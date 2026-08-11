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

export const normalizeMarkdownBaseName = (rawFileName: string): string => {
  const withoutMarkdownExtension = rawFileName
    .trim()
    .replace(/\.(md|markdown)$/i, '');
  const withoutInvalidPathCharacters = withoutMarkdownExtension.replace(
    /[<>:"/\\|?*]/g,
    '-'
  );
  return withoutInvalidPathCharacters.replace(/[. ]+$/g, '');
};

const MarkdownFileNameDialog = ({
  open,
  error,
  onCancel,
  onCreate,
}: Props): React.Node => {
  const [fileName, setFileName] = React.useState('notes');
  const normalizedBaseName = normalizeMarkdownBaseName(fileName);
  const fileNameToCreate = normalizedBaseName ? `${normalizedBaseName}.md` : '';

  React.useEffect(
    () => {
      if (open) setFileName('notes');
    },
    [open]
  );

  if (!open) return null;

  return (
    <Dialog
      title={<Trans>Create Markdown file</Trans>}
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
          disabled={!fileNameToCreate}
          onClick={() => onCreate(fileNameToCreate)}
        />,
      ]}
      onRequestClose={onCancel}
      onApply={() => {
        if (fileNameToCreate) onCreate(fileNameToCreate);
      }}
      maxWidth="sm"
    >
      <TextField
        value={fileName}
        onChange={(event, value) => setFileName(value)}
        floatingLabelText={<Trans>File name</Trans>}
        fullWidth
        autoFocus="desktop"
      />
      {!!fileNameToCreate && (
        <Text noMargin color="secondary">
          <Trans>File to create:</Trans> {fileNameToCreate}
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

export default MarkdownFileNameDialog;
