// @flow
import { Trans, t } from '@lingui/macro';

import * as React from 'react';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import {
  type EditForm,
  type AuthError,
  type Profile,
  type UpdateGitHubStarResponse,
  type UpdateTiktokFollowResponse,
  type UpdateTwitterFollowResponse,
} from '../Utils/GDevelopServices/Authentication';
import {
  communityLinksConfig,
  donateLinkConfig,
  discordUsernameConfig,
  type UsernameAvailability,
  type CommunityLinkType,
  type CommunityLinks,
} from '../Utils/GDevelopServices/User';
import { type Badge, type Achievement } from '../Utils/GDevelopServices/Badge';
import {
  hasValidSubscriptionPlan,
  type Subscription,
} from '../Utils/GDevelopServices/Usage';
import LeftLoader from '../UI/LeftLoader';
import {
  ColumnStackLayout,
  LineStackLayout,
  TextFieldWithButtonLayout,
} from '../UI/Layout';
import {
  isUsernameValid,
  UsernameField,
  usernameFormatErrorMessage,
  usernameAvailabilityErrorMessage,
} from './UsernameField';
import TextField from '../UI/TextField';
import Checkbox from '../UI/Checkbox';
import Text from '../UI/Text';
import TextButton from '../UI/TextButton';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import Form from '../UI/Form';
import RaisedButton from '../UI/RaisedButton';
import Coin from '../Credits/Icons/Coin';
import { sendSocialFollowUpdated } from '../Utils/Analytics/EventSender';
import { Line } from '../UI/Grid';

export type EditProfileDialogProps = {|
  profile: Profile,
  achievements: ?Array<Achievement>,
  badges: ?Array<Badge>,
  subscription: ?Subscription,
  onClose: () => void,
  onEdit: (form: EditForm) => Promise<void>,
  onUpdateGitHubStar: (
    githubUsername: string
  ) => Promise<UpdateGitHubStarResponse>,
  onUpdateTiktokFollow: (
    communityLinks: CommunityLinks
  ) => Promise<UpdateTiktokFollowResponse>,
  onUpdateTwitterFollow: (
    communityLinks: CommunityLinks
  ) => Promise<UpdateTwitterFollowResponse>,
  onDelete: () => Promise<void>,
  actionInProgress: boolean,
  error: ?AuthError,
|};

export const getUsernameErrorText = (error: ?AuthError) => {
  if (!error) return undefined;

  if (error.code === 'auth/username-used')
    return usernameAvailabilityErrorMessage;
  if (error.code === 'auth/malformed-username')
    return usernameFormatErrorMessage;
  return undefined;
};

