// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import { Column } from '../UI/Grid';
import LocalFolderPicker from '../UI/LocalFolderPicker';

type Props = {|
  open: boolean,
  isOpening?: boolean,
  onClose: () => void,
  onCreate: () => void | Promise<void>,
  outputPath: string,
  onChangeOutputPath: (outputPath: string) => void,
|};

const LocalProjectPreCreationDialog = ({
  open,
  isOpening,
  onClose,
  onCreate,
  outputPath,
  onChangeOutputPath,
}: Props): React.Node => {
  return (
    <Dialog
      title={<Trans>Project settings</Trans>}
      maxWidth="sm"
      open={open}
      actions={[
        <FlatButton
          disabled={isOpening}
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onClose}
        />,
        <RaisedButton
          primary
          disabled={isOpening}
          key="create"
          label={<Trans>Create project</Trans>}
          onClick={onCreate}
        />,
      ]}
    >
      <Column>
        <LocalFolderPicker
          fullWidth
          value={outputPath}
          onChange={onChangeOutputPath}
          type="create-game"
        />
      </Column>
    </Dialog>
  );
};

export default LocalProjectPreCreationDialog;
