//@flow
import React from 'react';
import { useState } from 'react';
import { t } from '@lingui/macro';
import SemiControlledMultiAutoComplete from '../../UI/SemiControlledMultiAutoComplete';
import {
  searchUserPublicProfilesByUsername,
  type UserPublicProfile,
  getUserPublicProfilesByIds,
} from '../../Utils/GDevelopServices/User';

import useForceUpdate from '../../Utils/UseForceUpdate';

type Props = {|
  eventsFunctionsExtension: gdEventsFunctionsExtension,
|};

export const UsersAutocomplete = (props: Props) => {
  const forceUpdate = useForceUpdate();
  const [authors, setAuthors] = React.useState([]);
  const [authorInput, setAuthorInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [
    completionUserPublicProfiles,
    setCompletionUserPublicProfiles,
  ] = React.useState<Array<UserPublicProfile>>([]);
  const [authorsError, setAuthorsError] = React.useState(null);

  // recalculate if the authorInput has changed
  const searchUserPublicProfiles = React.useCallback(
    async () => {
      setAuthorsError(null);
      if (!authorInput) {
        setCompletionUserPublicProfiles([]);
        return;
      }
      try {
        setLoading(true);
        const userPublicProfiles = await searchUserPublicProfilesByUsername(
          authorInput
        );
        setCompletionUserPublicProfiles(userPublicProfiles);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setAuthorsError('Error while loading users');
        console.log(err);
      }
    },
    [authorInput]
  );

  // call every time the authorInput changes
  React.useEffect(
    () => {
      searchUserPublicProfiles();
    },
    [searchUserPublicProfiles, authorInput]
  );

  // do only once, the first time it is loaded
  const getUserPublicProfilesForAutocomplete = React.useCallback(
    async () => {
      setAuthorsError(null);
      const authorIds = props.eventsFunctionsExtension
        .getAuthorIds()
        .toJSArray();
      if (!authorIds.length) {
        setAuthors([]);
        return;
      }
      try {
        setLoading(true);
        const userPublicProfilesByIds = await getUserPublicProfilesByIds(
          authorIds
        );
        setAuthors(
          Object.keys(userPublicProfilesByIds).map(userId => {
            const userPublicProfile: UserPublicProfile =
              userPublicProfilesByIds[userId];
            if (userPublicProfile.username && userPublicProfile.id) {
              return {
                text: userPublicProfile.username,
                value: userPublicProfile.id,
              };
            }

            return null;
          })
        );
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setAuthorsError('Error while loading the authors');
        console.log(err);
      }
    },
    [props.eventsFunctionsExtension]
  );

  // do only once
  React.useEffect(
    () => {
      getUserPublicProfilesForAutocomplete();
    },
    [getUserPublicProfilesForAutocomplete]
  );

  return (
    <SemiControlledMultiAutoComplete
      hintText={t`Start typing a username`}
      floatingLabelText={t`Authors`}
      helperText={t`Select all the extensions contributors usernames. They will be displayed in the order selected.`}
      value={authors}
      onChange={(event, values) => {
        if (values) {
          // change authors in state
          setAuthors(values);
          // change authors in project
          const authors = props.eventsFunctionsExtension.getAuthorIds();
          authors.clear();
          values.forEach(({ text, value }) => {
            authors.push_back(value);
          });
          forceUpdate();
        }
      }}
      inputValue={authorInput}
      onInputChange={(event, value) => {
        setAuthorInput(value);
      }}
      dataSource={completionUserPublicProfiles.map(
        (userPublicProfile: UserPublicProfile) => {
          if (userPublicProfile.username && userPublicProfile.id) {
            return {
              text: userPublicProfile.username,
              value: userPublicProfile.id,
            };
          }

          return null;
        }
      )}
      loading={loading}
      fullWidth
      error={authorsError}
    />
  );
};
