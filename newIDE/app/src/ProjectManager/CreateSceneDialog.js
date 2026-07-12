// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import TextField from '../UI/TextField';
import { ColumnStackLayout } from '../UI/Layout';
import { isValidSceneName } from '../Utils/SceneNameValidator';

type Props = {|
  project: gdProject,
  onCancel: () => void,
  onCreate: (sceneName: string) => void,
|};

const styles = {
  form: {
    padding: '0 24px 8px 24px',
  },
};

const CreateSceneDialog = ({
  project,
  onCancel,
  onCreate,
}: Props): React.Node => {
  const [sceneName, setSceneName] = React.useState('');
  const trimmedSceneName = sceneName.trim();

  let sceneNameError = null;
  if (!trimmedSceneName) {
    sceneNameError = <Trans>Enter a scene name.</Trans>;
  } else if (!isValidSceneName(sceneName)) {
    sceneNameError = (
      <Trans>
        Use camelCase or snake_case. Spaces and special characters are not
        allowed.
      </Trans>
    );
  } else if (project.hasLayoutNamed(trimmedSceneName)) {
    sceneNameError = <Trans>This scene name is already used.</Trans>;
  }

  const canCreate = !sceneNameError;

  const create = React.useCallback(
    () => {
      if (!canCreate) return;

      onCreate(trimmedSceneName);
    },
    [canCreate, onCreate, trimmedSceneName]
  );

  return (
    <Dialog
      open
      title={<Trans>Add a scene</Trans>}
      onRequestClose={onCancel}
      onApply={create}
      maxWidth="xs"
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onCancel}
        />,
        <RaisedButton
          key="ok"
          primary
          label={<Trans>OK</Trans>}
          disabled={!canCreate}
          onClick={create}
        />,
      ]}
    >
      <div style={styles.form}>
        <ColumnStackLayout noMargin>
          <TextField
            value={sceneName}
            onChange={(event, value) => setSceneName(value)}
            floatingLabelText={<Trans>Scene name</Trans>}
            errorText={sceneNameError}
            fullWidth
            autoFocus="desktop"
          />
        </ColumnStackLayout>
      </div>
    </Dialog>
  );
};

export default CreateSceneDialog;
