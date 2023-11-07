// @flow
import React from 'react';
import { Trans } from '@lingui/macro';

import TextField from '../UI/TextField';
import { type AuthError } from '../Utils/GDevelopServices/Authentication';
import { type UsernameAvailability } from '../Utils/GDevelopServices/User';
import { ColumnStackLayout } from '../UI/Layout';
import { UsernameField } from './UsernameField';
import Checkbox from '../UI/Checkbox';
import Form from '../UI/Form';
import { getEmailErrorText, getPasswordErrorText } from './CreateAccountDialog';
import { Column } from '../UI/Grid';

type Props = {|
  onCreateAccount: () => Promise<void>,
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
  return (
    <Column noMargin expand justifyContent="center" alignItems="center">
      <Form onSubmit={onCreateAccount} autoComplete="on" name="createAccount">
        <ColumnStackLayout noMargin>
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
        </ColumnStackLayout>
      </Form>
    </Column>
  );
};

export default CreateAccountForm;
