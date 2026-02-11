// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import TextField from '../UI/TextField';
import { ColumnStackLayout } from '../UI/Layout';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';

type Props = {|
  suggestedName: string,
  onApply: (chosenName: string) => void,
  onCancel: () => void,
|};

export default function ExtractAsExternalLayoutDialog({
  suggestedName,
  onApply,
  onCancel,
}: Props) {
  const [chosenName, setChosenName] = React.useState<string>(suggestedName);

  const apply = React.useCallback(() => onApply(chosenName), [
    chosenName,
    onApply,
  ]);

  return (
    <Dialog
      title={<Trans>Extract as an external layout</Trans>}
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          primary={false}
          onClick={onCancel}
        />,
        <DialogPrimaryButton
          key="apply"
          label={<Trans>Move instances</Trans>}
          primary={true}
          onClick={apply}
        />,
      ]}
      secondaryActions={[
        <HelpButton
          helpPagePath="/interface/scene-editor/external-layouts/"
          key="help"
        />,
      ]}
      onRequestClose={onCancel}
      onApply={apply}
      open
      maxWidth="sm"
    >
      <ColumnStackLayout noMargin>
        <Text>
          <Trans>
            Selected instances will be moved to a new external layout.
          </Trans>
        </Text>
        <TextField
          floatingLabelText={<Trans>External layout name</Trans>}
          fullWidth
          value={chosenName}
          onChange={(e, value) => setChosenName(value)}
        />
      </ColumnStackLayout>
    </Dialog>
  );
}
