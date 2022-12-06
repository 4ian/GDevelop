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
import { type UsernameAvailability } from '../Utils/GDevelopServices/User';
import LeftLoader from '../UI/LeftLoader';
import { ColumnStackLayout } from '../UI/Layout';
import {
  isUsernameValid,
  UsernameField,
  usernameFormatErrorMessage,
  usernameAvailabilityErrorMessage,
} from './UsernameField';
import TextField from '../UI/TextField';
import Checkbox from '../UI/Checkbox';

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
const donateLinkFormattingErrorMessage = (
  <Trans>Please enter a valid URL, starting with https://</Trans>
);

const EditProfileDialog = ({
  profile,
  onClose,
  onEdit,
  updateProfileInProgress,
  error,
}: Props) => {
  const [username, setUsername] = React.useState(profile.username || '');
  const [description, setDescription] = React.useState(
    profile.description || ''
  );
  const [donateLink, setDonateLink] = React.useState(profile.donateLink || '');
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
      ? donateLinkFormattingErrorMessage
      : undefined;

  const edit = () => {
    if (!canEdit) return;
    onEdit({
      username,
      description,
      getGameStatsEmail,
      getNewsletterEmail,
      donateLink,
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
                t`Add a link to your donation page. It will be displayed on your Liluo.io profile and game pages.`
              )}
              errorText={donateLinkFormattingError}
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
          </ColumnStackLayout>
        </Dialog>
      )}
    </I18n>
  );
};

export default EditProfileDialog;
