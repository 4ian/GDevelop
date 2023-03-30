// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';

import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import { Line } from '../../UI/Grid';
import FlatButton from '../../UI/FlatButton';

type Props = {|
  onSaveAsMainVersion: () => void,
  onSaveAsDuplicate: () => void,
  onClose: () => void,
|};

const CloudProjectRecoveryDialog = ({
  onClose,
  onSaveAsDuplicate,
  onSaveAsMainVersion,
}: Props) => {
  const actions = [
    <FlatButton
      key="save-copy"
      label={<Trans>Save as copy</Trans>}
      onClick={onSaveAsDuplicate}
    />,
    <DialogPrimaryButton
      primary
      key="save-main"
      label={<Trans>Save as main version</Trans>}
      onClick={onSaveAsMainVersion}
    />,
  ];

  return (
    <Dialog
      open
      flexColumnBody
      maxWidth="sm"
      onRequestClose={onClose}
      onApply={onSaveAsMainVersion}
      actions={actions}
      title={
        <Trans>
          What would you like to do with this uncorrupted version of your
          project?
        </Trans>
      }
    >
      <Line />
    </Dialog>
  );
};

export default CloudProjectRecoveryDialog;
