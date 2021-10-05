//@flow
import * as React from 'react';
import { useState } from 'react';
import { t } from '@lingui/macro';
import { useDebounce } from './UseDebounce';
import SemiControlledMultiAutoComplete from '../UI/SemiControlledMultiAutoComplete';
import {
  searchUserPublicProfilesByUsername,
  type UserPublicProfileSearch,
  getUserPublicProfilesByIds,
} from './GDevelopServices/User';

import useForceUpdate from './UseForceUpdate';

type Props = {|
  userIds: gdVectorString,
  floatingLabelText?: React.Node,
  helperText: React.Node,
|};

type Option = {|
  text: string,
  value: string,
|};

const getErrorMessage = (error: ?Error) => {
  if (error) return 'Error while loading users';
};

export const UsersAutocomplete = (props: Props) => {
  const forceUpdate = useForceUpdate();
  const [users, setUsers] = React.useState<Array<Option>>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [
    completionUserPublicProfiles,
    setCompletionUserPublicProfiles,
  ] = React.useState<Array<UserPublicProfileSearch>>([]);
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
      const userPublicProfiles = await searchUserPublicProfilesByUsername(
        userInput
      );
      setCompletionUserPublicProfiles(userPublicProfiles);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err);
      console.error('Could not load the users: ', err);
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
      const userIds = props.userIds.toJSArray();
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
          Object.keys(userPublicProfilesByIds).map(userId => {
            const userPublicProfile: UserPublicProfileSearch =
              userPublicProfilesByIds[userId];
            return {
              text: userPublicProfile.username || '(no username)',
              value: userPublicProfile.id,
            };
          })
        );
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err);
        console.error('Could not load the users: ', err);
      }
    },
    [props.userIds]
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
      floatingLabelText={props.floatingLabelText}
      helperText={props.helperText}
      value={users}
      onChange={(event, values) => {
        if (!values) return;
        // change users in state
        setUsers(values);
        // change users in project
        const userIds = props.userIds;
        userIds.clear();
        values.forEach(({ text, value }) => {
          userIds.push_back(value);
        });
        forceUpdate();
      }}
      inputValue={userInput}
      onInputChange={(event, value) => {
        setUserInput(value);
      }}
      dataSource={completionUserPublicProfiles
        .map((userPublicProfile: UserPublicProfileSearch) => {
          if (userPublicProfile.username && userPublicProfile.id) {
            return {
              text: userPublicProfile.username,
              value: userPublicProfile.id,
            };
          }

          return null;
        })
        .filter(Boolean)}
      loading={loading}
      fullWidth
      error={getErrorMessage(error)}
    />
  );
};
