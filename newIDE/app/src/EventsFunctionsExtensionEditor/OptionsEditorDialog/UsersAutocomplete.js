//@flow
import * as React from 'react';
import { useState } from 'react';
import { t } from '@lingui/macro';
import debounce from 'lodash/debounce';
import SemiControlledMultiAutoComplete from '../../UI/SemiControlledMultiAutoComplete';
import {
  searchUserPublicProfilesByUsername,
  type UserPublicProfile,
  getUserPublicProfilesByIds,
} from '../../Utils/GDevelopServices/User';

import useForceUpdate from '../../Utils/UseForceUpdate';

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

function asyncDebounce(func, wait) {
  const debounced = debounce((resolve, reject, args) => {
    func(...args)
      .then(resolve)
      .catch(reject);
  }, wait);
  return (...args) =>
    new Promise((resolve, reject) => {
      debounced(resolve, reject, args);
    });
}

const _searchUserPublicProfilesByUsername = asyncDebounce(
  userInput => searchUserPublicProfilesByUsername(userInput),
  500
);

export const UsersAutocomplete = (props: Props) => {
  const forceUpdate = useForceUpdate();
  const [users, setUsers] = React.useState<Array<Option>>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [
    completionUserPublicProfiles,
    setCompletionUserPublicProfiles,
  ] = React.useState<Array<UserPublicProfile>>([]);
  const [error, setError] = React.useState(null);

  // Recalculate if the userInput has changed.
  const searchUserPublicProfiles = React.useCallback(
    async () => {
      setError(null);
      if (!userInput) {
        setCompletionUserPublicProfiles([]);
        return;
      }
      try {
        setLoading(true);
        const userPublicProfiles = await _searchUserPublicProfilesByUsername(
          userInput
        );
        setCompletionUserPublicProfiles(userPublicProfiles);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err);
        console.error('Could not load the users: ', err);
      }
    },
    [userInput]
  );

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
            const userPublicProfile: UserPublicProfile =
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
      loading={loading}
      fullWidth
      error={getErrorMessage(error)}
    />
  );
};
