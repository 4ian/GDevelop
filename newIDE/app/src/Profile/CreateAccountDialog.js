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
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import { MarkdownText } from '../UI/MarkdownText';
import { UsernameField, isUsernameValid } from './UsernameField';
import Checkbox from '../UI/Checkbox';
import HelpButton from '../UI/HelpButton';
import Text from '../UI/Text';
import GDevelopGLogo from '../UI/CustomSvgIcons/GDevelopGLogo';
import { Column } from '../UI/Grid';
import Link from '../UI/Link';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import Form from '../UI/Form';

const getStyles = ({ windowWidth }) => {
  const isMobileScreen = windowWidth === 'small';
  return {
    formContainer: {
      width: isMobileScreen ? '95%' : '60%',
      marginTop: 20,
    },
  };
};

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
    return <Trans>This account has been deactivated or deleted.</Trans>;
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
  if (error.code === 'auth/network-request-failed')
    return (
      <Trans>
        The request could not reach the servers, ensure you are connected to
        internet.
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
  const windowWidth = useResponsiveWindowWidth();
  const styles = getStyles({ windowWidth });
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

  const createAccount = async () => {
    if (!canCreateAccount) return;
    try {
      await onCreateAccount({
        email: email.trim(),
        password,
        username,
        getNewsletterEmail,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog
      title={null} // This dialog has a custom design to be more welcoming, the title is set in the content.
      id="create-account-dialog"
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
            label={<Trans>Create account</Trans>}
            id="create-account-button"
            primary
            disabled={!canCreateAccount}
            onClick={createAccount}
          />
        </LeftLoader>,
      ]}
      secondaryActions={[
        <HelpButton key="help" helpPagePath={'/interface/profile'} />,
      ]}
      cannotBeDismissed={createAccountInProgress}
      onApply={createAccount}
      onRequestClose={() => {
        if (!createAccountInProgress) onClose();
      }}
      maxWidth="sm"
      open
      flexColumnBody
    >
      <ColumnStackLayout
        noMargin
        expand
        justifyContent="center"
        alignItems="center"
      >
        <GDevelopGLogo fontSize="large" />
        <Text size="title" align="center">
          <Trans>Sign up for free!</Trans>
        </Text>
        <Column noMargin alignItems="center">
          <Text size="body2" noMargin align="center">
            <Trans>Welcome to GDevelop!</Trans>
          </Text>
          <LineStackLayout noMargin>
            <Text size="body2" noMargin align="center">
              <Trans>Already a member?</Trans>
            </Text>
            <Link
              href="#"
              onClick={onGoToLogin}
              disabled={createAccountInProgress}
            >
              <Text size="body2" noMargin color="inherit">
                <Trans>Log in to your account</Trans>
              </Text>
            </Link>
          </LineStackLayout>
        </Column>
        <div style={styles.formContainer}>
          <Form onSubmit={createAccount} autoComplete="on" name="createAccount">
            <ColumnStackLayout noMargin>
              <UsernameField
                value={username}
                onChange={(e, value) => {
                  setUsername(value);
                }}
                allowEmpty
                onAvailabilityChecked={setUsernameAvailability}
                onAvailabilityCheckLoading={setIsValidatingUsername}
                isValidatingUsername={isValidatingUsername}
                disabled={createAccountInProgress}
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
                onBlur={event => {
                  setEmail(event.currentTarget.value.trim());
                }}
                disabled={createAccountInProgress}
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
                disabled={createAccountInProgress}
              />
              <Checkbox
                label={<Trans>I want to receive the GDevelop Newsletter</Trans>}
                checked={getNewsletterEmail}
                onCheck={(e, value) => {
                  setGetNewsletterEmail(value);
                }}
                disabled={createAccountInProgress}
              />
            </ColumnStackLayout>
          </Form>
        </div>
        <BackgroundText>
          <MarkdownText
            translatableSource={t`By creating an account and using GDevelop, you agree to the [Terms and Conditions](https://gdevelop.io/page/terms-and-conditions).`}
          />
        </BackgroundText>
      </ColumnStackLayout>
    </Dialog>
  );
};

export default CreateAccountDialog;
