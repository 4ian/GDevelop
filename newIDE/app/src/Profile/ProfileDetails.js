// @flow
import { Trans, t } from '@lingui/macro';

import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Column, Line, Spacer } from '../UI/Grid';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { getGravatarUrl } from '../UI/GravatarUrl';
import Text from '../UI/Text';
import TextField from '../UI/TextField';
import { I18n } from '@lingui/react';
import PlaceholderError from '../UI/PlaceholderError';

type DisplayedProfile = {
  +email?: string,
  description: ?string,
  username: ?string,
};

type Props = {|
  profile: ?DisplayedProfile,
  isAuthenticatedUserProfile?: boolean,
  error?: ?Error,
  onRetry?: () => void,
|};

const ProfileDetails = ({
  profile,
  isAuthenticatedUserProfile,
  error,
  onRetry,
}: Props) => {
  return profile ? (
    <I18n>
      {({ i18n }) => (
        <Column>
          <Line alignItems="center">
            <Avatar src={getGravatarUrl(profile.email || '', { size: 40 })} />
            <Spacer />
            <Text
              size="title"
              style={{
                opacity: profile.username ? 1.0 : 0.5,
              }}
            >
              {profile.username ||
                (isAuthenticatedUserProfile
                  ? i18n._(t`Edit your profile to pick a username!`)
                  : i18n._(t`No username`))}
            </Text>
          </Line>
          {isAuthenticatedUserProfile && profile.email && (
            <Line>
              <TextField
                value={profile.email}
                readOnly
                fullWidth
                floatingLabelText={<Trans>Email</Trans>}
                floatingLabelFixed={true}
              />
            </Line>
          )}
          <Line>
            <TextField
              value={profile.description || ''}
              readOnly
              fullWidth
              multiline
              floatingLabelText={<Trans>Bio</Trans>}
              floatingLabelFixed={true}
              hintText={
                isAuthenticatedUserProfile
                  ? t`No bio defined. Edit your profile to tell us what you are using GDevelop for!`
                  : t`No bio defined.`
              }
              rows={3}
              rowsMax={5}
            />
          </Line>
        </Column>
      )}
    </I18n>
  ) : error ? (
    <PlaceholderError onRetry={onRetry}>
      <Trans>
        Unable to load the profile, please verify your internet connection or
        try again later.
      </Trans>
    </PlaceholderError>
  ) : (
    <PlaceholderLoader />
  );
};

export default ProfileDetails;
