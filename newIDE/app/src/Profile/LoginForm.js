// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import TextField from '../UI/TextField';
import {
  type ForgotPasswordForm,
  type AuthError,
  type IdentityProvider,
} from '../Utils/GDevelopServices/Authentication';
import Text from '../UI/Text';
import { getEmailErrorText, getPasswordErrorText } from './CreateAccountDialog';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import Link from '../UI/Link';
import ForgotPasswordDialog from './ForgotPasswordDialog';
import Form from '../UI/Form';
import { Line } from '../UI/Grid';
import FlatButton from '../UI/FlatButton';
import AlertMessage from '../UI/AlertMessage';
import Google from '../UI/CustomSvgIcons/Google';
import Apple from '../UI/CustomSvgIcons/Apple';
import GitHub from '../UI/CustomSvgIcons/GitHub';

const styles = {
  identityProvidersBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    marginTop: 30,
  },
};

export const accountsAlreadyExistsWithDifferentProviderCopy = (
  <Trans>
    You already have an account for this email address with a different provider
    (Google, Apple or GitHub). Please try with one of those.
  </Trans>
);

type Props = {|
  onLogin: () => void,
  onLoginWithProvider: (provider: IdentityProvider) => Promise<void>,
  email: string,
  onChangeEmail: string => void,
  password: string,
  onChangePassword: string => void,
  onForgotPassword: (form: ForgotPasswordForm) => Promise<void>,
  loginInProgress: boolean,
  error: ?AuthError,
|};

const LoginForm = ({
  onLogin,
  onLoginWithProvider,
  email,
  onChangeEmail,
  password,
  onChangePassword,
  onForgotPassword,
  loginInProgress,
  error,
}: Props) => {
  const [
    isForgotPasswordDialogOpen,
    setIsForgotPasswordDialogOpen,
  ] = React.useState(false);

  const accountsExistsWithOtherCredentials = error
    ? error.code === 'auth/account-exists-with-different-credential'
    : false;

  return (
    <>
      <ColumnStackLayout
        noMargin
        expand
        justifyContent="center"
        alignItems="stretch"
      >
        <Form onSubmit={onLogin} autoComplete="on" name="login">
          <ColumnStackLayout noMargin>
            {accountsExistsWithOtherCredentials && (
              <AlertMessage kind="error">
                {accountsAlreadyExistsWithDifferentProviderCopy}
              </AlertMessage>
            )}
            <TextField
              autoFocus="desktop"
              value={email}
              floatingLabelText={<Trans>Email</Trans>}
              errorText={getEmailErrorText(error)}
              onChange={(e, value) => {
                onChangeEmail(value);
              }}
              onBlur={event => {
                onChangeEmail(event.currentTarget.value.trim());
              }}
              fullWidth
              type="email"
              disabled={loginInProgress}
            />
            <TextField
              value={password}
              floatingLabelText={<Trans>Password</Trans>}
              errorText={getPasswordErrorText(error)}
              type="password"
              onChange={(e, value) => {
                onChangePassword(value);
              }}
              fullWidth
              disabled={loginInProgress}
            />
          </ColumnStackLayout>
        </Form>
        <Line noMargin justifyContent="center">
          <Link
            href=""
            onClick={() => setIsForgotPasswordDialogOpen(true)}
            disabled={loginInProgress}
          >
            <Text size="body2" noMargin color="inherit">
              <Trans>Did you forget your password?</Trans>
            </Text>
          </Link>
        </Line>
        <div style={styles.identityProvidersBlock}>
          <Line noMargin justifyContent="center">
            <Text size="body2" noMargin>
              <Trans>Or continue with</Trans>
            </Text>
          </Line>
          <Line>
            <ResponsiveLineStackLayout expand noColumnMargin noMargin>
              <FlatButton
                primary
                fullWidth
                label="Google"
                leftIcon={<Google />}
                onClick={() => {
                  onLoginWithProvider('google');
                }}
                disabled={loginInProgress}
              />
              <FlatButton
                primary
                fullWidth
                label="GitHub"
                leftIcon={<GitHub />}
                onClick={() => {
                  onLoginWithProvider('github');
                }}
                disabled={loginInProgress}
              />
              <FlatButton
                primary
                fullWidth
                label="Apple"
                leftIcon={<Apple />}
                onClick={() => {
                  onLoginWithProvider('apple');
                }}
                disabled={loginInProgress}
              />
            </ResponsiveLineStackLayout>
          </Line>
        </div>
      </ColumnStackLayout>
      {isForgotPasswordDialogOpen && (
        <ForgotPasswordDialog
          onClose={() => setIsForgotPasswordDialogOpen(false)}
          onForgotPassword={onForgotPassword}
        />
      )}
    </>
  );
};

export default LoginForm;
