// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import TextField from '../UI/TextField';

type Props = {|
  value: string,
  onChange: Function,
  errorText?: ?string,
  allowEmpty?: boolean,
|};

export const isUsernameValid = (
  username: string,
  allowEmpty: ?boolean
): boolean => {
  if (allowEmpty && username === '') return true;
  return !!username && /^[\w|-]+$/.test(username) && username.length < 31;
};

export const usernameFormatError =
  'Please pick a short username with only alphanumeric characters as well as _ and -';

export const UsernameField = ({
  value,
  onChange,
  errorText,
  allowEmpty,
}: Props) => {
  const getUsernameErrorText = () =>
    isUsernameValid(value, allowEmpty) ? undefined : usernameFormatError;

  return (
    <TextField
      autoFocus
      value={value}
      floatingLabelText={<Trans>Username</Trans>}
      fullWidth
      onChange={onChange}
      errorText={getUsernameErrorText() || errorText}
    />
  );
};
