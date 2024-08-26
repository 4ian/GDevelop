// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import Grid from '@material-ui/core/Grid';
import { type User } from '../../../../../Utils/GDevelopServices/User';
import Text from '../../../../../UI/Text';
import { LineStackLayout } from '../../../../../UI/Layout';
import Checkbox from '../../../../../UI/Checkbox';
import CheckboxUnchecked from '../../../../../UI/CustomSvgIcons/CheckboxUnchecked';
import CheckboxChecked from '../../../../../UI/CustomSvgIcons/CheckboxChecked';
import AsyncSemiControlledTextField from '../../../../../UI/AsyncSemiControlledTextField';
import IconButton from '../../../../../UI/IconButton';
import Key from '../../../../../UI/CustomSvgIcons/Key';
import { Line } from '../../../../../UI/Grid';

type Props = {|
  member: User,
  isSelected: boolean,
  onSelect: (selected: boolean) => void,
  onChangePassword: ({|
    userId: string,
    newPassword: string,
  |}) => Promise<void>,
|};

const ManageStudentRow = ({
  member,
  isSelected,
  onSelect,
  onChangePassword,
}: Props) => {
  const [isEditingPassword, setIsEditingPassword] = React.useState<boolean>(
    false
  );
  const [
    passwordEditionError,
    setPasswordEditionError,
  ] = React.useState<React.Node>(null);

  const onEditPassword = React.useCallback(
    async (newPassword: string) => {
      if (member.password && newPassword === member.password) {
        setIsEditingPassword(false);
        return;
      }
      if (newPassword.length < 8) {
        setPasswordEditionError(
          <Trans>Password must be at least 8 characters long.</Trans>
        );
        throw new Error('Password validation error');
      }
      await onChangePassword({ userId: member.id, newPassword });
      setIsEditingPassword(false);
    },
    [member.password, member.id, onChangePassword]
  );

  return (
    <>
      <Grid item xs={5} style={{ alignItems: 'center' }}>
        <LineStackLayout alignItems="center" noMargin>
          <Checkbox
            style={{ margin: 0 }}
            checked={isSelected}
            onCheck={(e, checked) => {
              onSelect(checked);
            }}
            uncheckedIcon={<CheckboxUnchecked />}
            checkedIcon={<CheckboxChecked />}
          />
          {member.username && (
            <Text allowSelection>
              <b>{member.username}</b>
            </Text>
          )}
          <Text style={{ opacity: 0.7 }} allowSelection>
            {member.email}
          </Text>
        </LineStackLayout>
      </Grid>
      <Grid item xs={7} style={{ display: 'flex', alignItems: 'center' }}>
        {isEditingPassword ? (
          <Line>
            <AsyncSemiControlledTextField
              margin="none"
              autoFocus="desktop"
              value={member.password || ''}
              callback={onEditPassword}
              callbackErrorText={passwordEditionError}
              emptyErrorText={<Trans>Password cannot be empty</Trans>}
              onCancel={() => setIsEditingPassword(false)}
            />
          </Line>
        ) : (
          <LineStackLayout alignItems="center">
            <Text noMargin style={{ opacity: 0.7 }} allowSelection>
              {member.password || (
                <i>
                  <Trans>Not stored</Trans>
                </i>
              )}
            </Text>
            <IconButton size="small" onClick={() => setIsEditingPassword(true)}>
              <Key fontSize="small" />
            </IconButton>
          </LineStackLayout>
        )}
      </Grid>
    </>
  );
};

export default ManageStudentRow;