const CommunityLinkWithFollow = <UpdateResponse: { +code: string }>({
  badges,
  achievements,
  achievementId,
  value,
  onChange,
  onUpdateFollow,
  getMessageFromUpdate,
  disabled,
  maxLength,
  prefix,
  getRewardMessage,
  translatableHintText,
  icon,
}: {
  badges: ?Array<Badge>,
  achievements: ?Array<Achievement>,
  achievementId: string,
  value: string,
  onChange: (value: string) => void,
  onUpdateFollow: () => Promise<UpdateResponse>,
  getMessageFromUpdate: (
    responseCode: string
  ) => null | {|
    title: MessageDescriptor,
    message: MessageDescriptor,
  |},
  getRewardMessage: (
    hasBadge: boolean,
    rewardValueInCredits: string
  ) => MessageDescriptor,
  disabled: boolean,
  maxLength: number,
  prefix: string,
  translatableHintText?: string,
  icon: React.Node,
}) => {
  const { showAlert } = useAlertDialog();

  const hasBadge =
    !!badges && badges.some(badge => badge.achievementId === achievementId);
  const achievement =
    (achievements &&
      achievements.find(achievement => achievement.id === achievementId)) ||
    null;

  const onClaim = React.useCallback(
    async () => {
      try {
        const response = await onUpdateFollow();
        sendSocialFollowUpdated(achievementId, { code: response.code });

        const messageAndTitle = getMessageFromUpdate(response.code);
        if (messageAndTitle) {
          showAlert({ ...messageAndTitle });
        } else {
          throw new Error(
            `Error while updating the social follow: ${response.code}.`
          );
        }
      } catch (error) {
        console.error('Error while updating social follow:', error);
        showAlert({
          title: t`Something went wrong`,
          message: t`Make sure you have a proper internet connection or try again later.`,
        });
      }
    },
    [onUpdateFollow, achievementId, getMessageFromUpdate, showAlert]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <LineStackLayout noMargin alignItems="flex-start">
          <Line>{icon}</Line>
          <TextFieldWithButtonLayout
            renderButton={style => (
              <RaisedButton
                onClick={onClaim}
                icon={<Coin fontSize="small" />}
                label={
                  hasBadge ? <Trans>Credits given</Trans> : <Trans>Claim</Trans>
                }
                disabled={hasBadge || disabled}
                primary
                style={style}
              />
            )}
            renderTextField={() => (
              <TextField
                value={value}
                fullWidth
                translatableHintText={translatableHintText}
                onChange={(e, value) => {
                  onChange(value);
                }}
                startAdornment={
                  prefix ? <Text noMargin>{prefix}</Text> : undefined
                }
                disabled={disabled}
                maxLength={maxLength}
                helperMarkdownText={i18n._(
                  getRewardMessage(
                    hasBadge,
                    achievement && achievement.rewardValueInCredits
                      ? achievement.rewardValueInCredits.toString()
                      : '-'
                  )
                )}
              />
            )}
          />
        </LineStackLayout>
      )}
    </I18n>
  );
};

const CommunityLinkLine = ({
  id,
  value,
  onChange,
  disabled,
  translatableHintText,
}: {|
  id: CommunityLinkType,
  value: string,
  onChange: (e: any, value: string) => void,
  disabled: boolean,
  translatableHintText?: string,
|}) => {
  const config = communityLinksConfig[id];

  return (
    <LineStackLayout noMargin alignItems="center">
      {config.icon}
      <TextField
        value={value}
        fullWidth
        translatableHintText={translatableHintText}
        onChange={onChange}
        disabled={disabled}
        errorText={
          config.getFormattingError
            ? config.getFormattingError(value)
            : undefined
        }
        maxLength={config.maxLength}
        startAdornment={
          config.prefix ? <Text noMargin>{config.prefix}</Text> : undefined
        }
      />
    </LineStackLayout>
  );
};

