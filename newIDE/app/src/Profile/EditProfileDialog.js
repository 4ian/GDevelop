// @flow
import { Trans, t } from '@lingui/macro';

import React from 'react';
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
} from './UsernameField';
import TextField from '../UI/TextField';
import Checkbox from '../UI/Checkbox';

type Props = {|
  profile: Profile,
  onClose: () => void,
  onEdit: (form: EditForm) => Promise<void>,
  editInProgress: boolean,
  error: ?AuthError,
|};

export const getUsernameErrorText = (error: ?AuthError) => {
  if (!error) return undefined;

  if (error.code === 'auth/username-used')
    return 'This username is already used, please pick another one.';
  if (error.code === 'auth/malformed-username')
    return usernameFormatErrorMessage;
  return undefined;
};

const EditDialog = ({
  profile,
  onClose,
  onEdit,
  editInProgress,
  error,
}: Props) => {
  const [username, setUsername] = React.useState(profile.username || '');
  const [description, setDescription] = React.useState(
    profile.description || ''
  );
  const [getGameStatsEmail, setGetGameStatsEmail] = React.useState(
    !!profile.getGameStatsEmail
  );
  const [
    usernameAvailability,
    setUsernameAvailability,
  ] = React.useState<?UsernameAvailability>(null);
  const [
    isValidatingUsername,
    setIsValidatingUsername,
  ] = React.useState<boolean>(false);

  const canEdit = React.useMemo(
    () =>
      !editInProgress &&
      isUsernameValid(username, { allowEmpty: false }) &&
      !isValidatingUsername &&
      (!usernameAvailability || usernameAvailability.isAvailable),
    [editInProgress, username, isValidatingUsername, usernameAvailability]
  );

  const edit = () => {
    if (!canEdit) return;
    onEdit({
      username,
      description,
      getGameStatsEmail,
    });
  };

  const actions = [
    <FlatButton
      label={<Trans>Back</Trans>}
      disabled={editInProgress}
      key="back"
      primary={false}
      onClick={onClose}
    />,
    <LeftLoader isLoading={editInProgress || isValidatingUsername} key="edit">
      <DialogPrimaryButton
        label={<Trans>Save</Trans>}
        primary
        disabled={!canEdit}
        onClick={edit}
      />
    </LeftLoader>,
  ];

  return (
    <Dialog
      title={<Trans>Edit your GDevelop profile</Trans>}
      actions={actions}
      maxWidth="sm"
      cannotBeDismissed={editInProgress}
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
          onAvailabilityChecked={(
            usernameAvailability: ?UsernameAvailability
          ) => {
            setUsernameAvailability(usernameAvailability);
          }}
          onAvailabilityCheckLoading={setIsValidatingUsername}
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
        />
        <Checkbox
          label={<Trans>I want to receive weekly stats about my games</Trans>}
          checked={getGameStatsEmail}
          onCheck={(e, value) => {
            setGetGameStatsEmail(value);
          }}
        />
      </ColumnStackLayout>
    </Dialog>
  );
};

export default EditDialog;
