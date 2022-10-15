// @flow
import { Trans } from '@lingui/macro';
import Refresh from '@material-ui/icons/Refresh';
import * as React from 'react';

import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import { Column, Spacer } from '../UI/Grid';
import LocalFolderPicker from '../UI/LocalFolderPicker';
import TextField from '../UI/TextField';

import generateName from '../Utils/ProjectNameGenerator';
import optionalRequire from '../Utils/OptionalRequire';
import { findEmptyPathInDefaultFolder } from './LocalPathFinder';
import { type ProjectCreationSettings } from './CreateProjectDialog';
import IconButton from '../UI/IconButton';

const remote = optionalRequire('@electron/remote');
const app = remote ? remote.app : null;

type Props = {|
  open: boolean,
  isOpening?: boolean,
  onClose: () => void,
  onCreate: ProjectCreationSettings => Promise<void>,
  sourceExampleName?: string,
|};

const generateProjectName = (sourceExampleName: ?string) =>
  sourceExampleName
    ? `${generateName()} (${sourceExampleName})`
    : generateName();

const ProjectPreCreationDialog = ({
  open,
  isOpening,
  onClose,
  onCreate,
  sourceExampleName,
}: Props): React.Node => {
  const [projectNameError, setProjectNameError] = React.useState<?React.Node>(
    null
  );
  const [projectName, setProjectName] = React.useState<string>(() =>
    generateProjectName(sourceExampleName)
  );
  const [outputPath, setOutputPath] = React.useState<string>(() =>
    app ? findEmptyPathInDefaultFolder(app) : ''
  );

  const onValidate = React.useCallback(
    async () => {
      if (isOpening) return;

      setProjectNameError(null);
      if (!projectName) {
        setProjectNameError(
          <Trans>Please enter a name for your project.</Trans>
        );
        return;
      }
      await onCreate({ projectName, outputPath: app ? outputPath : undefined });
    },
    [onCreate, projectName, outputPath, isOpening]
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
      id="project-pre-creation-dialog"
      title={<Trans>New Project</Trans>}
      maxWidth="sm"
      open={open}
      actions={[
        <FlatButton
          disabled={isOpening}
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onClose}
        />,
        <DialogPrimaryButton
          primary
          disabled={isOpening}
          key="create"
          label={<Trans>Create project</Trans>}
          onClick={onValidate}
          id="create-project-button"
        />,
      ]}
      cannotBeDismissed={isOpening}
      onRequestClose={onClose}
      onApply={onValidate}
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
            <IconButton
              size="small"
              onClick={() =>
                setProjectName(generateProjectName(sourceExampleName))
              }
            >
              <Refresh />
            </IconButton>
          }
        />
        {app && (
          <>
            <Spacer />
            <LocalFolderPicker
              fullWidth
              value={outputPath}
              onChange={setOutputPath}
              type="create-game"
            />
          </>
        )}
      </Column>
    </Dialog>
  );
};

export default ProjectPreCreationDialog;
