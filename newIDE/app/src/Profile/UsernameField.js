// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import TextField from '../UI/TextField';
import {
  getUsernameAvailability,
  type UsernameAvailability,
} from '../Utils/GDevelopServices/User';
import { useDebounce } from '../Utils/UseDebounce';

type Props = {|
  initialUsername?: ?string,
  value: string,
  onChange: (event: {| target: {| value: string |} |}, value: string) => void,
  onAvailabilityCheckLoading: boolean => void,
  onAvailabilityChecked: (?UsernameAvailability) => void,
  errorText?: ?string,
  allowEmpty?: boolean,
|};

export const isUsernameValid = (
  username: string,
  options?: { allowEmpty: boolean }
): boolean => {
  if (options && options.allowEmpty && username === '') return true;
  return !!username && /^[\w|-]+$/.test(username) && username.length < 31;
};

export const usernameFormatErrorMessage =
  'Please pick a short username with only alphanumeric characters as well as _ and -';

const usernameAvailabilityErrorMessage =
  'This username is already used, please pick another one.';

export const UsernameField = ({
  initialUsername,
  value,
  onChange,
  errorText,
  allowEmpty,
  onAvailabilityChecked,
  onAvailabilityCheckLoading,
}: Props) => {
  const usernameFormattingError = React.useMemo(
    () =>
      isUsernameValid(value, { allowEmpty: !!allowEmpty })
        ? undefined
        : usernameFormatErrorMessage,
    [value, allowEmpty]
  );

  const [
    usernameAvailabilityError,
    setUsernameAvailabilityError,
  ] = React.useState<?string>(null);

  const updateUsernameAvailability = ({
    usernameAvailability,
    error,
  }: {
    usernameAvailability: UsernameAvailability | null,
    error: string | null,
  }) => {
    onAvailabilityChecked(usernameAvailability);
    setUsernameAvailabilityError(error);
    onAvailabilityCheckLoading(false);
  };

  const checkUsernameAvailability = useDebounce(async (username: string) => {
    // If just casing change, the username is always available.
    if (
      initialUsername &&
      initialUsername.toLowerCase() === username.toLowerCase()
    ) {
      updateUsernameAvailability({
        usernameAvailability: { username, isAvailable: true },
        error: null,
      });
      return;
    }
    // no username or invalid, no need to check availability.
    if (!username || !isUsernameValid(username, { allowEmpty: !!allowEmpty })) {
      updateUsernameAvailability({
        usernameAvailability: null,
        error: null,
      });
      return;
    }

    try {
      const usernameAvailability = await getUsernameAvailability(username);

      if (!usernameAvailability) {
        console.error('Unable to check username availability.');
        // Do not block user creation.
        updateUsernameAvailability({
          usernameAvailability: null,
          error: null,
        });
      } else {
        updateUsernameAvailability({
          usernameAvailability,
          error: usernameAvailability.isAvailable
            ? null
            : usernameAvailabilityErrorMessage,
        });
      }
    } catch (error) {
      console.error('Unable to check username availability.');
      // Do not block user creation.
      updateUsernameAvailability({
        usernameAvailability: null,
        error: null,
      });
    }
  }, 500);

  React.useEffect(
    () => {
      checkUsernameAvailability(value);
    },
    [value, checkUsernameAvailability]
  );

  return (
    <TextField
      autoFocus
      value={value}
      floatingLabelText={<Trans>Username</Trans>}
      fullWidth
      onChange={(event, value) => {
        onChange(event, value);
        if (value) {
          onAvailabilityCheckLoading(true);
        }
      }}
      errorText={
        usernameFormattingError || usernameAvailabilityError || errorText
      }
    />
  );
};
