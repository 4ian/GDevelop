// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import Dialog from '../../../../../UI/Dialog';
import FlatButton from '../../../../../UI/FlatButton';
import { ColumnStackLayout } from '../../../../../UI/Layout';
import AlertMessage from '../../../../../UI/AlertMessage';
import StudentCreationCard from '../StudentCreationCard';

type Props = {|
  onClose: () => void,
  onCreateStudentAccounts: (quantity: number) => Promise<void>,
  availableSeats: number,
  isCreatingMembers: boolean,
|};

const CreateStudentsDialog = ({
  onClose,
  onCreateStudentAccounts,
  availableSeats,
  isCreatingMembers,
}: Props): React.Node => {
  const onCreateAndClose = React.useCallback(
    async (quantity: number) => {
      await onCreateStudentAccounts(quantity);
      onClose();
    },
    [onCreateStudentAccounts, onClose]
  );

  return (
    <Dialog
      title={<Trans>Create students</Trans>}
      actions={[
        <FlatButton
          label={<Trans>Close</Trans>}
          disabled={isCreatingMembers}
          key="close"
          primary={false}
          onClick={onClose}
        />,
      ]}
      maxWidth="sm"
      cannotBeDismissed={isCreatingMembers}
      onRequestClose={onClose}
      open
    >
      <ColumnStackLayout noMargin>
        <AlertMessage kind="info">
          <Trans>
            Users will be created with an anonymous email. You can later define
            a full name, a username, or update the generated password if needed.
          </Trans>
        </AlertMessage>
        <StudentCreationCard
          availableSeats={availableSeats}
          isCreatingMembers={isCreatingMembers}
          onCreateStudentAccounts={onCreateAndClose}
        />
      </ColumnStackLayout>
    </Dialog>
  );
};

export default CreateStudentsDialog;
