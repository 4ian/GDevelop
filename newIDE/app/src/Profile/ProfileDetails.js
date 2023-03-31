// @flow
import { Trans, t } from '@lingui/macro';

import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Column, Line } from '../UI/Grid';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { getGravatarUrl } from '../UI/GravatarUrl';
import Text from '../UI/Text';
import { I18n } from '@lingui/react';
import PlaceholderError from '../UI/PlaceholderError';
import RaisedButton from '../UI/RaisedButton';
import { type PrivateAssetPackListingData } from '../Utils/GDevelopServices/Shop';
import Window from '../Utils/Window';
import { GDevelopGamesPlatform } from '../Utils/GDevelopServices/ApiConfigs';
import FlatButton from '../UI/FlatButton';
import Coffee from '../UI/CustomSvgIcons/Coffee';
import { GridList } from '@material-ui/core';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import { PrivateAssetPackTile } from '../AssetStore/AssetsHome';
import { sendAssetPackOpened } from '../Utils/Analytics/EventSender';
import ShareExternal from '../UI/CustomSvgIcons/ShareExternal';
import Planet from '../UI/CustomSvgIcons/Planet';
import Twitter from '../UI/CustomSvgIcons/Twitter';
import Facebook from '../UI/CustomSvgIcons/Facebook';
import YouTube from '../UI/CustomSvgIcons/YouTube';
import TikTok from '../UI/CustomSvgIcons/TikTok';
import Instagram from '../UI/CustomSvgIcons/Instagram';
import Reddit from '../UI/CustomSvgIcons/Reddit';
import Snapchat from '../UI/CustomSvgIcons/Snapchat';
import Discord from '../UI/CustomSvgIcons/Discord';
import Link from '../UI/Link';
import {
  facebookLinkPrefix,
  instagramLinkPrefix,
  redditLinkPrefix,
  snapchatLinkPrefix,
  tiktokLinkPrefix,
  twitterLinkPrefix,
  youtubeLinkPrefix,
  type CommunityLinks,
} from '../Utils/GDevelopServices/User';

const CommunityLinksLines = ({
  isAuthenticatedUserProfile,
  communityLinks,
}: {|
  isAuthenticatedUserProfile: boolean,
  communityLinks: Array<{ url: ?string, icon: React.Node }>,
|}) => (
  <ColumnStackLayout expand noMargin>
    {communityLinks.map(({ url, icon }) =>
      url ? (
        <LineStackLayout noMargin alignItems="center">
          {icon}
          {isAuthenticatedUserProfile ? (
            <Text noMargin>{url}</Text>
          ) : (
            <Link href={url} onClick={() => Window.openExternalURL(url)}>
              <Text noMargin color="inherit">
                {url}
              </Text>
            </Link>
          )}
        </LineStackLayout>
      ) : null
    )}
  </ColumnStackLayout>
);

type DisplayedProfile = {
  id: string,
  +email?: string, // the "+" allows handling both public and private profile
  username: ?string,
  description: ?string,
  donateLink: ?string,
  +communityLinks?: CommunityLinks, // the "+" allows handling both public and private profile
};

