// @flow

import { Trans } from '@lingui/macro';
import * as React from 'react';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Form from '../UI/Form';
import TextField from '../UI/TextField';

type Props = {|
  passwordValue: string,
  setPasswordValue: (newValue: string) => void,
  onClose: () => void,
  onApply: () => Promise<void>,
|};

const PasswordPromptDialog = (props: Props) => (
  <Dialog
    open
    maxWidth="xs"
    title={<Trans>Store password</Trans>}
    onApply={props.onApply}
    onRequestClose={props.onClose}
    actions={[
      <FlatButton
        key="cancel"
        label={<Trans>Close</Trans>}
        onClick={props.onClose}
      />,
      <DialogPrimaryButton
        key="continue"
        primary
        label={<Trans>Continue</Trans>}
        onClick={props.onApply}
      />,
    ]}
  >
    <Form onSubmit={props.onApply} name="store-password">
      <TextField
        fullWidth
        autoFocus="desktopAndMobileDevices"
        value={props.passwordValue}
        floatingLabelText={<Trans>Password</Trans>}
        type="password"
        onChange={(e, value) => {
          props.setPasswordValue(value);
        }}
      />
    </Form>
  </Dialog>
);

export default PasswordPromptDialog;
