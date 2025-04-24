// @flow
import { t, Trans } from '@lingui/macro';
import React from 'react';
import FlatButton from '../../../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../../../UI/Dialog';
import SemiControlledTextField from '../../../UI/SemiControlledTextField';
import HelpButton from '../../../UI/HelpButton';

type Props = {|
  initialName: string,
  onApply: (variantName: string) => void,
  onCancel: () => void,
|};

const NewVariantDialog = ({ initialName, onApply, onCancel }: Props) => {
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
    </Dialog>
  );
};

export default NewVariantDialog;
