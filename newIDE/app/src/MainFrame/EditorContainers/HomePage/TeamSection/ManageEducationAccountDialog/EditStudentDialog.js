// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import FlatButton from '../../../../../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../../../../../UI/Dialog';
import { ColumnStackLayout } from '../../../../../UI/Layout';
import {
  type User,
  type EditUserChanges,
  type UsernameAvailability,
} from '../../../../../Utils/GDevelopServices/User';
import LeftLoader from '../../../../../UI/LeftLoader';
import SemiControlledTextField from '../../../../../UI/SemiControlledTextField';
import { UsernameField } from '../../../../../Profile/UsernameField';
import AlertMessage from '../../../../../UI/AlertMessage';

type Props = {|
  member: User,
  onApply: (changes: EditUserChanges) => Promise<void>,
  onClose: () => void,
  isSaving: boolean,
  error: ?Error,
|};

export const EditStudentDialog = ({
  member,
  onApply,
  onClose,
  isSaving,
  error,
}: Props) => {
  const [changes, setChanges] = React.useState<EditUserChanges | null>(null);

  const [
    usernameAvailability,
    setUsernameAvailability,
  ] = React.useState<?UsernameAvailability>(null);
  const [
    isValidatingUsername,
    setIsValidatingUsername,
  ] = React.useState<boolean>(false);

  const canSave =
    !usernameAvailability || (usernameAvailability.isAvailable && !!changes);

  const triggerApply = React.useCallback(
    async () => {
      if (!canSave || !changes) return;
      await onApply(changes);
    },
    [changes, canSave, onApply]
  );

  return (
    <Dialog
      open
      title={<Trans>Edit student</Trans>}
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary={false}
          onClick={onClose}
          disabled={isSaving}
          id="close-button"
        />,
        <LeftLoader isLoading={isSaving}>
          <DialogPrimaryButton
            key="apply"
            primary
            label={<Trans>Apply</Trans>}
            onClick={triggerApply}
            disabled={isSaving || !canSave}
            id="apply-button"
          />
        </LeftLoader>,
      ]}
      onRequestClose={onClose}
      onApply={triggerApply}
      maxWidth="sm"
    >
      <ColumnStackLayout expand noMargin>
        {error && (
          <AlertMessage kind="error">
            <Trans>
              An error occurred while editing the student. Please try again.
            </Trans>
          </AlertMessage>
        )}
        <SemiControlledTextField
          onChange={fullName => setChanges({ ...changes, fullName })}
          value={
            changes && typeof changes.fullName !== 'undefined'
              ? changes.fullName
              : member.fullName || ''
          }
          disabled={isSaving}
          fullWidth
          commitOnBlur
          floatingLabelText={<Trans>Full name</Trans>}
        />
        <UsernameField
          initialUsername={member.username}
          value={
            changes && typeof changes.username !== 'undefined'
              ? changes.username
              : member.username || ''
          }
          onChange={(_, username) => setChanges({ ...changes, username })}
          disabled={isSaving}
          allowEmpty
          onAvailabilityChecked={setUsernameAvailability}
          onAvailabilityCheckLoading={setIsValidatingUsername}
          isValidatingUsername={isValidatingUsername}
        />
      </ColumnStackLayout>
    </Dialog>
  );
};
