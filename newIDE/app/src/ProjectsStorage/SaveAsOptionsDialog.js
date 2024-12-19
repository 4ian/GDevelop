// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans, t } from '@lingui/macro';

import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import TextField from '../UI/TextField';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import { ColumnStackLayout } from '../UI/Layout';

type Props = {|
  onCancel: () => void,
  nameSuggestion: string,
  onSave: ({ name: string, generateNewProjectUuid: boolean }) => void,
  nameMaxLength?: number,
  mainActionLabel?: React.Node,
  displayOptionToGenerateNewProjectUuid: boolean,
|};

const SaveAsOptionsDialog = (props: Props) => {
  const [name, setName] = React.useState<string>(props.nameSuggestion);
  const [
    generateNewProjectUuid,
    setGenerateNewProjectUuid,
  ] = React.useState<boolean>(
    props.displayOptionToGenerateNewProjectUuid ? false : true
  );
  const [error, setError] = React.useState<?string>(null);

  const onSave = (i18n: I18nType) => {
    setError(null);
    if (!name) {
      setError(i18n._(t`Project name cannot be empty.`));
      return;
    }
    props.onSave({ name, generateNewProjectUuid });
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Save project as</Trans>}
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
              label={props.mainActionLabel || <Trans>Save</Trans>}
              primary
              onClick={() => onSave(i18n)}
            />,
          ]}
          open
          onRequestClose={props.onCancel}
          maxWidth="sm"
          flexBody
        >
          <ColumnStackLayout noMargin expand>
            <TextField
              autoFocus="desktop"
              fullWidth
              maxLength={props.nameMaxLength}
              errorText={error}
              type="text"
              value={name}
              floatingLabelText={<Trans>Project name</Trans>}
              onChange={(e, newName) => {
                setName(newName);
              }}
            />
            {props.displayOptionToGenerateNewProjectUuid && (
              <SelectField
                value={generateNewProjectUuid ? 'generate' : 'keep'}
                onChange={(_, __, newValue) =>
                  setGenerateNewProjectUuid(newValue === 'generate')
                }
              >
                <SelectOption
                  label={t`Keep the new project linked to this game`}
                  value={'keep'}
                />
                <SelectOption
                  label={t`Start a new game from this project`}
                  value={'generate'}
                />
              </SelectField>
            )}
          </ColumnStackLayout>
        </Dialog>
      )}
    </I18n>
  );
};

export default SaveAsOptionsDialog;
