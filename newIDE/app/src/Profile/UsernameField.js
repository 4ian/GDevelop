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

// Usernames of 2 letters are reserved for the languages of gd.games (`gd.games/fr` is the French home page).
// Users who already have one can keep it.
const isUsernameReserved = (
  username: string,
  initialUsername: ?string
): boolean =>
  /^[a-z]{2}$/i.test(username) &&
  (!initialUsername ||
    initialUsername.toLowerCase() !== username.toLowerCase());

export const usernameFormatErrorMessage: React.Node = (
  <Trans>
    Please pick a short username with only alphanumeric characters as well as _
    and -
  </Trans>
);

export const usernameAvailabilityErrorMessage: React.Node = (
  <Trans>This username is already used, please pick another one.</Trans>
);

const usernameReservedErrorMessage: React.Node = (
  <Trans>Usernames of 2 letters are reserved, please pick another one.</Trans>
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
}: Props): React.Node => {
  const usernameFormattingError = isUsernameValid(value, {
    allowEmpty: !!allowEmpty,
  })
    ? undefined
    : usernameFormatErrorMessage;
  const usernameReservedError = isUsernameReserved(value, initialUsername)
    ? usernameReservedErrorMessage
    : undefined;

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
    // Reported as not available, so that it can't be submitted.
    if (isUsernameReserved(username, initialUsername)) {
      updateUsernameAvailability({
        usernameAvailability: { username, isAvailable: false },
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
      name="username"
      autoComplete="nickname"
      fullWidth
      onChange={onChange}
      errorText={
        usernameFormattingError ||
        usernameReservedError ||
        usernameAvailabilityError ||
        errorText
      }
      endAdornment={
        isValidatingUsername && (
          // $FlowFixMe[incompatible-type]
          <CircularProgress style={styles.circularProgress} />
        )
      }
      disabled={disabled}
      maxLength={50}
    />
  );
};
