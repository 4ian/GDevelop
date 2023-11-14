// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import TextField from '../UI/TextField';
import {
  type ForgotPasswordForm,
  type AuthError,
} from '../Utils/GDevelopServices/Authentication';
import Text from '../UI/Text';
import { getEmailErrorText, getPasswordErrorText } from './CreateAccountDialog';
import { ColumnStackLayout } from '../UI/Layout';
import Link from '../UI/Link';
import ForgotPasswordDialog from './ForgotPasswordDialog';
import Form from '../UI/Form';
import { Line } from '../UI/Grid';

type Props = {|
  onLogin: () => void,
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
              disableAutocapitalize
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
