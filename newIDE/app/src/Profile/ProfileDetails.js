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
import RaisedButton from '../UI/RaisedButton';
import Window from '../Utils/Window';
import { GDevelopGamesPlatform } from '../Utils/GDevelopServices/ApiConfigs';
import FlatButton from '../UI/FlatButton';
import ShareExternal from '../UI/CustomSvgIcons/ShareExternal';
import {
  communityLinksConfig,
  syncDiscordUsername,
} from '../Utils/GDevelopServices/User';
import { type AuthenticatedUser } from './AuthenticatedUserContext';
import IconButton from '../UI/IconButton';
import Refresh from '../UI/CustomSvgIcons/Refresh';
import Check from '../UI/CustomSvgIcons/Check';
import { MarkdownText } from '../UI/MarkdownText';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { canBenefitFromDiscordRole } from '../Utils/GDevelopServices/Usage';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';

const CommunityLinksLines = ({
  communityLinks,
}: {|
  communityLinks: Array<{
    text: ?React.Node,
    isNotFilled?: boolean,
    icon: React.Node,
  }>,
|}) => (
  <ColumnStackLayout expand noMargin>
    {communityLinks.map(({ text, isNotFilled, icon }, index) =>
      text ? (
        <LineStackLayout noMargin alignItems="center" key={index}>
          {icon}
          <Text noMargin color={isNotFilled ? 'secondary' : 'primary'}>
            {text}
          </Text>
        </LineStackLayout>
      ) : null
    )}
  </ColumnStackLayout>
);

type Props = {|
  authenticatedUser: AuthenticatedUser,
  onOpenChangeEmailDialog?: () => void,
  onOpenEditProfileDialog?: () => void,
|};

