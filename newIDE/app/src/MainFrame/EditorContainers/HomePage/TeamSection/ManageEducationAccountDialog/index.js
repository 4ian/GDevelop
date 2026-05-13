// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import Divider from '@material-ui/core/Divider';
import Collapse from '@material-ui/core/Collapse';
import TeamContext from '../../../../../Profile/Team/TeamContext';
import Dialog from '../../../../../UI/Dialog';
import Text from '../../../../../UI/Text';
import AuthenticatedUserContext from '../../../../../Profile/AuthenticatedUserContext';
import UserLine from '../../../../../UI/User/UserLine';
import FlatButton from '../../../../../UI/FlatButton';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../../UI/Layout';
import RaisedButton from '../../../../../UI/RaisedButton';
import Add from '../../../../../UI/CustomSvgIcons/Add';
import { groupMembersByGroupId, sortGroupsWithMembers } from '../Utils';
import { Column, Line, Spacer } from '../../../../../UI/Grid';
import ManageStudentRow from './ManageStudentRow';
import AddTeacherDialog from './AddTeacherDialog';
import CreateStudentsDialog from './CreateStudentsDialog';
import InviteStudentDialog from './InviteStudentDialog';
import AlertMessage from '../../../../../UI/AlertMessage';
import TeamAvailableSeats from '../TeamAvailableSeats';
import { copyTextToClipboard } from '../../../../../Utils/Clipboard';
import ChevronArrowRight from '../../../../../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../../../../../UI/CustomSvgIcons/ChevronArrowBottom';
import Paper from '../../../../../UI/Paper';
import Checkbox from '../../../../../UI/Checkbox';
import CheckboxUnchecked from '../../../../../UI/CustomSvgIcons/CheckboxUnchecked';
import CheckboxChecked from '../../../../../UI/CustomSvgIcons/CheckboxChecked';
import Archive from '../../../../../UI/CustomSvgIcons/Archive';
import Recycle from '../../../../../UI/CustomSvgIcons/Recycle';
import IconButton from '../../../../../UI/IconButton';
import { extractGDevelopApiErrorStatusAndCode } from '../../../../../Utils/GDevelopServices/Errors';
import StudentCreationCard from '../StudentCreationCard';
import CircularProgress from '../../../../../UI/CircularProgress';
import { useResponsiveWindowSize } from '../../../../../UI/Responsive/ResponsiveWindowMeasurer';
import Copy from '../../../../../UI/CustomSvgIcons/Copy';
import Trash from '../../../../../UI/CustomSvgIcons/Trash';
import Refresh from '../../../../../UI/CustomSvgIcons/Refresh';
import Education from '../../../../../Profile/Subscription/Icons/Education';
import useAlertDialog from '../../../../../UI/Alert/useAlertDialog';
import { delay } from '../../../../../Utils/Delay';
import Check from '../../../../../UI/CustomSvgIcons/Check';
import { getPlanIcon } from '../../../../../Profile/Subscription/PlanSmallCard';
import { selectMessageByLocale } from '../../../../../Utils/i18n/MessageByLocale';
import TextButton from '../../../../../UI/TextButton';
import Chip from '../../../../../UI/Chip';
import { SubscriptionContext } from '../../../../../Profile/Subscription/SubscriptionContext';
import { type EditUserChanges } from '../../../../../Utils/GDevelopServices/User';

