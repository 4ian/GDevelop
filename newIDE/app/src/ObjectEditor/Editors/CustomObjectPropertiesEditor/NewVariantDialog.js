// @flow
import { t, Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../../../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import HelpButton from '../../../UI/HelpButton';
import { ColumnStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';

type Props = {|
  initialName: string,
  onApply: (variantName: string) => void,
  onCancel: () => void,
  isDuplicationBeforeEdition?: boolean,
|};

const NewVariantDialog = ({
  initialName,
  onApply,
  onCancel,
  isDuplicationBeforeEdition,
}: Props) => {
  const [variantName, setVariantName] = React.useState<string>(initialName);

  const apply = React.useCallback(
    () => {
      onApply(variantName);
    },
    [onApply, variantName]
  );

  return (
    <Dialog
      title={<Trans>Create a new variant</Trans>}
      id="create-variant-dialog"
      actions={[
        <FlatButton
          key="cancel"
          label={<Trans>Cancel</Trans>}
          onClick={onCancel}
        />,
        <DialogPrimaryButton
          key="apply"
          label={<Trans>Create</Trans>}
          primary
          onClick={apply}
        />,
      ]}
      secondaryActions={[
        <HelpButton
          key="help-button"
          helpPagePath="/objects/custom-objects-prefab-template"
        />,
      ]}
      onRequestClose={onCancel}
      onApply={apply}
      open
      maxWidth="sm"
    >
      <ColumnStackLayout noMargin>
        {isDuplicationBeforeEdition && (
          <Text>
            <Trans>
              This variant can't be modified directly. It must be duplicated
              first.
            </Trans>
          </Text>
        )}
        <SemiControlledTextField
          fullWidth
          id="variant-name"
          commitOnBlur
          floatingLabelText={<Trans>Variant name</Trans>}
          floatingLabelFixed
          value={variantName}
          translatableHintText={t`Variant name`}
          onChange={setVariantName}
          autoFocus="desktop"
        />
      </ColumnStackLayout>
    </Dialog>
  );
};

export default NewVariantDialog;
