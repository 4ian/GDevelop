// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';

import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import BackgroundText from '../UI/BackgroundText';
import { ColumnStackLayout } from '../UI/Layout';
import { mapFor } from '../Utils/MapFor';

export type ExternalKind = 'external-layout' | 'external-events';

export type CreateExternalPayload = {|
  kind: ExternalKind,
  layoutName: string,
|};

type Props = {|
  project: gdProject,
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
    layoutNames.length === 1 ? layoutNames[0] : ''
  );

  const canCreate = !!layoutName;

  const create = React.useCallback(
    () => {
      if (!canCreate) return;

      onCreate({
        kind,
        layoutName,
      });
    },
    [canCreate, kind, layoutName, onCreate]
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
