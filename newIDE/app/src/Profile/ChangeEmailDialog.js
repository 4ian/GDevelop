// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { User as FirebaseUser } from 'firebase/auth';
import {
  type ChangeEmailForm,
  type AuthError,
} from '../Utils/GDevelopServices/Authentication';
import LeftLoader from '../UI/LeftLoader';
import { ColumnStackLayout } from '../UI/Layout';
import TextField from '../UI/TextField';
import { getEmailErrorText } from './CreateAccountDialog';
import { emailRegex } from './ForgotPasswordDialog';
import Form from '../UI/Form';

type Props = {|
  firebaseUser: FirebaseUser,
  onClose: () => void,
  onChangeEmail: (form: ChangeEmailForm) => Promise<void>,
  changeEmailInProgress: boolean,
  error: ?AuthError,
|};

const ChangeEmailDialog = ({
  onClose,
  onChangeEmail,
  firebaseUser,
  changeEmailInProgress,
  error,
}: Props) => {
  const [email, setEmail] = React.useState(firebaseUser.email);
  const [isEmailValid, setIsEmailValid] = React.useState<boolean>(true);

  const doChangeEmail = async () => {
    const trimmedEmail = email.trim();
    setEmail(trimmedEmail);
    setIsEmailValid(emailRegex.test(trimmedEmail));

    if (changeEmailInProgress || !email || !isEmailValid) return;

    await onChangeEmail({
      email,
    });
  };

  return (
    <Dialog
      title={<Trans>Change your email</Trans>}
      actions={[
        <FlatButton
          label={<Trans>Back</Trans>}
          disabled={changeEmailInProgress}
          key="back"
          primary={false}
          onClick={onClose}
        />,
        <LeftLoader isLoading={changeEmailInProgress} key="change-email">
          <DialogPrimaryButton
            label={<Trans>Save</Trans>}
            primary
            onClick={doChangeEmail}
            disabled={changeEmailInProgress}
          />
        </LeftLoader>,
      ]}
      maxWidth="xs"
      cannotBeDismissed={changeEmailInProgress}
      onRequestClose={onClose}
      onApply={doChangeEmail}
      open
    >
      <Form onSubmit={doChangeEmail} autoComplete="on" name="changeEmail">
        <ColumnStackLayout noMargin>
          <TextField
            value={email}
            floatingLabelText={<Trans>Email</Trans>}
            errorText={
              getEmailErrorText(error) ||
              (!isEmailValid ? <Trans>Invalid email address</Trans> : null)
            }
            fullWidth
            type="email"
            disabled={changeEmailInProgress}
            required
            onChange={(e, value) => {
              if (!isEmailValid) setIsEmailValid(true);
              setEmail(value);
            }}
            onBlur={event => {
              const trimmedEmail = event.currentTarget.value.trim();
              setEmail(trimmedEmail);
              setIsEmailValid(emailRegex.test(trimmedEmail));
            }}
          />
        </ColumnStackLayout>
      </Form>
    </Dialog>
  );
};

export default ChangeEmailDialog;