const styles = {
  selectedMembersControlsContainer: {
    padding: 8,
  },
  selectedMembersControlsContainerMobile: {
    padding: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  subscriptionPaper: {
    padding: '8px 16px 8px 8px',
  },
};

type RemoveTeacherError =
  | 'user-not-found'
  | 'user-owner'
  | 'user-not-admin'
  | 'not-allowed'
  | 'unexpected';

const removeErrorToText = {
  'user-not-found': <Trans>The email you provided could not be found.</Trans>,
  'user-not-admin': (
    <Trans>The email you provided is not an admin in your team.</Trans>
  ),
  'user-owner': (
    <Trans>The main account of the Education plan cannot be modified.</Trans>
  ),
  'not-allowed': (
    <Trans>You don't have enough rights to add a new admin.</Trans>
  ),
  unexpected: (
    <Trans>
      An unexpected error happened. Please contact us for more details.
    </Trans>
  ),
};

type Props = {|
  onClose: () => void,
|};

const ManageEducationAccountDialog = ({
  onClose,
}: Props): null | React.Node => {
  const { profile, subscription } = React.useContext(AuthenticatedUserContext);
  const {
    openSubscriptionDialog,
    getSubscriptionPlansWithPricingSystems,
  } = React.useContext(SubscriptionContext);
  const subscriptionPlansWithPricingSystems = getSubscriptionPlansWithPricingSystems();
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
  const [isCreatingMembers, setIsCreatingMembers] = React.useState<boolean>(
    false
  );
  const [isArchivingAccounts, setIsArchivingAccounts] = React.useState<boolean>(
    false
  );
  const [isRestoringAccounts, setIsRestoringAccounts] = React.useState<boolean>(
    false
  );
  const [
    credentialsCopySuccess,
    setCredentialsCopySuccess,
  ] = React.useState<boolean>(false);
  const [
    adminEmailBeingRemoved,
    setAdminEmailBeingRemoved,
  ] = React.useState<?string>(null);
  const [
    removeAdminError,
    setRemoveAdminError,
  ] = React.useState<?RemoveTeacherError>(null);
  const { showAlert, showConfirmation } = useAlertDialog();
  const { isMobile } = useResponsiveWindowSize();
  const [batchControlError, setBatchControlError] = React.useState<React.Node>(
    null
  );
  const [
    addTeacherDialogOpen,
    setAddTeacherDialogOpen,
  ] = React.useState<boolean>(false);
  const [
    createStudentsDialogOpen,
    setCreateStudentsDialogOpen,
  ] = React.useState<boolean>(false);
  const [
    inviteStudentDialogOpen,
    setInviteStudentDialogOpen,
  ] = React.useState<boolean>(false);
  const [
    isArchivedAccountsSectionOpen,
    setIsArchivedAccountsSectionOpen,
  ] = React.useState<boolean>(false);
  const {
    groups,
    team,
    admins,
    members,
    memberships,
    invitations,
    onRefreshMembers,
    onRefreshInvitations,
    getAvailableSeats,
    onCreateMembers,
    onChangeMemberPassword,
    onActivateMembers,
    onSetAdmin,
    onRefreshAdmins,
    onEditUser,
    onSetMember,
  } = React.useContext(TeamContext);

  React.useEffect(
    () => {
      (async () => {
        if (!credentialsCopySuccess) return;
        await delay(2000);
        setCredentialsCopySuccess(false);
      })();
    },
    [credentialsCopySuccess]
  );

  const onEditTeamMember = React.useCallback(
    async ({
      editedUserId,
      changes,
    }: {|
      editedUserId: string,
      changes: EditUserChanges,
    |}) => {
      await onEditUser(editedUserId, changes);
      await onRefreshMembers();
    },
    [onEditUser, onRefreshMembers]
  );

  const onChangeTeamMemberPassword = React.useCallback(
    async ({
      userId,
      newPassword,
    }: {|
      userId: string,
      newPassword: string,
    |}) => {
      await onChangeMemberPassword(userId, newPassword);
      await onRefreshMembers();
    },
    [onRefreshMembers, onChangeMemberPassword]
  );

  const onCopyActiveCredentials = React.useCallback(
    () => {
      if (!members) return;
      let content = 'Username,Full Name,Email,Password';
      // $FlowFixMe[missing-empty-array-annot]
      let membersToConsider = [];
      if (selectedUserIds.length === 0) {
        // $FlowFixMe[incompatible-type]
        membersToConsider = members.filter(
          member => !member.deactivatedAt && member.isEmailAutogenerated
        );
      } else {
        // $FlowFixMe[incompatible-type]
        membersToConsider = members.filter(member =>
          selectedUserIds.includes(member.id)
        );
      }
      membersToConsider.forEach(member => {
        content += `\n${member.username || ''},${member.fullName || ''},${
          member.email
        },${member.password || ''}`;
      });
      copyTextToClipboard(content);
      setCredentialsCopySuccess(true);
    },
    [selectedUserIds, members]
  );

  const isLoading = !subscriptionPlansWithPricingSystems;

  const availableSeats = getAvailableSeats();
  const userSubscriptionPlanWithPricingSystems =
    subscription && subscription.planId && subscriptionPlansWithPricingSystems
      ? subscriptionPlansWithPricingSystems.find(
          subscriptionPlanWithPricingSystems =>
            subscriptionPlanWithPricingSystems.id === subscription.planId
        )
      : null;

  const onCreateTeamMembers = React.useCallback(
    async (quantity: number) => {
      if (!availableSeats || quantity > availableSeats || isCreatingMembers) {
        return;
      }
      setIsCreatingMembers(true);
      try {
        await onCreateMembers(quantity);
        await onRefreshMembers();
      } catch (error) {
        console.error(`An error occurred when creating members: `, error);
      } finally {
        setIsCreatingMembers(false);
      }
    },
    [onCreateMembers, onRefreshMembers, availableSeats, isCreatingMembers]
  );

  const onRemoveAdmin = React.useCallback(
    async (email: string) => {
      setAdminEmailBeingRemoved(email);
      setRemoveAdminError(null);
      try {
        await onSetAdmin(email, false);
        await onRefreshAdmins();
      } catch (error) {
        console.error(error);
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (!extractedStatusAndCode) {
          setRemoveAdminError('unexpected');
        } else {
          let error;
          if (extractedStatusAndCode.status === 404) {
            error = 'user-not-found';
          } else if (extractedStatusAndCode.status === 403) {
            error = 'not-allowed';
          } else if (
            extractedStatusAndCode.code ===
            'team-admin-creation/owner-cannot-be-modified'
          ) {
            error = 'user-owner';
          } else if (
            extractedStatusAndCode.code === 'team-admin-creation/user-not-admin'
          ) {
            error = 'user-not-admin';
          } else {
            error = 'unexpected';
          }
          // $FlowFixMe[incompatible-type]
          setRemoveAdminError(error);
        }
      } finally {
        setAdminEmailBeingRemoved(null);
      }
    },
    [onSetAdmin, onRefreshAdmins]
  );

  const onSetUserAsAdmin = React.useCallback(
    async (email: string) => {
      await onSetAdmin(email, true);
      await onRefreshAdmins();
    },
    [onSetAdmin, onRefreshAdmins]
  );

  const onInviteTeamMember = React.useCallback(
    async (email: string) => {
      await onSetMember(email, true);
      await onRefreshMembers();
      await onRefreshInvitations();
    },
    [onSetMember, onRefreshMembers, onRefreshInvitations]
  );

  const onRemoveTeamMember = React.useCallback(
    async (email: string) => {
      await onSetMember(email, false);
      await onRefreshMembers();
    },
    [onSetMember, onRefreshMembers]
  );

  const onRemoveInvitedMember = React.useCallback(
    async (email: string) => {
      const confirmed = await showConfirmation({
        title: t`Remove student?`,
        message: t`${email} will be removed from the team.`,
        confirmButtonLabel: t`Remove`,
        dismissButtonLabel: t`Back`,
        level: 'warning',
        maxWidth: 'xs',
      });
      if (!confirmed) return;
      await onRemoveTeamMember(email);
    },
    [showConfirmation, onRemoveTeamMember]
  );

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(
    async () => {
      setIsRefreshing(true);
      await Promise.all([onRefreshMembers(), onRefreshInvitations()]);
      await delay(1000);
      setIsRefreshing(false);
    },
    [onRefreshMembers, onRefreshInvitations]
  );

  const onRemoveInvitation = React.useCallback(
    async (email: string) => {
      const confirmed = await showConfirmation({
        title: t`Remove invitation?`,
        message: t`The invitation sent to ${email} will be cancelled.`,
        confirmButtonLabel: t`Remove`,
        dismissButtonLabel: t`Back`,
        level: 'warning',
        maxWidth: 'xs',
      });
      if (!confirmed) return;
      const [freshInvitations] = await Promise.all([
        onRefreshInvitations(),
        onRefreshMembers(),
      ]);
      const isStillPending =
        freshInvitations && freshInvitations.some(inv => inv.email === email);
      if (!isStillPending) {
        showAlert({
          title: t`Invitation already accepted`,
          message: t`${email} has already accepted the invitation and joined the team.`,
        });
        return;
      }
      try {
        await onSetMember(email, false);
        await onRefresh();
      } catch (error) {
        console.error('An error occurred while removing invitation:', error);
        showAlert({
          title: t`Could not remove invitation`,
          message: t`An unexpected error occurred. The list has been refreshed.`,
        });
        await onRefresh();
      }
    },
    [
      showConfirmation,
      showAlert,
      onSetMember,
      onRefreshInvitations,
      onRefreshMembers,
      onRefresh,
    ]
  );

  const onOpenPurchaseSeatsDialog = React.useCallback(
    () => {
      showAlert({
        title: t`Update your seats`,
        message: t`To update your seats, contact us at education@gdevelop.io with the details of your current account and how many seats you would like.`,
      });
    },
    [showAlert]
  );

  const onActivateTeamMembers = React.useCallback(
    async (activate: boolean) => {
      if (selectedUserIds.length === 0) return;
      setBatchControlError(null);

      try {
        if (!activate) {
          const confirm = await showConfirmation({
            title: t`Archive ${selectedUserIds.length} accounts?`,
            confirmButtonLabel: t`Archive ${selectedUserIds.length} accounts`,
            dismissButtonLabel: t`Cancel`,
            message: t`Projects in disabled accounts will not be deleted. All disabled accounts can be reactivated after 15 days.`,
            level: 'info',
            maxWidth: 'xs',
          });
          if (!confirm) return;
        }
        if (activate) {
          setIsRestoringAccounts(true);
        } else {
          setIsArchivingAccounts(true);
        }
        await onActivateMembers(selectedUserIds, activate);
        if (!activate) {
          // If accounts are archived, they might disappear under the collapsed section
          // "Archived accounts" so we unselect them to avoid any mistake around user selection.
          setSelectedUserIds([]);
        }
        await onRefreshMembers();
      } catch (error) {
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        let errorMessage: React.Node = null;
        if (extractedStatusAndCode) {
          if (extractedStatusAndCode.code === 'user-activation/team-full') {
            errorMessage = (
              <Trans>
                You don't have enough available seats to restore those accounts.
              </Trans>
            );
          } else if (
            extractedStatusAndCode.code ===
            'user-activation/user-deactivated-recently'
          ) {
            errorMessage = (
              <Trans>
                You have to wait
                {extractedStatusAndCode.data
                  ? extractedStatusAndCode.data.daysToWait
                  : 15}
                days before you can reactivate an archived account.
              </Trans>
            );
          } else if (
            extractedStatusAndCode.code ===
            'user-activation/member-outside-of-team'
          ) {
            errorMessage = (
              <Trans>
                You don't have enough rights to manage those accounts.
              </Trans>
            );
          }
        }
        if (!errorMessage) {
          errorMessage = (
            <>
              <Trans>An unknown error happened.</Trans>{' '}
              <Trans>
                Please check your internet connection or try again later.
              </Trans>
            </>
          );
        }
        setBatchControlError(errorMessage);
      } finally {
        if (activate) {
          setIsRestoringAccounts(false);
        } else {
          setIsArchivingAccounts(false);
        }
      }
    },
    [onActivateMembers, onRefreshMembers, selectedUserIds, showConfirmation]
  );

  const groupedMembers = groupMembersByGroupId({
    groups,
    members,
    memberships,
  });

  if (
    !admins ||
    !members ||
    !team ||
    !groups ||
    !memberships ||
    !groupedMembers
  ) {
    return null;
  }
  const {
    active: membersByGroupId,
    inactive: archivedMembers,
  } = groupedMembers;
  const groupsWithMembers = [
    membersByGroupId['NONE']
      ? { group: null, members: membersByGroupId['NONE'].members }
      : null,
    ...sortGroupsWithMembers(membersByGroupId),
  ].filter(Boolean);

  const activeMembers = members.filter(
    member => !member.deactivatedAt && member.isEmailAutogenerated
  );
  const areAllActiveMembersSelected = activeMembers.every(member =>
    selectedUserIds.includes(member.id)
  );
  const selectedMembers = members.filter(member =>
    selectedUserIds.includes(member.id)
  );
  const isAtLeastOneSelectedUserActive = selectedMembers.some(
    member => !member.deactivatedAt
  );
  const isAtLeastOneSelectedUserArchived = selectedMembers.some(
    member => !!member.deactivatedAt
  );
  const hasNoTeamMembers = members.length === 0;
  const hasNoActiveTeamMembers = activeMembers.length === 0;

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Dialog
            title={<Trans>Manage seats</Trans>}
            flexColumnBody
            fullHeight
            open
            onRequestClose={onClose}
          >
            {isLoading ? (
              <Column
                useFullHeight
                expand
                justifyContent="center"
                alignItems="center"
              >
                <CircularProgress />
              </Column>
            ) : (
              <ColumnStackLayout noMargin>
                {userSubscriptionPlanWithPricingSystems && (
                  <Paper background="light" style={styles.subscriptionPaper}>
                    <ResponsiveLineStackLayout
                      alignItems="center"
                      justifyContent="space-between"
                      noMargin
                    >
                      <LineStackLayout noMargin alignItems="center">
                        {getPlanIcon({
                          planId: userSubscriptionPlanWithPricingSystems.id,
                          logoSize: 20,
                        })}
                        <Text noMargin>
                          <b>
                            {selectMessageByLocale(
                              i18n,
                              userSubscriptionPlanWithPricingSystems.nameByLocale
                            ).toUpperCase()}
                          </b>
                        </Text>
                        <Chip label={team.seats} size="small" />
                        <Text noMargin color="secondary">
                          <Trans>Seats</Trans>
                        </Text>
                      </LineStackLayout>
                      <TextButton
                        secondary
                        label={<Trans>Manage subscription</Trans>}
                        onClick={() =>
                          openSubscriptionDialog({
                            analyticsMetadata: {
                              reason: 'Manage subscription as teacher',
                              recommendedPlanId: 'gdevelop_education',
                              placementId: 'education',
                            },
                          })
                        }
                      />
                    </ResponsiveLineStackLayout>
                  </Paper>
                )}
                {availableSeats === 0 && (
                  <AlertMessage
                    kind="info"
                    renderRightButton={() => (
                      <FlatButton
                        primary
                        label={<Trans>Increase seats</Trans>}
                        leftIcon={<Education fontSize="small" />}
                        onClick={onOpenPurchaseSeatsDialog}
                      />
                    )}
                  >
                    <Trans>
                      You’ve reached the maximum amount of available seats.
                      Increase the number of seats on your subscription to
                      invite more students and collaborators.
                    </Trans>
                  </AlertMessage>
                )}
                <Text size="sub-title" noMargin>
                  <Trans>Teacher accounts</Trans>
                </Text>
                <Column noMargin>
                  {admins &&
                    admins.map(adminUser => (
                      <UserLine
                        key={adminUser.id}
                        username={adminUser.username}
                        fullName={adminUser.fullName}
                        email={adminUser.email}
                        level={null}
                        onDelete={() => onRemoveAdmin(adminUser.email)}
                        disabled={
                          (profile && adminUser.id === profile.id) ||
                          (!!adminEmailBeingRemoved &&
                            adminEmailBeingRemoved === adminUser.email)
                        }
                      />
                    ))}
                </Column>
                {removeAdminError && (
                  <AlertMessage kind="error">
                    {removeErrorToText[removeAdminError]}
                  </AlertMessage>
                )}
                <Line noMargin>
                  <RaisedButton
                    primary
                    disabled={availableSeats !== null && availableSeats <= 0}
                    icon={<Add fontSize="small" />}
                    label={<Trans>Invite teacher</Trans>}
                    onClick={() => setAddTeacherDialogOpen(true)}
                  />
                </Line>
                <Divider />
                <ResponsiveLineStackLayout
                  noMargin
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <LineStackLayout noMargin alignItems="center">
                    <Text size="sub-title" noMargin>
                      <Trans>Student accounts</Trans>
                    </Text>
                    <IconButton
                      size="small"
                      tooltip={t`Refresh`}
                      onClick={onRefresh}
                      disabled={isRefreshing}
                    >
                      <Refresh fontSize="small" />
                    </IconButton>
                  </LineStackLayout>
                  <LineStackLayout noMargin alignItems="center">
                    <TeamAvailableSeats />
                    <Line expand noMargin justifyContent="flex-end">
                      {availableSeats !== null && availableSeats <= 0 ? (
                        <FlatButton
                          primary
                          label={<Trans>Purchase seats</Trans>}
                          leftIcon={<Education fontSize="small" />}
                          onClick={onOpenPurchaseSeatsDialog}
                        />
                      ) : (
                        <LineStackLayout noMargin alignItems="center">
                          <RaisedButton
                            primary
                            label={<Trans>Create students</Trans>}
                            icon={<Add fontSize="small" />}
                            onClick={() => setCreateStudentsDialogOpen(true)}
                          />
                          <Text noMargin color="secondary">
                            <Trans>or</Trans>
                          </Text>
                          <FlatButton
                            primary
                            leftIcon={<Add fontSize="small" />}
                            label={<Trans>Invite students</Trans>}
                            onClick={() => setInviteStudentDialogOpen(true)}
                          />
                        </LineStackLayout>
                      )}
                    </Line>
                  </LineStackLayout>
                </ResponsiveLineStackLayout>
                {hasNoTeamMembers && availableSeats !== null && (
                  <StudentCreationCard
                    availableSeats={availableSeats}
                    isCreatingMembers={isCreatingMembers}
                    onCreateStudentAccounts={onCreateTeamMembers}
                  />
                )}
                {invitations && invitations.length > 0 && (
                  <>
                    <Divider />
                    <Spacer />
                    <Text size="sub-title" noMargin>
                      <Trans>Pending invitations</Trans>
                    </Text>
                    <Column noMargin>
                      {invitations.map(invitation => {
                        return (
                          <Line
                            key={invitation.userId}
                            justifyContent="space-between"
                            alignItems="center"
                            noMargin
                          >
                            <LineStackLayout noMargin alignItems="center">
                              <Text
                                noMargin
                                size="body-small"
                                color="secondary"
                              >
                                {invitation.email}
                              </Text>
                              <Chip
                                label={<Trans>Pending</Trans>}
                                size="small"
                              />
                            </LineStackLayout>
                            <IconButton
                              size="small"
                              onClick={() =>
                                onRemoveInvitation(invitation.email)
                              }
                            >
                              <Trash fontSize="small" />
                            </IconButton>
                          </Line>
                        );
                      })}
                    </Column>
                  </>
                )}
                {(!hasNoTeamMembers || !hasNoActiveTeamMembers) && (
                  <ColumnStackLayout noMargin>
                    <Paper
                      style={
                        isMobile
                          ? styles.selectedMembersControlsContainerMobile
                          : styles.selectedMembersControlsContainer
                      }
                      background="light"
                    >
                      <ColumnStackLayout noMargin>
                        <Line
                          justifyContent="space-between"
                          noMargin
                          alignItems="center"
                        >
                          <LineStackLayout alignItems="center" noMargin>
                            <Checkbox
                              style={{ margin: 0 }}
                              checked={
                                areAllActiveMembersSelected &&
                                selectedUserIds.length > 0
                              }
                              onCheck={(e, checked) => {
                                if (checked) {
                                  setSelectedUserIds(
                                    members
                                      .filter(
                                        member =>
                                          !member.deactivatedAt &&
                                          member.isEmailAutogenerated
                                      )
                                      .map(member => member.id)
                                  );
                                } else {
                                  setSelectedUserIds([]);
                                }
                              }}
                              uncheckedIcon={<CheckboxUnchecked />}
                              checkedIcon={<CheckboxChecked />}
                            />
                            <Text noMargin>
                              <Trans>Select all active</Trans>
                            </Text>
                          </LineStackLayout>
                          <LineStackLayout noMargin alignItems="center">
                            <IconButton
                              size="small"
                              tooltip={t`Archive accounts`}
                              disabled={
                                selectedUserIds.length === 0 ||
                                isAtLeastOneSelectedUserArchived ||
                                isArchivingAccounts
                              }
                              onClick={() => onActivateTeamMembers(false)}
                            >
                              {isArchivingAccounts ? (
                                <CircularProgress size={22} />
                              ) : (
                                <Archive />
                              )}
                            </IconButton>
                            <IconButton
                              size="small"
                              tooltip={t`Restore accounts`}
                              disabled={
                                selectedUserIds.length === 0 ||
                                isAtLeastOneSelectedUserActive ||
                                isRestoringAccounts
                              }
                              onClick={() => onActivateTeamMembers(true)}
                            >
                              {isRestoringAccounts ? (
                                <CircularProgress size={22} />
                              ) : (
                                <Recycle />
                              )}
                            </IconButton>
                            <IconButton
                              size="small"
                              tooltip={
                                selectedUserIds.length === 0
                                  ? t`Copy active credentials to CSV`
                                  : t`Copy ${
                                      selectedUserIds.length
                                    } credentials to CSV`
                              }
                              disabled={
                                hasNoActiveTeamMembers &&
                                selectedUserIds.length === 0
                              }
                              onClick={onCopyActiveCredentials}
                            >
                              {credentialsCopySuccess ? <Check /> : <Copy />}
                            </IconButton>
                          </LineStackLayout>
                        </Line>
                        {batchControlError && (
                          <AlertMessage kind="error">
                            {batchControlError}
                          </AlertMessage>
                        )}
                      </ColumnStackLayout>
                    </Paper>
                    <Column>
                      {!isMobile && (
                        <GridList cols={2} cellHeight={'auto'}>
                          <Grid item xs={9}>
                            <Text style={{ opacity: 0.7 }}>
                              <Trans>Student</Trans>
                            </Text>
                          </Grid>
                          <Grid item xs={3}>
                            <Text style={{ opacity: 0.7 }}>
                              <Trans>Password</Trans>
                            </Text>
                          </Grid>
                        </GridList>
                      )}
                      {groupsWithMembers.map(({ group, members }, index) => {
                        return (
                          <React.Fragment key={group ? group.id : 'lobby'}>
                            {index > 0 && <Spacer />}
                            <Line noMargin>
                              <Text size="sub-title">
                                {group ? (
                                  <Trans>Room: {group.name}</Trans>
                                ) : (
                                  <Trans>Lobby</Trans>
                                )}
                              </Text>
                            </Line>
                            <Column>
                              <GridList
                                cols={isMobile ? 3 : 2}
                                cellHeight={'auto'}
                              >
                                {members.map(member => {
                                  return (
                                    <ManageStudentRow
                                      member={member}
                                      key={member.id}
                                      onChangePassword={
                                        onChangeTeamMemberPassword
                                      }
                                      onEdit={onEditTeamMember}
                                      onRemove={
                                        member.isEmailAutogenerated
                                          ? undefined
                                          : () =>
                                              onRemoveInvitedMember(
                                                member.email
                                              )
                                      }
                                      isSelected={selectedUserIds.includes(
                                        member.id
                                      )}
                                      onSelect={selected => {
                                        const memberIndexInArray = selectedUserIds.indexOf(
                                          member.id
                                        );
                                        if (selected) {
                                          if (memberIndexInArray === -1) {
                                            setSelectedUserIds([
                                              ...selectedUserIds,
                                              member.id,
                                            ]);
                                          }
                                          return;
                                        } else {
                                          const newArray = [...selectedUserIds];
                                          if (memberIndexInArray >= 0) {
                                            newArray.splice(
                                              memberIndexInArray,
                                              1
                                            );
                                            setSelectedUserIds(newArray);
                                          }
                                        }
                                      }}
                                    />
                                  );
                                })}
                              </GridList>
                            </Column>
                          </React.Fragment>
                        );
                      })}
                      {archivedMembers.length > 0 && (
                        <React.Fragment key={'archived'}>
                          <Spacer />
                          <Line noMargin>
                            {isArchivedAccountsSectionOpen ? (
                              <IconButton
                                size="small"
                                edge="end"
                                aria-label="collapse"
                                onClick={() =>
                                  setIsArchivedAccountsSectionOpen(false)
                                }
                              >
                                <ChevronArrowBottom />
                              </IconButton>
                            ) : (
                              <IconButton
                                size="small"
                                edge="end"
                                aria-label="expand"
                                onClick={() =>
                                  setIsArchivedAccountsSectionOpen(true)
                                }
                              >
                                <ChevronArrowRight />
                              </IconButton>
                            )}
                            <Text size="sub-title">
                              <Trans>Archived accounts</Trans>
                            </Text>
                          </Line>
                          <Column>
                            <Collapse
                              in={isArchivedAccountsSectionOpen}
                              timeout="auto"
                              unmountOnExit
                            >
                              <GridList cols={2} cellHeight={'auto'}>
                                {archivedMembers.map(member => {
                                  return (
                                    <ManageStudentRow
                                      member={member}
                                      key={member.id}
                                      isArchived
                                      onChangePassword={
                                        onChangeTeamMemberPassword
                                      }
                                      onEdit={onEditTeamMember}
                                      onRemove={
                                        member.isEmailAutogenerated
                                          ? undefined
                                          : () =>
                                              onRemoveInvitedMember(
                                                member.email
                                              )
                                      }
                                      isSelected={selectedUserIds.includes(
                                        member.id
                                      )}
                                      onSelect={selected => {
                                        const memberIndexInArray = selectedUserIds.indexOf(
                                          member.id
                                        );
                                        if (selected) {
                                          if (memberIndexInArray === -1) {
                                            setSelectedUserIds([
                                              ...selectedUserIds,
                                              member.id,
                                            ]);
                                          }
                                          return;
                                        } else {
                                          const newArray = [...selectedUserIds];
                                          if (memberIndexInArray >= 0) {
                                            newArray.splice(
                                              memberIndexInArray,
                                              1
                                            );
                                            setSelectedUserIds(newArray);
                                          }
                                        }
                                      }}
                                    />
                                  );
                                })}
                              </GridList>
                            </Collapse>
                          </Column>
                        </React.Fragment>
                      )}
                    </Column>
                  </ColumnStackLayout>
                )}
              </ColumnStackLayout>
            )}
          </Dialog>
          {addTeacherDialogOpen && (
            <AddTeacherDialog
              onClose={() => setAddTeacherDialogOpen(false)}
              onAddTeacher={onSetUserAsAdmin}
            />
          )}
          {createStudentsDialogOpen && availableSeats !== null && (
            <CreateStudentsDialog
              onClose={() => setCreateStudentsDialogOpen(false)}
              onCreateStudentAccounts={onCreateTeamMembers}
              availableSeats={availableSeats}
              isCreatingMembers={isCreatingMembers}
            />
          )}
          {inviteStudentDialogOpen && (
            <InviteStudentDialog
              onClose={() => setInviteStudentDialogOpen(false)}
              onInviteStudent={onInviteTeamMember}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default ManageEducationAccountDialog;
