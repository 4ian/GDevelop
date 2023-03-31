// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';

import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import { Line } from '../../UI/Grid';
import FlatButton from '../../UI/FlatButton';
import LeftLoader from '../../UI/LeftLoader';

type Props = {|
  onClose: () => void,
  isLoading: boolean,
  onSaveAsMainVersion: () => void | Promise<void>,
  onSaveAsDuplicate: () => void | Promise<void>,
|};

const CloudProjectRecoveryDialog = ({
  onClose,
  isLoading,
  onSaveAsDuplicate,
  onSaveAsMainVersion,
}: Props) => {
  const actions = [
    <FlatButton
      disabled={isLoading}
      key="save-copy"
      label={<Trans>Save as...</Trans>}
      onClick={onSaveAsDuplicate}
    />,
    <LeftLoader isLoading={isLoading} key="save-main">
      <DialogPrimaryButton
        primary
        disabled={isLoading}
        label={<Trans>Save as main version</Trans>}
        onClick={onSaveAsMainVersion}
      />
    </LeftLoader>,
  ];

  return (
    <Dialog
      open
      flexColumnBody
      cannotBeDismissed={isLoading}
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
