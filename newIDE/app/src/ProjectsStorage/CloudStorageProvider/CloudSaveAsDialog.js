// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans, t } from '@lingui/macro';

import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import TextField from '../../UI/TextField';
import { CLOUD_PROJECT_NAME_MAX_LENGTH } from '../../Utils/GDevelopServices/Project';

type Props = {|
  onCancel: () => void,
  nameSuggestion: string,
  onSave: (newCloudProjectName: string) => void,
|};

const CloudSaveAsDialog = (props: Props) => {
  const [name, setName] = React.useState<string>(props.nameSuggestion);
  const [error, setError] = React.useState<?string>(null);

  const onSave = (i18n: I18nType) => {
    setError(null);
    if (!name) {
      setError(i18n._(t`Project name cannot be empty.`));
      return;
    }
    props.onSave(name);
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Choose a name for your new project</Trans>}
          onApply={() => onSave(i18n)}
          actions={[
            <FlatButton
              key="cancel"
              label={<Trans>Cancel</Trans>}
              primary={false}
              onClick={props.onCancel}
            />,
            <DialogPrimaryButton
              key="save"
              label={<Trans>Save</Trans>}
              primary
              onClick={() => onSave(i18n)}
            />,
          ]}
          open
          onRequestClose={props.onCancel}
          maxWidth="sm"
          flexBody
        >
          <TextField
            autoFocus="desktop"
            fullWidth
            maxLength={CLOUD_PROJECT_NAME_MAX_LENGTH}
            errorText={error}
            translatableHintText={t`Project name`}
            type="text"
            value={name}
            onChange={(e, newName) => {
              setName(newName);
            }}
          />
        </Dialog>
      )}
    </I18n>
  );
};

export default CloudSaveAsDialog;
