// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import CircularProgress from '../UI/CircularProgress';
import TextField from '../UI/TextField';
import {
  getUsernameAvailability,
  type UsernameAvailability,
} from '../Utils/GDevelopServices/User';
import { useDebounce } from '../Utils/UseDebounce';

const styles = {
  circularProgress: {
    height: 20,
    width: 20,
  },
};

export const isUsernameValid = (
  username: string,
  options?: { allowEmpty: boolean }
): boolean => {
  if (options && options.allowEmpty && username === '') return true;
  return !!username && /^[\w|-]+$/.test(username) && username.length < 31;
};

export const usernameFormatErrorMessage = (
  <Trans>
    Please pick a short username with only alphanumeric characters as well as _
    and -
  </Trans>
);

export const usernameAvailabilityErrorMessage = (
  <Trans>This username is already used, please pick another one.</Trans>
);

type Props = {|
  initialUsername?: ?string,
  value: string,
  onChange: (event: {| target: {| value: string |} |}, value: string) => void,
  isValidatingUsername: boolean,
  onAvailabilityCheckLoading: boolean => void,
  onAvailabilityChecked: (?UsernameAvailability) => void,
  errorText?: ?React.Node,
  allowEmpty?: boolean,
  disabled?: boolean,
|};

export const UsernameField = ({
  initialUsername,
  value,
  onChange,
  errorText,
  allowEmpty,
  onAvailabilityChecked,
  onAvailabilityCheckLoading,
  isValidatingUsername,
  disabled,
}: Props) => {
  const usernameFormattingError = isUsernameValid(value, {
    allowEmpty: !!allowEmpty,
  })
    ? undefined
    : usernameFormatErrorMessage;

  const [
    usernameAvailabilityError,
    setUsernameAvailabilityError,
  ] = React.useState<?React.Node>(null);

  const updateUsernameAvailability = ({
    usernameAvailability,
    error,
  }: {
    usernameAvailability: ?UsernameAvailability,
    error: ?React.Node,
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
      onAvailabilityCheckLoading(true);

      const usernameAvailability = await getUsernameAvailability(username);

      if (!usernameAvailability) {
        throw new Error('Could not get username availability.');
      } else {
        updateUsernameAvailability({
          usernameAvailability,
          error: usernameAvailability.isAvailable
            ? null
            : usernameAvailabilityErrorMessage,
        });
      }
    } catch (error) {
      console.error('Unable to check username availability.', error);
      // Do not block user creation.
      updateUsernameAvailability({
        usernameAvailability: null,
        error: null,
      });
    } finally {
      onAvailabilityCheckLoading(false);
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
      autoFocus="desktop"
      value={value}
      floatingLabelText={<Trans>Username</Trans>}
      fullWidth
      onChange={onChange}
      errorText={
        usernameFormattingError || usernameAvailabilityError || errorText
      }
      endAdornment={
        isValidatingUsername && (
          <CircularProgress style={styles.circularProgress} />
        )
      }
      disabled={disabled}
      maxLength={50}
    />
  );
};
