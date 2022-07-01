// @flow

import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import TextField from '../../UI/TextField';
import { CLOUD_PROJECT_NAME_MAX_LENGTH } from '../../Utils/GDevelopServices/Project';

type Props = {|
  onCancel: () => void,
  nameSuggestion: string,
  onSave: (newCloudProjectName: string) => void,
|};

const CloudSaveAsDialog = ({ onCancel, onSave, nameSuggestion }: Props) => {
  const [name, setName] = React.useState<string>(nameSuggestion);
  return (
    <Dialog
      onApply={() => onSave(name)}
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          primary={false}
          onClick={onCancel}
        />,
        <DialogPrimaryButton
          key="save"
          label={<Trans>Save</Trans>}
          primary
          onClick={() => onSave(name)}
        />,
      ]}
      open
      onRequestClose={onCancel}
      maxWidth="sm"
      title={<Trans>Choose a name for your new project</Trans>}
      flexBody
    >
      <TextField
        autoFocus
        fullWidth
        maxLength={CLOUD_PROJECT_NAME_MAX_LENGTH}
        type="text"
        value={name}
        onChange={(e, newName) => {
          setName(newName);
        }}
      />
    </Dialog>
  );
};

export default CloudSaveAsDialog;