const ProfileDetails = ({
  authenticatedUser,
  onOpenChangeEmailDialog,
  onOpenEditProfileDialog,
}: Props) => {
  const {
    firebaseUser,
    achievements,
    badges,
    subscription,
    getAuthorizationHeader,
  } = authenticatedUser;
  const profile = React.useMemo(
    () =>
      authenticatedUser.profile && firebaseUser
        ? // The firebase user is the source of truth for the emails.
          { ...authenticatedUser.profile, email: firebaseUser.email }
        : null,
    [authenticatedUser.profile, firebaseUser]
  );
  const hideSocials =
    !!authenticatedUser.limits &&
    !!authenticatedUser.limits.capabilities.classrooms &&
    authenticatedUser.limits.capabilities.classrooms.hideSocials;
  const email = profile ? profile.email : null;
  const donateLink = profile ? profile.donateLink : null;
  const discordUsername = profile ? profile.discordUsername : null;
  const githubUsername = profile ? profile.githubUsername : null;
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
  const { showAlert } = useAlertDialog();
  const githubStarAchievement =
    (achievements &&
      achievements.find(achievement => achievement.id === 'github-star')) ||
    null;
  const hasGithubBadge =
    !!badges && badges.some(badge => badge.achievementId === 'github-star');
  const tiktokFollowAchievement =
    (achievements &&
      achievements.find(achievement => achievement.id === 'tiktok-follow')) ||
    null;
  const hasTiktokBadge =
    !!badges && badges.some(badge => badge.achievementId === 'tiktok-follow');
  const twitterFollowAchievement =
    (achievements &&
      achievements.find(achievement => achievement.id === 'twitter-follow')) ||
    null;
  const hasTwitterBadge =
    !!badges && badges.some(badge => badge.achievementId === 'twitter-follow');
  const youtubeSubscriptionAchievement =
    (achievements &&
      achievements.find(
        achievement => achievement.id === 'youtube-subscription'
      )) ||
    null;
  const hasYoutubeBadge =
    !!badges &&
    badges.some(badge => badge.achievementId === 'youtube-subscription');

  const [
    discordUsernameSyncStatus,
    setDiscordUsernameSyncStatus,
  ] = React.useState<null | 'syncing' | 'success'>(null);

  const onSyncDiscordUsername = React.useCallback(
    async () => {
      if (!profile) return;
      setDiscordUsernameSyncStatus('syncing');
      try {
        await syncDiscordUsername(getAuthorizationHeader, profile.id);
        setDiscordUsernameSyncStatus('success');
      } catch (error) {
        console.error('Error while syncing discord username:', error);
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (
          extractedStatusAndCode &&
          extractedStatusAndCode.status === 400 &&
          extractedStatusAndCode.code ===
            'discord-role-update/discord-user-not-found'
        ) {
          showAlert({
            title: t`Discord user not found`,
            message: t`Ensure you don't have any typo in your username and that you have joined the GDevelop Discord server.`,
          });
          return;
        }
        showAlert({
          title: t`Discord username sync failed`,
          message: t`Something went wrong while syncing your Discord username. Please try again later.`,
        });
      } finally {
        // Wait a bit to avoid spam and allow showing the success icon.
        setTimeout(() => setDiscordUsernameSyncStatus(null), 3000);
      }
    },
    [getAuthorizationHeader, profile, showAlert]
  );

  const canUserBenefitFromDiscordRole = canBenefitFromDiscordRole(subscription);

  if (!profile) {
    return <PlaceholderLoader />;
  }

  return (
    <I18n>
      {({ i18n }) => (
        <ResponsiveLineStackLayout noResponsiveLandscape>
          <Avatar src={getGravatarUrl(email || '', { size: 40 })} />
          <ColumnStackLayout noMargin expand>
            <Line justifyContent="space-between" noMargin>
              <Text
                size="block-title"
                allowBrowserAutoTranslate={!profile.username}
                style={{
                  opacity: profile.username ? 1.0 : 0.5,
                }}
              >
                {profile.username ||
                  i18n._(t`Edit your profile to pick a username!`)}
              </Text>
            </Line>
            {email && (
              <Column noMargin>
                <Text noMargin size="body-small">
                  <Trans>Email</Trans>
                </Text>
                <Text>{email}</Text>
              </Column>
            )}
            {!hideSocials && (
              <Column noMargin>
                <LineStackLayout noMargin alignItems="center">
                  <Text noMargin size="body-small">
                    <Trans>Discord username</Trans>
                  </Text>
                  {canUserBenefitFromDiscordRole && !!discordUsername && (
                    <IconButton
                      onClick={onSyncDiscordUsername}
                      disabled={discordUsernameSyncStatus !== null}
                      tooltip={t`Sync your role on GDevelop's Discord server`}
                      size="small"
                    >
                      {discordUsernameSyncStatus === 'success' ? (
                        <Check fontSize="small" />
                      ) : (
                        <Refresh fontSize="small" />
                      )}
                    </IconButton>
                  )}
                </LineStackLayout>
                <Text color={!discordUsername ? 'secondary' : 'primary'}>
                  {!discordUsername ? (
                    !canUserBenefitFromDiscordRole ? (
                      <MarkdownText
                        translatableSource={t`Get access to an exclusive channel on the [GDevelop Discord](https://discord.gg/gdevelop) by subscribing to a Gold, Pro or Education plan.`}
                      />
                    ) : (
                      <MarkdownText
                        translatableSource={t`Edit your profile and fill your discord username to claim your role on the [GDevelop Discord](https://discord.gg/gdevelop).`}
                      />
                    )
                  ) : (
                    <>
                      {discordUsername}
                      {!canUserBenefitFromDiscordRole && (
                        <>
                          {' - '}
                          <MarkdownText
                            translatableSource={t`Get a Gold or Pro subscription to claim your role on the [GDevelop Discord](https://discord.gg/gdevelop).`}
                          />
                        </>
                      )}
                    </>
                  )}
                </Text>
              </Column>
            )}
            <Column noMargin>
              <Text noMargin size="body-small">
                <Trans>Bio</Trans>
              </Text>
              <Text color={!profile.description ? 'secondary' : 'primary'}>
                {profile.description || <Trans>No bio defined.</Trans>}
              </Text>
            </Column>
            {!hideSocials && (
              <ColumnStackLayout noMargin>
                <Text noMargin size="body-small">
                  <Trans>Socials</Trans>
                </Text>
                <CommunityLinksLines
                  communityLinks={[
                    {
                      text:
                        !githubUsername && !hasGithubBadge ? (
                          <MarkdownText
                            translatableSource={communityLinksConfig.githubUsername.getRewardMessage(
                              false,
                              githubStarAchievement &&
                                githubStarAchievement.rewardValueInCredits
                                ? githubStarAchievement.rewardValueInCredits.toString()
                                : '-'
                            )}
                          />
                        ) : (
                          githubUsername
                        ),
                      isNotFilled: !githubUsername,
                      icon: communityLinksConfig.githubUsername.icon,
                    },
                    {
                      text:
                        !twitterUsername && !hasTwitterBadge ? (
                          <MarkdownText
                            translatableSource={communityLinksConfig.twitterUsername.getRewardMessage(
                              false,
                              twitterFollowAchievement &&
                                twitterFollowAchievement.rewardValueInCredits
                                ? twitterFollowAchievement.rewardValueInCredits.toString()
                                : '-'
                            )}
                          />
                        ) : (
                          twitterUsername
                        ),
                      isNotFilled: !twitterUsername,
                      icon: communityLinksConfig.twitterUsername.icon,
                    },
                    {
                      text:
                        !youtubeUsername && !hasYoutubeBadge ? (
                          <MarkdownText
                            translatableSource={communityLinksConfig.youtubeUsername.getRewardMessage(
                              false,
                              youtubeSubscriptionAchievement &&
                                youtubeSubscriptionAchievement.rewardValueInCredits
                                ? youtubeSubscriptionAchievement.rewardValueInCredits.toString()
                                : '-'
                            )}
                          />
                        ) : (
                          youtubeUsername
                        ),
                      isNotFilled: !youtubeUsername,
                      icon: communityLinksConfig.youtubeUsername.icon,
                    },
                    {
                      text:
                        !tiktokUsername && !hasTiktokBadge ? (
                          <MarkdownText
                            translatableSource={communityLinksConfig.tiktokUsername.getRewardMessage(
                              false,
                              tiktokFollowAchievement &&
                                tiktokFollowAchievement.rewardValueInCredits
                                ? tiktokFollowAchievement.rewardValueInCredits.toString()
                                : '-'
                            )}
                          />
                        ) : (
                          tiktokUsername
                        ),
                      isNotFilled: !tiktokUsername,
                      icon: communityLinksConfig.tiktokUsername.icon,
                    },
                    {
                      text: personalWebsiteLink,
                      icon: communityLinksConfig.personalWebsiteLink.icon,
                    },
                    {
                      text: personalWebsite2Link,
                      icon: communityLinksConfig.personalWebsite2Link.icon,
                    },
                    {
                      text: facebookUsername,
                      icon: communityLinksConfig.facebookUsername.icon,
                    },
                    {
                      text: instagramUsername,
                      icon: communityLinksConfig.instagramUsername.icon,
                    },
                    {
                      text: redditUsername,
                      icon: communityLinksConfig.redditUsername.icon,
                    },
                    {
                      text: snapchatUsername,
                      icon: communityLinksConfig.snapchatUsername.icon,
                    },
                    {
                      text: discordServerLink,
                      icon: communityLinksConfig.discordServerLink.icon,
                    },
                  ]}
                />
                <Column noMargin>
                  <Text noMargin size="body-small">
                    <Trans>Donate link</Trans>
                  </Text>
                  <Text color={!donateLink ? 'secondary' : 'primary'}>
                    {donateLink || <Trans>No link defined.</Trans>}
                  </Text>
                </Column>
              </ColumnStackLayout>
            )}
            <ResponsiveLineStackLayout
              justifyContent="flex-start"
              noMargin
              noResponsiveLandscape
            >
              <RaisedButton
                label={<Trans>Edit my profile</Trans>}
                primary
                onClick={onOpenEditProfileDialog}
              />
              <FlatButton
                label={<Trans>Change my email</Trans>}
                onClick={onOpenChangeEmailDialog}
                disabled={profile.isEmailAutogenerated}
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
          </ColumnStackLayout>
        </ResponsiveLineStackLayout>
      )}
    </I18n>
  );
};

export default ProfileDetails;
