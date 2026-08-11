// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import TextField from '../UI/TextField';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import BackgroundText from '../UI/BackgroundText';
import { ColumnStackLayout } from '../UI/Layout';
import { mapFor } from '../Utils/MapFor';

export type ExternalKind = 'external-layout' | 'external-events';

export type CreateExternalPayload = {|
  kind: ExternalKind,
  layoutName: string,
  name: string,
|};

type Props = {|
  project: gdProject,
  initialLayoutName?: string,
  onCancel: () => void,
  onCreate: CreateExternalPayload => void,
|};

const styles = {
  form: {
    padding: '0 24px 8px 24px',
  },
};

const CreateExternalDialog = ({
  project,
  initialLayoutName,
  onCancel,
  onCreate,
}: Props): React.Node => {
  const layoutNames = React.useMemo(
    () =>
      mapFor(0, project.getLayoutsCount(), i =>
        project.getLayoutAt(i).getName()
      ),
    [project]
  );
  const [kind, setKind] = React.useState<ExternalKind>('external-layout');
  const [layoutName, setLayoutName] = React.useState<string>(
    initialLayoutName && layoutNames.includes(initialLayoutName)
      ? initialLayoutName
      : layoutNames.length === 1
      ? layoutNames[0]
      : ''
  );
  const [name, setName] = React.useState<string>('');

  const trimmedName = name.trim();

  let nameError = null;
  if (!trimmedName) {
    nameError = <Trans>Enter a name.</Trans>;
  } else if (
    kind === 'external-layout' &&
    project.hasExternalLayoutNamed(trimmedName)
  ) {
    nameError = <Trans>This external layout name is already used.</Trans>;
  } else if (
    kind === 'external-events' &&
    project.hasExternalEventsNamed(trimmedName)
  ) {
    nameError = <Trans>This external events name is already used.</Trans>;
  }

  const canCreate = !!layoutName && !nameError;

  const create = React.useCallback(
    () => {
      if (!canCreate) return;

      onCreate({
        kind,
        layoutName,
        name: trimmedName,
      });
    },
    [canCreate, kind, layoutName, onCreate, trimmedName]
  );

  return (
    <Dialog
      open
      title={<Trans>Create external</Trans>}
      onRequestClose={onCancel}
      onApply={create}
      maxWidth="sm"
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onCancel}
        />,
        <RaisedButton
          key="create"
          primary
          label={<Trans>Create</Trans>}
          disabled={!canCreate}
          onClick={create}
        />,
      ]}
    >
      <div style={styles.form}>
        <ColumnStackLayout noMargin>
          <SelectField
            value={kind}
            onChange={(event, index, value) => {
              setKind(value === 'external-events' ? value : 'external-layout');
            }}
            floatingLabelText={<Trans>Type</Trans>}
            fullWidth
          >
            <SelectOption value="external-layout" label={t`External layout`} />
            <SelectOption value="external-events" label={t`External events`} />
          </SelectField>
          <SelectField
            value={layoutName}
            onChange={(event, index, value) => setLayoutName(value)}
            floatingLabelText={<Trans>Linked scene</Trans>}
            translatableHintText={t`Choose a scene`}
            errorText={
              layoutNames.length > 0 && !layoutName ? (
                <Trans>Choose a scene before creating.</Trans>
              ) : null
            }
            disabled={layoutNames.length === 0}
            fullWidth
          >
            {layoutNames.map(name => (
              <SelectOption
                key={name}
                value={name}
                label={name}
                shouldNotTranslate
              />
            ))}
          </SelectField>
          <TextField
            value={name}
            onChange={(event, value) => setName(value)}
            floatingLabelText={<Trans>Name</Trans>}
            errorText={nameError}
            fullWidth
            autoFocus="desktop"
          />
          {layoutNames.length === 0 && (
            <BackgroundText>
              <Trans>Create a scene before adding externals.</Trans>
            </BackgroundText>
          )}
        </ColumnStackLayout>
      </div>
    </Dialog>
  );
};

export default CreateExternalDialog;
