// @flow

import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { type User } from '../../../../../Utils/GDevelopServices/User';
import Text from '../../../../../UI/Text';
import { Trans } from '@lingui/macro';
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
|};

const ManageStudentRow = ({ member, isSelected, onSelect }: Props) => {
  const [isEditingPassword, setIsEditingPassword] = React.useState<boolean>(
    false
  );
  const [
    passwordEditionError,
    setPasswordEditionError,
  ] = React.useState<React.Node>(null);

  const onEditPassword = React.useCallback(async newPassword => {
    if (newPassword.length < 8) {
      setPasswordEditionError(
        <Trans>Password must be at least 8 characters long.</Trans>
      );
      return;
    }
  }, []);

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
            <Text>
              <b>{member.username}</b>
            </Text>
          )}
          <Text style={{ opacity: 0.7 }}>{member.email}</Text>
        </LineStackLayout>
      </Grid>
      <Grid item xs={7} style={{ display: 'flex', alignItems: 'center' }}>
        {isEditingPassword ? (
          <Line>
            <AsyncSemiControlledTextField
              margin="none"
              value={member.password || ''}
              callback={onEditPassword}
              callbackErrorText={passwordEditionError}
              emptyErrorText={<Trans>Password cannot be empty</Trans>}
              onCancel={() => setIsEditingPassword(false)}
            />
          </Line>
        ) : (
          <LineStackLayout alignItems="center">
            <Text noMargin style={{ opacity: 0.7 }}>
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
