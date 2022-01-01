// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog from '../UI/Dialog';
import Refresh from '@material-ui/icons/Refresh';
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
  onClickGenerateProjectName: () => void,
  outputPath?: string,
  onChangeOutputPath?: (outputPath: string) => void,
  projectName: string,
  onChangeProjectName: (name: string) => void,
|};

const ProjectPreCreationDialog = ({
  open,
  isOpening,
  onClose,
  onCreate,
  onClickGenerateProjectName,
  outputPath,
  onChangeOutputPath,
  projectName,
  onChangeProjectName,
}: Props): React.Node => {
  const [projectNameError, setProjectNameError] = React.useState<?React.Node>(
    null
  );

  const onValidate = React.useCallback(
    () => {
      if (isOpening) return;

      setProjectNameError(null);
      if (!projectName) {
        setProjectNameError(
          <Trans>Please enter a name for your project.</Trans>
        );
        return;
      }
      onCreate();
    },
    [onCreate, projectName, isOpening]
  );

  const _onChangeProjectName = React.useCallback(
    (event, text) => {
      if (projectNameError) setProjectNameError(null);
      onChangeProjectName(text);
    },
    [onChangeProjectName, projectNameError]
  );

  return (
    <Dialog
      title={<Trans>New Project</Trans>}
      maxWidth="sm"
      open={open}
      onApply={onValidate}
      onRequestClose={onClose}
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
          onClick={onValidate}
        />,
      ]}
    >
      <Column noMargin>
        <TextField
          type="text"
          errorText={projectNameError}
          disabled={isOpening}
          value={projectName}
          onChange={_onChangeProjectName}
          floatingLabelText={<Trans>Project name</Trans>}
          endAdornment={<Refresh onClick={onClickGenerateProjectName} />}
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
