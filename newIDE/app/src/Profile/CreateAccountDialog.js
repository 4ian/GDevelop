// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import TextField from '../UI/TextField';
import {
  type RegisterForm,
  type AuthError,
} from '../Utils/GDevelopServices/Authentication';
import { type UsernameAvailability } from '../Utils/GDevelopServices/User';
import LeftLoader from '../UI/LeftLoader';
import BackgroundText from '../UI/BackgroundText';
import { ColumnStackLayout } from '../UI/Layout';
import { MarkdownText } from '../UI/MarkdownText';
import { UsernameField, isUsernameValid } from './UsernameField';
import Checkbox from '../UI/Checkbox';

type Props = {|
  onClose: () => void,
  onGoToLogin: () => void,
  onCreateAccount: (form: RegisterForm) => Promise<void>,
  createAccountInProgress: boolean,
  error: ?AuthError,
|};

export const getEmailErrorText = (error: ?AuthError) => {
  if (!error) return undefined;

  if (error.code === 'auth/invalid-email')
    return <Trans>This email is invalid.</Trans>;
  if (error.code === 'auth/user-disabled')
    return <Trans>The user was disabled.</Trans>;
  if (error.code === 'auth/user-not-found')
    return (
      <Trans>This user was not found: have you created your account?</Trans>
    );
  if (error.code === 'auth/email-already-in-use')
    return <Trans>This email was already used for another account.</Trans>;
  if (error.code === 'auth/operation-not-allowed')
    return (
      <Trans>Service seems to be unavailable, please try again later.</Trans>
    );
  if (error.code === 'auth/requires-recent-login')
    return (
      <Trans>
        Please log out and log in again to verify your identify, then change
        your email.
      </Trans>
    );
  return undefined;
};

export const getPasswordErrorText = (error: ?AuthError) => {
  if (!error) return undefined;

  if (error.code === 'auth/too-many-requests')
    return (
      <Trans>
        That's a lot of unsuccessful login attempts! Wait a bit before trying
        again or reset your password.
      </Trans>
    );
  if (error.code === 'auth/wrong-password')
    return <Trans>The password is invalid.</Trans>;
  if (error.code === 'auth/weak-password')
    return (
      <Trans>
        This password is too weak: please use more letters and digits.
      </Trans>
    );
  return undefined;
};

const CreateAccountDialog = ({
  onClose,
  onGoToLogin,
  onCreateAccount,
  createAccountInProgress,
  error,
}: Props) => {
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [username, setUsername] = React.useState<string>('');
  const [getNewsletterEmail, setGetNewsletterEmail] = React.useState<boolean>(
    false
  );
  const [
    usernameAvailability,
    setUsernameAvailability,
  ] = React.useState<?UsernameAvailability>(null);
  const [
    isValidatingUsername,
    setIsValidatingUsername,
  ] = React.useState<boolean>(false);

  const canCreateAccount =
    !createAccountInProgress &&
    isUsernameValid(username, { allowEmpty: true }) &&
    !isValidatingUsername &&
    (!usernameAvailability || usernameAvailability.isAvailable);

  const createAccount = () => {
    if (!canCreateAccount) return;
    onCreateAccount({
      email,
      password,
      username,
      getNewsletterEmail,
    });
  };

  return (
    <Dialog
      title={<Trans>Create a new GDevelop account</Trans>}
      actions={[
        <FlatButton
          label={<Trans>Cancel</Trans>}
          disabled={createAccountInProgress}
          key="close"
          primary={false}
          onClick={onClose}
        />,
        <LeftLoader isLoading={createAccountInProgress} key="create-account">
          <DialogPrimaryButton
            label={<Trans>Create my account</Trans>}
            primary
            disabled={!canCreateAccount}
            onClick={createAccount}
          />
        </LeftLoader>,
      ]}
      secondaryActions={[
        <FlatButton
          label={<Trans>Already have an account?</Trans>}
          primary={false}
          key="already-have-account"
          onClick={onGoToLogin}
          disabled={createAccountInProgress}
        />,
      ]}
      cannotBeDismissed={createAccountInProgress}
      onApply={createAccount}
      onRequestClose={() => {
        if (!createAccountInProgress) onClose();
      }}
      maxWidth="sm"
      open
    >
      <ColumnStackLayout noMargin>
        <BackgroundText>
          <MarkdownText
            translatableSource={t`By creating an account and using GDevelop, you agree to the [Terms and Conditions](https://gdevelop.io/page/terms-and-conditions). Having an account allows you to export your game on Android or as a Desktop app and it unlocks other services for your project!`}
          />
        </BackgroundText>
        <UsernameField
          value={username}
          onChange={(e, value) => {
            setUsername(value);
          }}
          allowEmpty
          onAvailabilityChecked={setUsernameAvailability}
          onAvailabilityCheckLoading={setIsValidatingUsername}
          isValidatingUsername={isValidatingUsername}
        />
        <TextField
          value={email}
          floatingLabelText={<Trans>Email</Trans>}
          errorText={getEmailErrorText(error)}
          fullWidth
          required
          onChange={(e, value) => {
            setEmail(value);
          }}
        />
        <TextField
          value={password}
          floatingLabelText={<Trans>Password</Trans>}
          errorText={getPasswordErrorText(error)}
          type="password"
          fullWidth
          required
          onChange={(e, value) => {
            setPassword(value);
          }}
        />
        <Checkbox
          label={<Trans>I want to receive the GDevelop Newsletter</Trans>}
          checked={getNewsletterEmail}
          onCheck={(e, value) => {
            setGetNewsletterEmail(value);
          }}
        />
      </ColumnStackLayout>
    </Dialog>
  );
};

export default CreateAccountDialog;
