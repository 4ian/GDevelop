// @flow
import { Trans, t } from '@lingui/macro';

import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import OpenInNew from '@material-ui/icons/OpenInNew';
import { Line, Spacer } from '../UI/Grid';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { getGravatarUrl } from '../UI/GravatarUrl';
import Text from '../UI/Text';
import TextField from '../UI/TextField';
import { I18n } from '@lingui/react';
import PlaceholderError from '../UI/PlaceholderError';
import RaisedButton from '../UI/RaisedButton';
import UserAchievements from './Achievement/UserAchievements';
import { type Badge } from '../Utils/GDevelopServices/Badge';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';
import Window from '../Utils/Window';
import { GDevelopGamesPlatform } from '../Utils/GDevelopServices/ApiConfigs';
import FlatButton from '../UI/FlatButton';
import Coffee from '../UI/CustomSvgIcons/Coffee';
import { GridList } from '@material-ui/core';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import { PrivateAssetPackTile } from '../AssetStore/AssetsHome';
import { sendAssetPackOpened } from '../Utils/Analytics/EventSender';

type DisplayedProfile = {
  id: string,
  +email?: string,
  description: ?string,
  donateLink: ?string,
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
  assetPacksListingData?: ?Array<PrivateAssetPackListingData>,
  onAssetPackOpen?: (assetPack: PrivateAssetPackListingData) => void,
|};

const ProfileDetails = ({
  profile,
  isAuthenticatedUserProfile,
  error,
  onRetry,
  onChangeEmail,
  onEditProfile,
  badges,
  assetPacksListingData,
  onAssetPackOpen,
}: Props) => {
  const donateLink = profile ? profile.donateLink : null;
  const windowWidth = useResponsiveWindowWidth();

  return !!profile &&
    // ensure asset packs or badges are loaded to avoid a layout shift.
    ((isAuthenticatedUserProfile && !!badges) ||
      (!isAuthenticatedUserProfile && !!assetPacksListingData)) ? (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          <ResponsiveLineStackLayout
            alignItems="center"
            justifyContent="space-between"
            noMargin
          >
            <Line noMargin alignItems="center">
              <Avatar src={getGravatarUrl(profile.email || '', { size: 40 })} />
              <Spacer />
              <Text
                size="block-title"
                allowBrowserAutoTranslate={!profile.username}
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
              <LineStackLayout justifyContent="space-between">
                {!isAuthenticatedUserProfile && // Only show on Public Profile.
                  !!donateLink && (
                    <RaisedButton
                      label={<Trans>Buy me a coffee</Trans>}
                      primary
                      onClick={() => Window.openExternalURL(donateLink)}
                      icon={<Coffee />}
                    />
                  )}
                <FlatButton
                  label={<Trans>Access public profile</Trans>}
                  onClick={() =>
                    Window.openExternalURL(
                      GDevelopGamesPlatform.getUserPublicProfileUrl(
                        profile.id,
                        profile.username
                      )
                    )
                  }
                  leftIcon={<OpenInNew />}
                />
              </LineStackLayout>
            )}
          </ResponsiveLineStackLayout>
          {isAuthenticatedUserProfile && profile.email && (
            <Line noMargin>
              <TextField
                value={profile.email}
                readOnly
                fullWidth
                floatingLabelText={<Trans>Email</Trans>}
                floatingLabelFixed
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
              floatingLabelFixed
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
            <Line noMargin>
              <TextField
                value={profile.donateLink || ''}
                readOnly
                fullWidth
                floatingLabelText={<Trans>Donate link</Trans>}
                floatingLabelFixed
                translatableHintText={t`No link defined.`}
              />
            </Line>
          )}
          {isAuthenticatedUserProfile && (
            <ResponsiveLineStackLayout justifyContent="flex-end" noMargin>
              <FlatButton
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
          {!isAuthenticatedUserProfile &&
            onAssetPackOpen &&
            assetPacksListingData &&
            assetPacksListingData.length > 0 && (
              <ColumnStackLayout expand noMargin>
                <Line noMargin>
                  <Text size="block-title">
                    <Trans>Asset packs</Trans>
                  </Text>
                </Line>
                <Line expand noMargin justifyContent="center">
                  <GridList
                    cols={windowWidth === 'small' ? 1 : 3}
                    cellHeight="auto"
                    spacing={2}
                  >
                    {assetPacksListingData.map(assetPackListingData => (
                      <PrivateAssetPackTile
                        assetPackListingData={assetPackListingData}
                        onSelect={() => {
                          sendAssetPackOpened({
                            assetPackName: assetPackListingData.name,
                            assetPackId: assetPackListingData.id,
                            assetPackTag: null,
                            assetPackKind: 'private',
                            source: 'author-profile',
                          });
                          onAssetPackOpen(assetPackListingData);
                        }}
                        owned={false}
                        key={assetPackListingData.id}
                      />
                    ))}
                  </GridList>
                </Line>
              </ColumnStackLayout>
            )}
          {isAuthenticatedUserProfile && (
            <UserAchievements
              badges={badges}
              displayUnclaimedAchievements={!!isAuthenticatedUserProfile}
              displayNotifications={!!isAuthenticatedUserProfile}
            />
          )}
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
