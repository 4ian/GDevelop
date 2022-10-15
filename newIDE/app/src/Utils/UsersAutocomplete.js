//@flow
import * as React from 'react';
import { useState } from 'react';
import { t } from '@lingui/macro';
import { useDebounce } from './UseDebounce';
import SemiControlledMultiAutoComplete from '../UI/SemiControlledMultiAutoComplete';
import {
  searchCreatorPublicProfilesByUsername,
  type UserPublicProfile,
  getUserPublicProfilesByIds,
} from './GDevelopServices/User';
import { type AutocompleteOption } from '../UI/SemiControlledMultiAutoComplete';

import useForceUpdate from './UseForceUpdate';

type Props = {|
  userIds: Array<string>,
  onChange: (Array<string>) => void,
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
  const [
    completionUserPublicProfiles,
    setCompletionUserPublicProfiles,
  ] = React.useState<Array<UserPublicProfile>>([]);
  const [error, setError] = React.useState(null);

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
      setCompletionUserPublicProfiles(userPublicProfiles);
    } catch (err) {
      setError(err);
      console.error('Could not load the users: ', err);
    } finally {
      setLoading(false);
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
                    text: userPublicProfile.username || '(no username)',
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
    [userIds]
  );

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
        onChange(values.map(option => option.value));
        forceUpdate();
      }}
      inputValue={userInput}
      onInputChange={(event, value) => {
        setUserInput(value);
      }}
      dataSource={completionUserPublicProfiles
        .map((userPublicProfile: UserPublicProfile) => {
          if (userPublicProfile.username && userPublicProfile.id) {
            return {
              text: userPublicProfile.username,
              value: userPublicProfile.id,
            };
          }

          return null;
        })
        .filter(Boolean)}
      loading={loading || disabled}
      fullWidth
      error={getErrorMessage(error)}
    />
  );
};
