// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import { Column, Spacer } from '../UI/Grid';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import TextField from '../UI/TextField';

type Props = {|
  open: boolean,
  isOpening?: boolean,
  onClose: () => void,
  onCreate: () => void | Promise<void>,
  outputPath?: string,
  onChangeOutputPath?: (outputPath: string) => void,
  projectName: ?string,
  onChangeProjectName: (name: string) => void,
|};

const ProjectPreCreationDialog = ({
  open,
  isOpening,
  onClose,
  onCreate,
  outputPath,
  onChangeOutputPath,
  projectName,
  onChangeProjectName,
}: Props): React.Node => {
  let projectNameToDisplay =
    projectName === null || projectName === undefined
      ? 'Bonjour les cocos'
      : projectName;
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
        <TextField
          type="text"
          value={projectNameToDisplay}
          onChange={(e, text) => onChangeProjectName(text)}
          floatingLabelText={<Trans>Project name</Trans>}
        />
        {onChangeOutputPath && (
          <>
            <Spacer />
            <LocalFolderPicker
              fullWidth
              value={outputPath || ''}
              onChange={onChangeOutputPath}
              type="create-game"
            />
          </>
        )}
      </Column>
    </Dialog>
  );
};

export default ProjectPreCreationDialog;