const EditProfileDialog = ({
  profile,
  subscription,
  achievements,
  badges,
  onClose,
  onEdit,
  onUpdateGitHubStar,
  onUpdateTiktokFollow,
  onUpdateTwitterFollow,
  onDelete,
  actionInProgress,
  error,
}: EditProfileDialogProps) => {
  const { showDeleteConfirmation, showAlert } = useAlertDialog();

  const communityLinks = profile.communityLinks || {};
  const [username, setUsername] = React.useState(profile.username || '');
  const [description, setDescription] = React.useState(
    profile.description || ''
  );
  const [donateLink, setDonateLink] = React.useState(profile.donateLink || '');
  const [discordUsername, setDiscordUsername] = React.useState(
    profile.discordUsername || ''
  );
  const [githubUsername, setGithubUsername] = React.useState(
    profile.githubUsername || ''
  );
  const [personalWebsiteLink, setPersonalWebsiteLink] = React.useState(
    communityLinks.personalWebsiteLink || ''
  );
  const [personalWebsite2Link, setPersonalWebsite2Link] = React.useState(
    communityLinks.personalWebsite2Link || ''
  );
  const [twitterUsername, setTwitterUsername] = React.useState(
    communityLinks.twitterUsername || ''
  );
  const [facebookUsername, setFacebookUsername] = React.useState(
    communityLinks.facebookUsername || ''
  );
  const [youtubeUsername, setYoutubeUsername] = React.useState(
    communityLinks.youtubeUsername || ''
  );
  const [tiktokUsername, setTiktokUsername] = React.useState(
    communityLinks.tiktokUsername || ''
  );
  const [instagramUsername, setInstagramUsername] = React.useState(
    communityLinks.instagramUsername || ''
  );
  const [redditUsername, setRedditUsername] = React.useState(
    communityLinks.redditUsername || ''
  );
  const [snapchatUsername, setSnapchatUsername] = React.useState(
    communityLinks.snapchatUsername || ''
  );
  const [discordServerLink, setDiscordServerLink] = React.useState(
    communityLinks.discordServerLink || ''
  );
  const [getGameStatsEmail, setGetGameStatsEmail] = React.useState(
    !!profile.getGameStatsEmail
  );
  const [getNewsletterEmail, setGetNewsletterEmail] = React.useState(
    !!profile.getNewsletterEmail
  );
  const [
    usernameAvailability,
    setUsernameAvailability,
  ] = React.useState<?UsernameAvailability>(null);
  const [
    isValidatingUsername,
    setIsValidatingUsername,
  ] = React.useState<boolean>(false);

  const personalWebsiteError = communityLinksConfig.personalWebsiteLink.getFormattingError(
    personalWebsiteLink
  );
  const personalWebsite2Error = communityLinksConfig.personalWebsite2Link.getFormattingError(
    personalWebsite2Link
  );
  const discordServerLinkError = communityLinksConfig.discordServerLink.getFormattingError(
    discordServerLink
  );
  const donateLinkError = donateLinkConfig.getFormattingError(donateLink);
  const tiktokUsernameError = communityLinksConfig.tiktokUsername.getFormattingError(
    tiktokUsername
  );

  const hasFormattingError =
    personalWebsiteError ||
    personalWebsite2Error ||
    discordServerLinkError ||
    donateLinkError ||
    tiktokUsernameError;

  const canEdit =
    !actionInProgress &&
    isUsernameValid(username, { allowEmpty: false }) &&
    !isValidatingUsername &&
    (!usernameAvailability || usernameAvailability.isAvailable) &&
    !hasFormattingError;

  const updatedCommunityLinks = {
    personalWebsiteLink,
    personalWebsite2Link,
    twitterUsername,
    facebookUsername,
    youtubeUsername,
    tiktokUsername,
    instagramUsername,
    redditUsername,
    snapchatUsername,
    discordServerLink,
  };

  const edit = async () => {
    if (!canEdit) return;
    await onEdit({
      username,
      description,
      getGameStatsEmail,
      getNewsletterEmail,
      donateLink,
      discordUsername,
      githubUsername,
      communityLinks: updatedCommunityLinks,
    });
  };

  const canDelete = !actionInProgress;

  const onDeleteAccount = React.useCallback(
    async (i18n: I18nType) => {
      if (!canDelete) return;

      if (hasValidSubscriptionPlan(subscription)) {
        await showAlert({
          title: t`You have an active subscription`,
          message: t`You can't delete your account while you have an active subscription. Please cancel your subscription first.`,
        });
        return;
      }

      const answer = await showDeleteConfirmation({
        title: t`Delete account`,
        message: t`Before you go, make sure that you've unpublished all your games on gd.games. Otherwise they will stay visible to the community. Are you sure you want to permanently delete your account? This action cannot be undone.`,
        confirmButtonLabel: t`Delete account`,
        confirmText: profile.email,
        fieldMessage: t`Type your email to confirm`,
      });
      if (!answer) return;
      await onDelete();
    },
    [
      canDelete,
      onDelete,
      profile.email,
      subscription,
      showDeleteConfirmation,
      showAlert,
    ]
  );

  const actions = [
    <FlatButton
      label={<Trans>Back</Trans>}
      disabled={actionInProgress}
      key="back"
      primary={false}
      onClick={onClose}
    />,
    <LeftLoader isLoading={actionInProgress} key="edit">
      <DialogPrimaryButton
        label={<Trans>Save</Trans>}
        primary
        disabled={!canEdit}
        onClick={edit}
      />
    </LeftLoader>,
  ];

  const secondaryActions = [
    <TextButton
      label={<Trans>Delete my account</Trans>}
      disabled={actionInProgress}
      key="delete"
      onClick={onDeleteAccount}
    />,
  ];

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Edit your GDevelop profile</Trans>}
          actions={actions}
          secondaryActions={secondaryActions}
          maxWidth="sm"
          cannotBeDismissed={actionInProgress}
          onRequestClose={onClose}
          onApply={edit}
          open
        >
          <Form onSubmit={edit} autoComplete="on" name="editProfile">
            <ColumnStackLayout noMargin>
              <UsernameField
                initialUsername={profile.username}
                value={username}
                onChange={(e, value) => {
                  setUsername(value);
                }}
                errorText={getUsernameErrorText(error)}
                onAvailabilityChecked={setUsernameAvailability}
                onAvailabilityCheckLoading={setIsValidatingUsername}
                isValidatingUsername={isValidatingUsername}
                disabled={actionInProgress}
              />

              <Text size="sub-title" noMargin>
                <Trans>Creator profile</Trans>
              </Text>
              <TextField
                value={discordUsername}
                floatingLabelText={<Trans>Discord username</Trans>}
                fullWidth
                translatableHintText={t`Your Discord username`}
                onChange={(e, value) => {
                  setDiscordUsername(value);
                }}
                disabled={actionInProgress}
                maxLength={discordUsernameConfig.maxLength}
                helperMarkdownText={i18n._(
                  t`Add your Discord username to get access to a dedicated channel if you have a Gold or Pro subscription! Join the [GDevelop Discord](https://discord.gg/gdevelop).`
                )}
              />
              <TextField
                value={description}
                floatingLabelText={<Trans>Bio</Trans>}
                fullWidth
                multiline
                rows={3}
                rowsMax={5}
                translatableHintText={t`What are you using GDevelop for?`}
                onChange={(e, value) => {
                  setDescription(value);
                }}
                disabled={actionInProgress}
                floatingLabelFixed
                maxLength={10000}
              />
              <Text size="sub-title" noMargin>
                <Trans>Socials</Trans>
              </Text>
              <CommunityLinkWithFollow
                badges={badges}
                achievements={achievements}
                achievementId="github-star"
                value={githubUsername}
                onChange={setGithubUsername}
                onUpdateFollow={() => onUpdateGitHubStar(githubUsername)}
                getMessageFromUpdate={
                  communityLinksConfig.githubUsername.getMessageFromUpdate
                }
                disabled={actionInProgress}
                maxLength={communityLinksConfig.githubUsername.maxLength}
                prefix={communityLinksConfig.githubUsername.prefix}
                getRewardMessage={
                  communityLinksConfig.githubUsername.getRewardMessage
                }
                translatableHintText={t`username`}
                icon={communityLinksConfig.githubUsername.icon}
              />
              <CommunityLinkWithFollow
                badges={badges}
                achievements={achievements}
                achievementId="twitter-follow"
                value={twitterUsername}
                onChange={setTwitterUsername}
                onUpdateFollow={() =>
                  onUpdateTwitterFollow(updatedCommunityLinks)
                }
                getMessageFromUpdate={
                  communityLinksConfig.twitterUsername.getMessageFromUpdate
                }
                disabled={actionInProgress}
                maxLength={communityLinksConfig.twitterUsername.maxLength}
                prefix={communityLinksConfig.twitterUsername.prefix}
                getRewardMessage={
                  communityLinksConfig.twitterUsername.getRewardMessage
                }
                translatableHintText={t`username`}
                icon={communityLinksConfig.twitterUsername.icon}
              />
              <CommunityLinkWithFollow
                badges={badges}
                achievements={achievements}
                achievementId="tiktok-follow"
                value={tiktokUsername}
                onChange={setTiktokUsername}
                onUpdateFollow={() =>
                  onUpdateTiktokFollow(updatedCommunityLinks)
                }
                getMessageFromUpdate={
                  communityLinksConfig.tiktokUsername.getMessageFromUpdate
                }
                disabled={actionInProgress}
                maxLength={communityLinksConfig.tiktokUsername.maxLength}
                prefix={communityLinksConfig.tiktokUsername.prefix}
                getRewardMessage={
                  communityLinksConfig.tiktokUsername.getRewardMessage
                }
                translatableHintText={t`username`}
                icon={communityLinksConfig.tiktokUsername.icon}
              />
              <CommunityLinkLine
                id="personalWebsiteLink"
                value={personalWebsiteLink}
                translatableHintText={t`Personal website, itch.io page, etc.`}
                onChange={(e, value) => {
                  setPersonalWebsiteLink(value);
                }}
                disabled={actionInProgress}
              />
              <CommunityLinkLine
                id="personalWebsite2Link"
                value={personalWebsite2Link}
                translatableHintText={t`Another personal website, newgrounds.com page, etc.`}
                onChange={(e, value) => {
                  setPersonalWebsite2Link(value);
                }}
                disabled={actionInProgress}
              />
              <CommunityLinkLine
                id="facebookUsername"
                value={facebookUsername}
                translatableHintText={t`username`}
                onChange={(e, value) => {
                  setFacebookUsername(value);
                }}
                disabled={actionInProgress}
              />
              <CommunityLinkLine
                id="youtubeUsername"
                value={youtubeUsername}
                translatableHintText={t`username`}
                onChange={(e, value) => {
                  setYoutubeUsername(value);
                }}
                disabled={actionInProgress}
              />
              <CommunityLinkLine
                id="instagramUsername"
                value={instagramUsername}
                translatableHintText={t`username`}
                onChange={(e, value) => {
                  setInstagramUsername(value);
                }}
                disabled={actionInProgress}
              />
              <CommunityLinkLine
                id="redditUsername"
                value={redditUsername}
                translatableHintText={t`username`}
                onChange={(e, value) => {
                  setRedditUsername(value);
                }}
                disabled={actionInProgress}
              />
              <CommunityLinkLine
                id="snapchatUsername"
                value={snapchatUsername}
                translatableHintText={t`username`}
                onChange={(e, value) => {
                  setSnapchatUsername(value);
                }}
                disabled={actionInProgress}
              />
              <CommunityLinkLine
                id="discordServerLink"
                value={discordServerLink}
                translatableHintText={t`Discord server, e.g: https://discord.gg/...`}
                onChange={(e, value) => {
                  setDiscordServerLink(value);
                }}
                disabled={actionInProgress}
              />
              <TextField
                value={donateLink}
                floatingLabelText={<Trans>Donate link</Trans>}
                fullWidth
                translatableHintText={t`Do you have a Patreon? Ko-fi? Paypal?`}
                onChange={(e, value) => {
                  setDonateLink(value);
                }}
                disabled={actionInProgress}
                floatingLabelFixed
                helperMarkdownText={i18n._(
                  t`Add a link to your donation page. It will be displayed on your gd.games profile and game pages.`
                )}
                errorText={donateLinkError}
                maxLength={donateLinkConfig.maxLength}
              />
              <Text size="sub-title" noMargin>
                <Trans>Notifications</Trans>
              </Text>
              <Checkbox
                label={<Trans>I want to receive the GDevelop Newsletter</Trans>}
                checked={getNewsletterEmail}
                onCheck={(e, value) => {
                  setGetNewsletterEmail(value);
                }}
                disabled={actionInProgress}
              />
              <Checkbox
                label={
                  <Trans>I want to receive weekly stats about my games</Trans>
                }
                checked={getGameStatsEmail}
                onCheck={(e, value) => {
                  setGetGameStatsEmail(value);
                }}
                disabled={actionInProgress}
              />
            </ColumnStackLayout>
          </Form>
        </Dialog>
      )}
    </I18n>
  );
};

export default EditProfileDialog;
