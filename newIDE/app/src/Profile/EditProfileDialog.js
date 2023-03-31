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
  facebookLinkPrefix,
  instagramLinkPrefix,
  redditLinkPrefix,
  snapchatLinkPrefix,
  tiktokLinkPrefix,
  twitterLinkPrefix,
  youtubeLinkPrefix,
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
import Discord from '../UI/CustomSvgIcons/Discord';
import Snapchat from '../UI/CustomSvgIcons/Snapchat';
import Instagram from '../UI/CustomSvgIcons/Instagram';
import Facebook from '../UI/CustomSvgIcons/Facebook';
import Twitter from '../UI/CustomSvgIcons/Twitter';
import YouTube from '../UI/CustomSvgIcons/YouTube';
import Reddit from '../UI/CustomSvgIcons/Reddit';
import TikTok from '../UI/CustomSvgIcons/TikTok';
import Planet from '../UI/CustomSvgIcons/Planet';
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

const simpleUrlRegex = /^https:\/\/[^ ]+$/;
const profileLinkFormattingErrorMessage = (
  <Trans>Please enter a valid URL, starting with https://</Trans>
);
const simpleDiscordUrlRegex = /^https:\/\/discord[^ ]+$/;
const discordServerLinkFormattingErrorMessage = (
  <Trans>Please enter a valid URL, starting with https://discord</Trans>
);

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

  const canEdit =
    !updateProfileInProgress &&
    isUsernameValid(username, { allowEmpty: false }) &&
    !isValidatingUsername &&
    (!usernameAvailability || usernameAvailability.isAvailable);

  const donateLinkFormattingError =
    !!donateLink && !simpleUrlRegex.test(donateLink)
      ? profileLinkFormattingErrorMessage
      : undefined;
  const personalWebsiteLinkFormattingError =
    !!personalWebsiteLink && !simpleUrlRegex.test(personalWebsiteLink)
      ? profileLinkFormattingErrorMessage
      : undefined;
  const personalWebsite2LinkFormattingError =
    !!personalWebsite2Link && !simpleUrlRegex.test(personalWebsite2Link)
      ? profileLinkFormattingErrorMessage
      : undefined;
  const discordServerLinkFormattingError =
    !!discordServerLink && !simpleDiscordUrlRegex.test(discordServerLink)
      ? discordServerLinkFormattingErrorMessage
      : undefined;

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
                <Planet />
                <TextField
                  value={personalWebsiteLink}
                  fullWidth
                  translatableHintText={t`Personal website, itch.io page, etc.`}
                  onChange={(e, value) => {
                    setPersonalWebsiteLink(value);
                  }}
                  disabled={updateProfileInProgress}
                  errorText={personalWebsiteLinkFormattingError}
                  maxLength={150}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                <Planet />
                <TextField
                  value={personalWebsite2Link}
                  fullWidth
                  translatableHintText={t`Another personal website, newgrounds.com page, etc.`}
                  onChange={(e, value) => {
                    setPersonalWebsite2Link(value);
                  }}
                  disabled={updateProfileInProgress}
                  errorText={personalWebsite2LinkFormattingError}
                  maxLength={150}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                <Twitter />
                <TextField
                  value={twitterUsername}
                  fullWidth
                  translatableHintText={t`username`}
                  onChange={(e, value) => {
                    setTwitterUsername(value);
                  }}
                  disabled={updateProfileInProgress}
                  startAdornment={<Text noMargin>{twitterLinkPrefix}</Text>}
                  maxLength={15}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                <Facebook />
                <TextField
                  value={facebookUsername}
                  fullWidth
                  translatableHintText={t`username`}
                  onChange={(e, value) => {
                    setFacebookUsername(value);
                  }}
                  disabled={updateProfileInProgress}
                  startAdornment={<Text noMargin>{facebookLinkPrefix}</Text>}
                  maxLength={50}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                <YouTube />
                <TextField
                  value={youtubeUsername}
                  fullWidth
                  translatableHintText={t`username`}
                  onChange={(e, value) => {
                    setYoutubeUsername(value);
                  }}
                  disabled={updateProfileInProgress}
                  startAdornment={<Text noMargin>{youtubeLinkPrefix}</Text>}
                  maxLength={100}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                <TikTok />
                <TextField
                  value={tiktokUsername}
                  fullWidth
                  translatableHintText={t`username`}
                  onChange={(e, value) => {
                    setTiktokUsername(value);
                  }}
                  disabled={updateProfileInProgress}
                  startAdornment={<Text noMargin>{tiktokLinkPrefix}</Text>}
                  maxLength={30}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                <Instagram />
                <TextField
                  value={instagramUsername}
                  fullWidth
                  translatableHintText={t`username`}
                  onChange={(e, value) => {
                    setInstagramUsername(value);
                  }}
                  disabled={updateProfileInProgress}
                  startAdornment={<Text noMargin>{instagramLinkPrefix}</Text>}
                  maxLength={30}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                <Reddit />
                <TextField
                  value={redditUsername}
                  fullWidth
                  translatableHintText={t`username`}
                  onChange={(e, value) => {
                    setRedditUsername(value);
                  }}
                  disabled={updateProfileInProgress}
                  startAdornment={<Text noMargin>{redditLinkPrefix}</Text>}
                  maxLength={20}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                <Snapchat />
                <TextField
                  value={snapchatUsername}
                  fullWidth
                  translatableHintText={t`username`}
                  onChange={(e, value) => {
                    setSnapchatUsername(value);
                  }}
                  disabled={updateProfileInProgress}
                  startAdornment={<Text noMargin>{snapchatLinkPrefix}</Text>}
                  maxLength={15}
                />
              </LineStackLayout>
              <LineStackLayout noMargin alignItems="center">
                <Discord />
                <TextField
                  value={discordServerLink}
                  fullWidth
                  translatableHintText={t`Discord server, e.g: https://discord.gg/...`}
                  onChange={(e, value) => {
                    setDiscordServerLink(value);
                  }}
                  disabled={updateProfileInProgress}
                  errorText={discordServerLinkFormattingError}
                  maxLength={150}
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
                errorText={donateLinkFormattingError}
                maxLength={150}
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
