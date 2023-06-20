//@flow
import * as React from 'react';
import { useState } from 'react';
import { t } from '@lingui/macro';
import { useDebounce } from '../Utils/UseDebounce';
import SemiControlledMultiAutoComplete, {
  type SemiControlledMultiAutoCompleteInterface,
} from '../UI/SemiControlledMultiAutoComplete';
import {
  searchCreatorPublicProfilesByUsername,
  type UserPublicProfile,
  getUserPublicProfilesByIds,
} from '../Utils/GDevelopServices/User';
import { type AutocompleteOption } from '../UI/SemiControlledMultiAutoComplete';

import useForceUpdate from '../Utils/UseForceUpdate';
import AuthenticatedUserContext from './AuthenticatedUserContext';

type Props = {|
  userIds: Array<string>,
  onChange: (Array<{| userId: string, username: string |}>) => void,
  floatingLabelText?: React.Node,
  helperText: React.Node,
  disabled?: boolean,
|};

const getErrorMessage = (error: ?Error) => {
  if (error) return 'Error while loading users';
};

export const UsersAutocomplete = ({
  userIds,
  onChange,
  floatingLabelText,
  helperText,
  disabled,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const [users, setUsers] = React.useState<Array<AutocompleteOption>>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = React.useContext(AuthenticatedUserContext);
  const completionOwnUserProfile = !!profile
    ? [
        {
          text: profile.username || 'Yourself (no username)',
          value: profile.id,
        },
      ]
    : [];
  const [
    completionUserPublicProfiles,
    setCompletionUserPublicProfiles,
  ] = React.useState<Array<UserPublicProfile>>([]);
  const [error, setError] = React.useState(null);
  const autocompleteRef = React.useRef<?SemiControlledMultiAutoCompleteInterface>(
    null
  );

  // Recalculate if the userInput has changed.
  const searchUserPublicProfiles = useDebounce(async () => {
    setError(null);
    if (!userInput) {
      setCompletionUserPublicProfiles([]);
      return;
    }
    try {
      setLoading(true);
      const userPublicProfiles = await searchCreatorPublicProfilesByUsername(
        userInput
      );
      const filteredPublicProfiles = profile
        ? userPublicProfiles.filter(({ id }) => id !== profile.id)
        : userPublicProfiles;
      setCompletionUserPublicProfiles(filteredPublicProfiles);
    } catch (err) {
      setError(err);
      console.error('Could not load the users: ', err);
    } finally {
      setLoading(false);
      focusInput();
    }
  }, 500);

  // Call every time the userInput changes.
  React.useEffect(
    () => {
      searchUserPublicProfiles();
    },
    [searchUserPublicProfiles, userInput]
  );

  // Do only once, the first time it is loaded.
  const getUserPublicProfilesForAutocomplete = React.useCallback(
    async () => {
      setError(null);
      if (!userIds.length) {
        setUsers([]);
        return;
      }
      try {
        setLoading(true);
        const userPublicProfilesByIds = await getUserPublicProfilesByIds(
          userIds
        );
        setUsers(
          userIds
            .map(userId => {
              const userPublicProfile: UserPublicProfile =
                userPublicProfilesByIds[userId];
              return userPublicProfile
                ? {
                    text:
                      userPublicProfile.username ||
                      `${
                        !!profile && userPublicProfile.id === profile.id
                          ? `Yourself`
                          : `Unknown`
                      } (no username)`,
                    value: userPublicProfile.id,
                  }
                : null;
            })
            .filter(Boolean)
        );
      } catch (err) {
        setError(err);
        console.error('Could not load the users: ', err);
      } finally {
        setLoading(false);
      }
    },
    [userIds, profile]
  );

  const focusInput = React.useCallback(() => {
    if (autocompleteRef.current) autocompleteRef.current.focusInput();
  }, []);

  // Do only once.
  React.useEffect(
    () => {
      getUserPublicProfilesForAutocomplete();
    },
    [getUserPublicProfilesForAutocomplete]
  );

  return (
    <SemiControlledMultiAutoComplete
      hintText={t`Start typing a username`}
      floatingLabelText={floatingLabelText}
      helperText={helperText}
      value={users}
      onChange={(event, values) => {
        if (!values) return;
        // change users in state
        setUsers(values);
        // call top onChange on user ids
        onChange(
          values.map(option => ({
            username: option.text,
            userId: option.value,
          }))
        );
        forceUpdate();
      }}
      inputValue={userInput}
      onInputChange={(event, value) => {
        setUserInput(value);
      }}
      ref={autocompleteRef}
      dataSource={completionOwnUserProfile.concat(
        completionUserPublicProfiles
          .map((userPublicProfile: UserPublicProfile) => {
            if (userPublicProfile.username && userPublicProfile.id) {
              return {
                text: userPublicProfile.username,
                value: userPublicProfile.id,
              };
            }

            return null;
          })
          .filter(Boolean)
      )}
      loading={loading || disabled}
      fullWidth
      error={getErrorMessage(error)}
      disableAutoTranslate
    />
  );
};
