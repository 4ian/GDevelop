// @flow
import { Trans, t } from '@lingui/macro';

import React from 'react';
import { I18n } from '@lingui/react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import {
  type EditForm,
  type AuthError,
  type Profile,
} from '../Utils/GDevelopServices/Authentication';
import {
  communityLinksConfig,
  donateLinkConfig,
  type UsernameAvailability,
} from '../Utils/GDevelopServices/User';
import LeftLoader from '../UI/LeftLoader';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import {
  isUsernameValid,
  UsernameField,
  usernameFormatErrorMessage,
  usernameAvailabilityErrorMessage,
} from './UsernameField';
import TextField from '../UI/TextField';
import Checkbox from '../UI/Checkbox';
import Text from '../UI/Text';

type Props = {|
  profile: Profile,
  onClose: () => void,
  onEdit: (form: EditForm) => Promise<void>,
  updateProfileInProgress: boolean,
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

const EditProfileDialog = ({
  profile,
  onClose,
  onEdit,
  updateProfileInProgress,
  error,
}: Props) => {
  const communityLinks = profile.communityLinks || {};
  const [username, setUsername] = React.useState(profile.username || '');
  const [description, setDescription] = React.useState(
    profile.description || ''
  );
  const [donateLink, setDonateLink] = React.useState(profile.donateLink || '');
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
    !updateProfileInProgress &&
    isUsernameValid(username, { allowEmpty: false }) &&
    !isValidatingUsername &&
    (!usernameAvailability || usernameAvailability.isAvailable) &&
    !hasFormattingError;

  const edit = () => {
    if (!canEdit) return;
    onEdit({
      username,
      description,
      getGameStatsEmail,
      getNewsletterEmail,
      donateLink,
      communityLinks: {
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
      },
    });
  };

  const actions = [
    <FlatButton
      label={<Trans>Back</Trans>}
      disabled={updateProfileInProgress}
      key="back"
      primary={false}
      onClick={onClose}
    />,
    <LeftLoader isLoading={updateProfileInProgress} key="edit">
      <DialogPrimaryButton
        label={<Trans>Save</Trans>}
        primary
        disabled={!canEdit}
        onClick={edit}
      />
    </LeftLoader>,
  ];

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Edit your GDevelop profile</Trans>}
          actions={actions}
          maxWidth="sm"
          cannotBeDismissed={updateProfileInProgress}
          onRequestClose={onClose}
          onApply={edit}
          open
        >
          <form
            onSubmit={event => {
              // Prevent browser to navigate on form submission.
              event.preventDefault();
              edit();
            }}
            autoComplete="on"
            name="editProfile"
          >
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
                disabled={updateProfileInProgress}
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
                disabled={updateProfileInProgress}
                floatingLabelFixed
              />
              <LineStackLayout noMargin alignItems="center">
                {communityLinksConfig.personalWebsiteLink.icon}
                <TextField
                  value={personalWebsiteLink}
                  fullWidth
                  translatableHintText={t`Personal website, itch.io page, etc.`}
                  onChange={(e, value) => {
                    setPersonalWebsiteLink(value);
                  }}
                  disabled={updateProfileInProgress}
                  errorText={personalWebsiteError}
                  maxLength={communityLinksConfig.personalWebsiteLink.maxLength}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                {communityLinksConfig.personalWebsite2Link.icon}
                <TextField
                  value={personalWebsite2Link}
                  fullWidth
                  translatableHintText={t`Another personal website, newgrounds.com page, etc.`}
                  onChange={(e, value) => {
                    setPersonalWebsite2Link(value);
                  }}
                  disabled={updateProfileInProgress}
                  errorText={personalWebsite2Error}
                  maxLength={
                    communityLinksConfig.personalWebsite2Link.maxLength
                  }
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                {communityLinksConfig.twitterUsername.icon}
                <TextField
                  value={twitterUsername}
                  fullWidth
                  translatableHintText={t`username`}
                  onChange={(e, value) => {
                    setTwitterUsername(value);
                  }}
                  disabled={updateProfileInProgress}
                  startAdornment={
                    <Text noMargin>
                      {communityLinksConfig.twitterUsername.prefix}
                    </Text>
                  }
                  maxLength={communityLinksConfig.twitterUsername.maxLength}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                {communityLinksConfig.facebookUsername.icon}
                <TextField
                  value={facebookUsername}
                  fullWidth
                  translatableHintText={t`username`}
                  onChange={(e, value) => {
                    setFacebookUsername(value);
                  }}
                  disabled={updateProfileInProgress}
                  startAdornment={
                    <Text noMargin>
                      {communityLinksConfig.facebookUsername.prefix}
                    </Text>
                  }
                  maxLength={communityLinksConfig.facebookUsername.maxLength}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                {communityLinksConfig.instagramUsername.icon}
                <TextField
                  value={youtubeUsername}
                  fullWidth
                  translatableHintText={t`username`}
                  onChange={(e, value) => {
                    setYoutubeUsername(value);
                  }}
                  disabled={updateProfileInProgress}
                  startAdornment={
                    <Text noMargin>
                      {communityLinksConfig.youtubeUsername.prefix}
                    </Text>
                  }
                  maxLength={communityLinksConfig.youtubeUsername.maxLength}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                {communityLinksConfig.tiktokUsername.icon}
                <TextField
                  value={tiktokUsername}
                  fullWidth
                  translatableHintText={t`username`}
                  onChange={(e, value) => {
                    setTiktokUsername(value);
                  }}
                  disabled={updateProfileInProgress}
                  startAdornment={
                    <Text noMargin>
                      {communityLinksConfig.tiktokUsername.prefix}
                    </Text>
                  }
                  errorText={tiktokUsernameError}
                  maxLength={communityLinksConfig.tiktokUsername.maxLength}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                {communityLinksConfig.instagramUsername.icon}
                <TextField
                  value={instagramUsername}
                  fullWidth
                  translatableHintText={t`username`}
                  onChange={(e, value) => {
                    setInstagramUsername(value);
                  }}
                  disabled={updateProfileInProgress}
                  startAdornment={
                    <Text noMargin>
                      {communityLinksConfig.instagramUsername.prefix}
                    </Text>
                  }
                  maxLength={communityLinksConfig.instagramUsername.maxLength}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                {communityLinksConfig.redditUsername.icon}
                <TextField
                  value={redditUsername}
                  fullWidth
                  translatableHintText={t`username`}
                  onChange={(e, value) => {
                    setRedditUsername(value);
                  }}
                  disabled={updateProfileInProgress}
                  startAdornment={
                    <Text noMargin>
                      {communityLinksConfig.redditUsername.prefix}
                    </Text>
                  }
                  maxLength={communityLinksConfig.redditUsername.maxLength}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                {communityLinksConfig.snapchatUsername.icon}
                <TextField
                  value={snapchatUsername}
                  fullWidth
                  translatableHintText={t`username`}
                  onChange={(e, value) => {
                    setSnapchatUsername(value);
                  }}
                  disabled={updateProfileInProgress}
                  startAdornment={
                    <Text noMargin>
                      {communityLinksConfig.snapchatUsername.prefix}
                    </Text>
                  }
                  maxLength={communityLinksConfig.snapchatUsername.maxLength}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                {communityLinksConfig.discordServerLink.icon}
                <TextField
                  value={discordServerLink}
                  fullWidth
                  translatableHintText={t`Discord server, e.g: https://discord.gg/...`}
                  onChange={(e, value) => {
                    setDiscordServerLink(value);
                  }}
                  disabled={updateProfileInProgress}
                  errorText={discordServerLinkError}
                  maxLength={communityLinksConfig.discordServerLink.maxLength}
                />
              </LineStackLayout>
              <TextField
                value={donateLink}
                floatingLabelText={<Trans>Donate link</Trans>}
                fullWidth
                translatableHintText={t`Do you have a Patreon? Ko-fi? Paypal?`}
                onChange={(e, value) => {
                  setDonateLink(value);
                }}
                disabled={updateProfileInProgress}
                floatingLabelFixed
                helperMarkdownText={i18n._(
                  t`Add a link to your donation page. It will be displayed on your gd.games profile and game pages.`
                )}
                errorText={donateLinkError}
                maxLength={donateLinkConfig.maxLength}
              />
              <Checkbox
                label={<Trans>I want to receive the GDevelop Newsletter</Trans>}
                checked={getNewsletterEmail}
                onCheck={(e, value) => {
                  setGetNewsletterEmail(value);
                }}
                disabled={updateProfileInProgress}
              />
              <Checkbox
                label={
                  <Trans>I want to receive weekly stats about my games</Trans>
                }
                checked={getGameStatsEmail}
                onCheck={(e, value) => {
                  setGetGameStatsEmail(value);
                }}
                disabled={updateProfileInProgress}
              />
              {/*
                This input is needed so that the browser submits the form when
                Enter key is pressed. See https://stackoverflow.com/questions/4196681/form-not-submitting-when-pressing-enter
              */}
              <input type="submit" value="Submit" style={{ display: 'none' }} />
            </ColumnStackLayout>
          </form>
        </Dialog>
      )}
    </I18n>
  );
};

export default EditProfileDialog;