type Props = {|
  profile: ?DisplayedProfile,
  isAuthenticatedUserProfile?: boolean,
  error?: ?Error,
  onRetry?: () => void,
  onChangeEmail?: () => void,
  onEditProfile?: () => void,
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
  assetPacksListingData,
  onAssetPackOpen,
}: Props) => {
  const donateLink = profile ? profile.donateLink : null;
  const communityLinks = (profile && profile.communityLinks) || {};
  const personalWebsiteLink = communityLinks
    ? communityLinks.personalWebsiteLink
    : null;
  const personalWebsite2Link = profile
    ? communityLinks.personalWebsite2Link
    : null;
  const twitterUsername = profile ? communityLinks.twitterUsername : null;
  const facebookUsername = profile ? communityLinks.facebookUsername : null;
  const youtubeUsername = profile ? communityLinks.youtubeUsername : null;
  const tiktokUsername = profile ? communityLinks.tiktokUsername : null;
  const instagramUsername = profile ? communityLinks.instagramUsername : null;
  const redditUsername = profile ? communityLinks.redditUsername : null;
  const snapchatUsername = profile ? communityLinks.snapchatUsername : null;
  const discordServerLink = profile ? communityLinks.discordServerLink : null;
  const windowWidth = useResponsiveWindowWidth();

  if (error)
    return (
      <PlaceholderError onRetry={onRetry}>
        <Trans>
          Unable to load the profile, please verify your internet connection or
          try again later.
        </Trans>
      </PlaceholderError>
    );

  if (!profile || (!isAuthenticatedUserProfile && !assetPacksListingData)) {
    return <PlaceholderLoader />;
  }

  return (
    <I18n>
      {({ i18n }) => (
        <ResponsiveLineStackLayout>
          <Avatar src={getGravatarUrl(profile.email || '', { size: 40 })} />
          <ColumnStackLayout noMargin expand>
            <ResponsiveLineStackLayout justifyContent="space-between" noMargin>
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
              {profile.id &&
              !isAuthenticatedUserProfile &&
              !!donateLink && ( // Only show on Public Profile.
                  <RaisedButton
                    label={<Trans>Buy me a coffee</Trans>}
                    primary
                    onClick={() => Window.openExternalURL(donateLink)}
                    icon={<Coffee />}
                  />
                )}
            </ResponsiveLineStackLayout>
            {isAuthenticatedUserProfile && profile.email && (
              <Column noMargin>
                <Text noMargin size="body-small">
                  <Trans>Email</Trans>
                </Text>
                <Text>{profile.email}</Text>
              </Column>
            )}
            <Column noMargin>
              <Text noMargin size="body-small">
                <Trans>Bio</Trans>
              </Text>
              <Text>
                {profile.description || <Trans>No bio defined.</Trans>}
              </Text>
            </Column>
            <CommunityLinksLines
              communityLinks={[
                {
                  url: personalWebsiteLink,
                  icon: <Planet />,
                },
                {
                  url: personalWebsite2Link,
                  icon: <Planet />,
                },
                {
                  url: twitterUsername
                    ? twitterLinkPrefix + twitterUsername
                    : undefined,
                  icon: <Twitter />,
                },
                {
                  url: facebookUsername
                    ? facebookLinkPrefix + facebookUsername
                    : undefined,
                  icon: <Facebook />,
                },
                {
                  url: youtubeUsername
                    ? youtubeLinkPrefix + youtubeUsername
                    : undefined,
                  icon: <YouTube />,
                },
                {
                  url: tiktokUsername
                    ? tiktokLinkPrefix + tiktokUsername
                    : undefined,
                  icon: <TikTok />,
                },
                {
                  url: instagramUsername
                    ? instagramLinkPrefix + instagramUsername
                    : undefined,
                  icon: <Instagram />,
                },
                {
                  url: redditUsername
                    ? redditLinkPrefix + redditUsername
                    : undefined,
                  icon: <Reddit />,
                },
                {
                  url: snapchatUsername
                    ? snapchatLinkPrefix + snapchatUsername
                    : undefined,
                  icon: <Snapchat />,
                },
                {
                  url: discordServerLink,
                  icon: <Discord />,
                },
              ]}
              isAuthenticatedUserProfile={!!isAuthenticatedUserProfile}
            />
            {isAuthenticatedUserProfile && (
              <Column noMargin>
                <Text noMargin size="body-small">
                  <Trans>Donate link</Trans>
                </Text>
                <Text>
                  {profile.donateLink || <Trans>No link defined.</Trans>}
                </Text>
              </Column>
            )}
            {isAuthenticatedUserProfile && (
              <ResponsiveLineStackLayout justifyContent="flex-start" noMargin>
                <RaisedButton
                  label={<Trans>Edit my profile</Trans>}
                  primary
                  onClick={onEditProfile}
                />
                <FlatButton
                  label={<Trans>Change my email</Trans>}
                  onClick={onChangeEmail}
                />
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
                  leftIcon={<ShareExternal />}
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
                  <Line expand noMargin justifyContent="start">
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
          </ColumnStackLayout>
        </ResponsiveLineStackLayout>
      )}
    </I18n>
  );
};

export default ProfileDetails;
