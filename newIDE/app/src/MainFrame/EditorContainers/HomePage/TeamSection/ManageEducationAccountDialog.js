// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import Divider from '@material-ui/core/Divider';
import TeamContext from '../../../../Profile/Team/TeamContext';
import Dialog, { DialogPrimaryButton } from '../../../../UI/Dialog';
import Text from '../../../../UI/Text';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import UserLine from '../../../../UI/User/UserLine';
import FlatButton from '../../../../UI/FlatButton';
import LeftLoader from '../../../../UI/LeftLoader';
import Form from '../../../../UI/Form';
import { ColumnStackLayout } from '../../../../UI/Layout';
import TextField from '../../../../UI/TextField';
import { emailRegex } from '../../../../Utils/EmailUtils';
import RaisedButton from '../../../../UI/RaisedButton';
import Add from '../../../../UI/CustomSvgIcons/Add';

type AddTeacherError =
  | 'no-seats-available'
  | 'user-already-added'
  | 'user-owner'
  | 'not-allowed'
  | 'unexpected';

const getEmailErrorText = (error: ?AddTeacherError) => {};

type AddTeacherDialogProps = {|
  onClose: () => void,
|};

const AddTeacherDialog = ({ onClose }: AddTeacherDialogProps) => {
  const [email, setEmail] = React.useState<string>('');
  const [actionInProgress, setActionInProgress] = React.useState(false);
  const [isEmailValid, setIsEmailValid] = React.useState<boolean>(true);
  const [addError, setAddError] = React.useState<?AddTeacherError>(null);

  const doAddTeacher = React.useCallback(() => {
    // TODO once endpoint is available
  }, []);

  return (
    <Dialog
      title="Add a collaborator"
      actions={[
        <FlatButton
          label={<Trans>Back</Trans>}
          disabled={actionInProgress}
          key="back"
          primary={false}
          onClick={onClose}
        />,
        <LeftLoader isLoading={actionInProgress} key="add-collaborator">
          <DialogPrimaryButton
            label={<Trans>Add</Trans>}
            primary
            onClick={doAddTeacher}
            disabled={actionInProgress}
          />
        </LeftLoader>,
      ]}
      maxWidth="xs"
      cannotBeDismissed={actionInProgress}
      onRequestClose={onClose}
      onApply={doAddTeacher}
      open
    >
      <Form onSubmit={doAddTeacher} name="addCollaborator">
        <ColumnStackLayout noMargin>
          <TextField
            autoFocus="desktop"
            value={email}
            floatingLabelText={<Trans>Email</Trans>}
            type="email"
            onChange={(e, value) => {
              if (!isEmailValid) setIsEmailValid(true);
              if (addError) setAddError(null);
              setEmail(value);
            }}
            errorText={
              !isEmailValid ? (
                <Trans>Invalid email address.</Trans>
              ) : (
                getEmailErrorText(addError)
              )
            }
            fullWidth
            onBlur={event => {
              const trimmedEmail = event.currentTarget.value.trim();
              setEmail(trimmedEmail);
              if (trimmedEmail) {
                setIsEmailValid(emailRegex.test(trimmedEmail));
              }
            }}
            disabled={actionInProgress}
          />
        </ColumnStackLayout>
      </Form>
    </Dialog>
  );
};

type Props = {|
  onClose: () => void,
|};

const ManageEducationAccountDialog = ({ onClose }: Props) => {
  const { profile } = React.useContext(AuthenticatedUserContext);
  const [
    addTeacherDialogOpen,
    setAddTeacherDialogOpen,
  ] = React.useState<boolean>(false);
  const {
    groups,
    team,
    admins,
    members,
    memberships,
    onRefreshMembers,
  } = React.useContext(TeamContext);

  if (!admins || !members || !team || !groups) return null;

  return (
    <>
      <Dialog
        title={<Trans>Manage seats</Trans>}
        flexColumnBody
        fullHeight
        open
        onRequestClose={onClose}
      >
        <Text size="sub-title">
          <Trans>Teacher accounts</Trans>
        </Text>
        {admins &&
          admins.map(adminUser => (
            <UserLine
              username={adminUser.username}
              email={adminUser.email}
              level={null}
              onDelete={null}
              disabled={profile && adminUser.id === profile.id}
            />
          ))}
        <RaisedButton
          primary
          icon={<Add fontSize="small" />}
          label={<Trans>Add teacher</Trans>}
          onClick={() => setAddTeacherDialogOpen(true)}
        />
        <Divider />
        <Text size="sub-title">
          <Trans>Student accounts</Trans>
        </Text>
      </Dialog>
      {addTeacherDialogOpen && (
        <AddTeacherDialog onClose={() => setAddTeacherDialogOpen(false)} />
      )}
    </>
  );
};

export default ManageEducationAccountDialog;
