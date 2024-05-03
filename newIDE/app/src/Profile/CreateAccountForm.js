// @flow
import React from 'react';
import { Trans } from '@lingui/macro';

import TextField from '../UI/TextField';
import {
  type AuthError,
  type IdentityProvider,
} from '../Utils/GDevelopServices/Authentication';
import { type UsernameAvailability } from '../Utils/GDevelopServices/User';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import { UsernameField } from './UsernameField';
import Checkbox from '../UI/Checkbox';
import Form from '../UI/Form';
import { getEmailErrorText, getPasswordErrorText } from './CreateAccountDialog';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';
import FlatButton from '../UI/FlatButton';
import Google from '../UI/CustomSvgIcons/Google';
import Apple from '../UI/CustomSvgIcons/Apple';
import GitHub from '../UI/CustomSvgIcons/GitHub';
import AlertMessage from '../UI/AlertMessage';
import { accountsAlreadyExistsWithDifferentProviderCopy } from './LoginForm';

const styles = {
  identityProvidersBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    marginTop: 30,
  },
};

type Props = {|
  onCreateAccount: () => Promise<void>,
  onLoginWithProvider: (provider: IdentityProvider) => Promise<void>,
  email: string,
  onChangeEmail: string => void,
  password: string,
  onChangePassword: string => void,
  username: string,
  onChangeUsername: string => void,
  optInNewsletterEmail: boolean,
  onChangeOptInNewsletterEmail: boolean => void,
  usernameAvailability: ?UsernameAvailability,
  onChangeUsernameAvailability: (?UsernameAvailability) => void,
  isValidatingUsername: boolean,
  onChangeIsValidatingUsername: boolean => void,
  createAccountInProgress: boolean,
  error: ?AuthError,
|};

const CreateAccountForm = ({
  onCreateAccount,
  onLoginWithProvider,
  email,
  onChangeEmail,
  password,
  onChangePassword,
  username,
  onChangeUsername,
  optInNewsletterEmail,
  onChangeOptInNewsletterEmail,
  usernameAvailability,
  onChangeUsernameAvailability,
  isValidatingUsername,
  onChangeIsValidatingUsername,
  createAccountInProgress,
  error,
}: Props) => {
  const accountsExistsWithOtherCredentials = error
    ? error.code === 'auth/account-exists-with-different-credential'
    : false;

  return (
    <Column noMargin expand justifyContent="center" alignItems="center">
      <Form onSubmit={onCreateAccount} autoComplete="on" name="createAccount">
        <ColumnStackLayout noMargin>
          {accountsExistsWithOtherCredentials && (
            <AlertMessage kind="error">
              {accountsAlreadyExistsWithDifferentProviderCopy}
            </AlertMessage>
          )}
          <UsernameField
            value={username}
            onChange={(e, value) => {
              onChangeUsername(value);
            }}
            allowEmpty
            onAvailabilityChecked={onChangeUsernameAvailability}
            onAvailabilityCheckLoading={onChangeIsValidatingUsername}
            isValidatingUsername={isValidatingUsername}
            disabled={createAccountInProgress}
          />
          <TextField
            value={email}
            floatingLabelText={<Trans>Email</Trans>}
            errorText={getEmailErrorText(error)}
            fullWidth
            type="email"
            required
            onChange={(e, value) => {
              onChangeEmail(value);
            }}
            onBlur={event => {
              onChangeEmail(event.currentTarget.value.trim());
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
              onChangePassword(value);
            }}
            disabled={createAccountInProgress}
          />
          <Checkbox
            label={<Trans>I want to receive the GDevelop Newsletter</Trans>}
            checked={optInNewsletterEmail}
            onCheck={(e, value) => {
              onChangeOptInNewsletterEmail(value);
            }}
            disabled={createAccountInProgress}
          />
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
                  disabled={createAccountInProgress}
                />
                <FlatButton
                  primary
                  fullWidth
                  label="GitHub"
                  leftIcon={<GitHub />}
                  onClick={() => {
                    onLoginWithProvider('github');
                  }}
                  disabled={createAccountInProgress}
                />
                <FlatButton
                  primary
                  fullWidth
                  label="Apple"
                  leftIcon={<Apple />}
                  onClick={() => {
                    onLoginWithProvider('apple');
                  }}
                  disabled={createAccountInProgress}
                />
              </ResponsiveLineStackLayout>
            </Line>
          </div>
        </ColumnStackLayout>
      </Form>
    </Column>
  );
};

export default CreateAccountForm;
