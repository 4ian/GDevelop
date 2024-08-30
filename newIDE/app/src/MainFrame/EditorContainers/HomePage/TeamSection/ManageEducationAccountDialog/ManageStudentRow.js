// @flow

import * as React from 'react';
import { t, Trans } from '@lingui/macro';
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
import { useResponsiveWindowSize } from '../../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { textEllipsisStyle } from '../../../../../UI/TextEllipsis';

const primaryTextArchivedOpacity = 0.6;
const primaryTextPlaceholderOpacity = 0.7;
const primaryTextPlaceholderArchivedOpacity = 0.6;
const secondaryTextOpacity = 0.6;
const tertiaryTextOpacity = 0.7;
const tertiaryTextArchivedOpacity = 0.55;

const styles = {
  cell: { display: 'flex', alignItems: 'center' },
  mobileCell: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: 4,
  },
  passwordTextFieldContainer: {
    height: 21, // Avoid layout shifts
  },
  passwordTextField: {
    fontSize: 14, // Avoid font changes when editing password.
  },
};

type Props = {|
  member: User,
  isSelected: boolean,
  isArchived?: boolean,
  onSelect: (selected: boolean) => void,
  onChangePassword: ({|
    userId: string,
    newPassword: string,
  |}) => Promise<void>,
|};

const ManageStudentRow = ({
  member,
  isSelected,
  isArchived,
  onSelect,
  onChangePassword,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
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
      setPasswordEditionError(null);
      if (newPassword.length < 8 || newPassword.length > 30) {
        setPasswordEditionError(
          <Trans>Your password must be between 8 and 30 characters long.</Trans>
        );
        return;
      }
      try {
        await onChangePassword({ userId: member.id, newPassword });
        setIsEditingPassword(false);
      } catch (error) {
        console.error(
          'An error occurred while changing member password',
          error
        );
        setPasswordEditionError(
          <>
            <Trans>An error occurred.</Trans>{' '}
            <Trans>
              Please check your internet connection or try again later.
            </Trans>
          </>
        );
      }
    },
    [member.password, member.id, onChangePassword]
  );

  const usernameCell = (
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
      {member.username ? (
        <Text
          allowSelection
          style={{
            ...textEllipsisStyle,
            opacity: isArchived ? primaryTextArchivedOpacity : undefined,
          }}
        >
          <b>{member.username}</b>
        </Text>
      ) : (
        <Text
          style={{
            ...textEllipsisStyle,
            opacity: isArchived
              ? primaryTextPlaceholderArchivedOpacity
              : primaryTextPlaceholderOpacity,
            // For italic characters not to be cut.
            paddingRight: 1,
          }}
        >
          <i>
            <Trans>Not set</Trans>
          </i>
        </Text>
      )}
    </LineStackLayout>
  );

  const emailCell = (
    <Text
      style={{
        ...textEllipsisStyle,
        opacity: secondaryTextOpacity,
      }}
      allowSelection
      noMargin
    >
      {member.email}
    </Text>
  );

  const passwordCell = isEditingPassword ? (
    <Line>
      <div style={styles.passwordTextFieldContainer}>
        <AsyncSemiControlledTextField
          margin="none"
          autoFocus="desktop"
          value={member.password || ''}
          callback={onEditPassword}
          errorText={passwordEditionError}
          callbackErrorText={
            <Trans>
              An error occurred while changing the password. Please try again
              later.
            </Trans>
          }
          emptyErrorText={<Trans>Password cannot be empty</Trans>}
          onCancel={() => setIsEditingPassword(false)}
          style={styles.passwordTextField}
        />
      </div>
    </Line>
  ) : (
    <LineStackLayout alignItems="center">
      <Text
        noMargin
        style={{
          ...textEllipsisStyle,
          opacity: isArchived
            ? tertiaryTextArchivedOpacity
            : tertiaryTextOpacity,
          // For italic characters not to be cut.
          paddingRight: 1,
        }}
        allowSelection
      >
        {member.password || (
          <i>
            <Trans>Not stored</Trans>
          </i>
        )}
      </Text>
      {!isArchived && (
        <IconButton
          size="small"
          onClick={() => setIsEditingPassword(true)}
          tooltip={t`Define custom password`}
        >
          <Key fontSize="small" />
        </IconButton>
      )}
    </LineStackLayout>
  );

  if (isMobile) {
    return (
      <>
        <Grid item xs={4} style={isMobile ? styles.mobileCell : styles.cell}>
          {usernameCell}
        </Grid>
        <Grid item xs={4} style={isMobile ? styles.mobileCell : styles.cell}>
          {emailCell}
        </Grid>
        <Grid item xs={4} style={isMobile ? styles.mobileCell : styles.cell}>
          {passwordCell}
        </Grid>
      </>
    );
  }

  return (
    <>
      <Grid item xs={5} style={isMobile ? styles.mobileCell : styles.cell}>
        <LineStackLayout noMargin alignItems="center">
          {usernameCell}
          {emailCell}
        </LineStackLayout>
      </Grid>
      <Grid item xs={7} style={isMobile ? styles.mobileCell : styles.cell}>
        {passwordCell}
      </Grid>
    </>
  );
};

export default ManageStudentRow;
