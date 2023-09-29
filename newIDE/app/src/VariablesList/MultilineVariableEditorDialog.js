// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import SemiControlledTextField from '../UI/SemiControlledTextField';

type Props = {|
  initialValue: string,
  onClose: (newValue: string) => void,
|};

export const MultilineVariableEditorDialog = ({
  initialValue,
  onClose,
}: Props) => {
  const [value, setValue] = React.useState(initialValue);

  return (
    <Dialog
      open
      title={null}
      flexColumnBody
      noMobileFullScreen
      actions={[
        <DialogPrimaryButton
          key="ok"
          label={<Trans>Ok</Trans>}
          primary
          onClick={() => onClose(value)}
        />,
      ]}
      maxWidth="md"
      onRequestClose={() => onClose(value)}
      onApply={() => onClose(value)}
    >
      <SemiControlledTextField
        autoFocus="desktopAndMobileDevices"
        multiline
        fullWidth
        floatingLabelText={<Trans>Initial text of the variable</Trans>}
        value={value}
        onChange={setValue}
        rows={5}
        rowsMax={10}
      />
    </Dialog>
  );
};
