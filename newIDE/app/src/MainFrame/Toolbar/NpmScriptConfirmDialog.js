// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import FlatButton from '../../UI/FlatButton';
import Text from '../../UI/Text';
import InlineCheckbox from '../../UI/InlineCheckbox';

type Props = {|
  open: boolean,
  scriptNames: string,
  onConfirm: (dontShowAgain: boolean) => void,
  onDismiss: () => void,
|};

function NpmScriptConfirmDialog({
  open,
  scriptNames,
  onConfirm,
  onDismiss,
}: Props) {
  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  const handleConfirm = React.useCallback(
    () => {
      onConfirm(dontShowAgain);
    },
    [onConfirm, dontShowAgain]
  );

  // Reset checkbox when dialog reopens
  React.useEffect(
    () => {
      if (open) {
        setDontShowAgain(false);
      }
    },
    [open]
  );

  return (
    <Dialog
      dangerLevel="warning"
      title={<Trans>Allow this project to run npm scripts?</Trans>}
      open={open}
      maxWidth="sm"
      fullscreen="never-even-on-mobile"
      onRequestClose={onDismiss}
      onApply={handleConfirm}
      actions={[
        <FlatButton
          key="dismiss"
          keyboardFocused
          label={<Trans>Don't allow</Trans>}
          onClick={onDismiss}
        />,
        <DialogPrimaryButton
          key="confirm"
          label={<Trans>I trust this project</Trans>}
          onClick={handleConfirm}
          primary
        />,
      ]}
    >
      <Text>
        <Trans>
          This project contains toolbar buttons that want to run npm scripts on
          your computer ({scriptNames}). Only allow this if you created
          package.json yourself or got it from a source you trust. Malicious
          scripts could harm your computer or steal your data.
        </Trans>
      </Text>
      <InlineCheckbox
        label={<Trans>Don't show this warning again</Trans>}
        checked={dontShowAgain}
        onCheck={(e, checked) => setDontShowAgain(checked)}
      />
    </Dialog>
  );
}

export default NpmScriptConfirmDialog;
