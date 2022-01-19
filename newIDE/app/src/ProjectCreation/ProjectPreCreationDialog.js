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
import generateName from '../Utils/ProjectNameGenerator';

type Props = {|
  open: boolean,
  isOpening?: boolean,
  onClose: () => void,
  onCreate: (projectName: string) => void | Promise<void>,
  outputPath?: string,
  onChangeOutputPath?: (outputPath: string) => void,
|};

const ProjectPreCreationDialog = ({
  open,
  isOpening,
  onClose,
  onCreate,
  outputPath,
  onChangeOutputPath,
}: Props): React.Node => {
  const [projectNameError, setProjectNameError] = React.useState<?React.Node>(
    null
  );
  const [projectName, setProjectName] = React.useState<string>(() => generateName());

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
      onCreate(projectName);
    },
    [onCreate, projectName, isOpening]
  );

  const _onChangeProjectName = React.useCallback(
    (event, text) => {
      if (projectNameError) setProjectNameError(null);
      setProjectName(text);
    },
    [setProjectName, projectNameError]
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
          endAdornment={
            <Refresh onClick={() => setProjectName(generateName())} />
          }
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
