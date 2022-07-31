// @flow
import { Trans, t } from '@lingui/macro';

import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import OpenInNew from '@material-ui/icons/OpenInNew';
import { Line, Spacer } from '../UI/Grid';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { getGravatarUrl } from '../UI/GravatarUrl';
import Text from '../UI/Text';
import TextField from '../UI/TextField';
import { I18n } from '@lingui/react';
import PlaceholderError from '../UI/PlaceholderError';
import RaisedButton from '../UI/RaisedButton';
import UserAchievements from './Achievement/UserAchievements';
import { type Badge } from '../Utils/GDevelopServices/Badge';
import Window from '../Utils/Window';
import { GDevelopGamesPlatform } from '../Utils/GDevelopServices/ApiConfigs';

type DisplayedProfile = {
  id: string,
  +email?: string,
  description: ?string,
  username: ?string,
};

type Props = {|
  profile: ?DisplayedProfile,
  isAuthenticatedUserProfile?: boolean,
  error?: ?Error,
  onRetry?: () => void,
  onChangeEmail?: () => void,
  onEditProfile?: () => void,
  badges: ?Array<Badge>,
|};

const ProfileDetails = ({
  profile,
  isAuthenticatedUserProfile,
  error,
  onRetry,
  onChangeEmail,
  onEditProfile,
  badges,
}: Props) => {
  return profile ? (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          <ResponsiveLineStackLayout
            alignItems="center"
            justifyContent="space-between"
            noMargin
          >
            <Line>
              <Avatar src={getGravatarUrl(profile.email || '', { size: 40 })} />
              <Spacer />
              <Text
                size="block-title"
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
            {profile.id && (
              <RaisedButton
                label={i18n._(t`Access public profile`)}
                onClick={() =>
                  Window.openExternalURL(
                    GDevelopGamesPlatform.getUserPublicProfileUrl(
                      profile.id,
                      profile.username
                    )
                  )
                }
                icon={<OpenInNew />}
              />
            )}
          </ResponsiveLineStackLayout>
          {isAuthenticatedUserProfile && profile.email && (
            <Line noMargin>
              <TextField
                value={profile.email}
                readOnly
                fullWidth
                floatingLabelText={<Trans>Email</Trans>}
                floatingLabelFixed={true}
              />
            </Line>
          )}
          <Line noMargin>
            <TextField
              value={profile.description || ''}
              readOnly
              fullWidth
              multiline
              floatingLabelText={<Trans>Bio</Trans>}
              floatingLabelFixed={true}
              translatableHintText={
                isAuthenticatedUserProfile
                  ? t`No bio defined. Edit your profile to tell us what you are using GDevelop for!`
                  : t`No bio defined.`
              }
              rows={3}
              rowsMax={5}
            />
          </Line>
          {isAuthenticatedUserProfile && (
            <ResponsiveLineStackLayout justifyContent="flex-end" noMargin>
              <RaisedButton
                label={<Trans>Change my email</Trans>}
                onClick={onChangeEmail}
              />
              <RaisedButton
                label={<Trans>Edit my profile</Trans>}
                primary
                onClick={onEditProfile}
              />
            </ResponsiveLineStackLayout>
          )}
          <UserAchievements
            badges={badges}
            displayUnclaimedAchievements={!!isAuthenticatedUserProfile}
            displayNotifications={!!isAuthenticatedUserProfile}
          />
        </ColumnStackLayout>
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
