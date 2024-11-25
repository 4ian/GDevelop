// @flow

import * as React from 'react';
import TeamContext from './TeamContext';
import {
  listTeamGroups,
  listTeamMembers,
  listTeamMemberships,
  listUserTeams,
  updateGroup,
  type Team,
  type TeamGroup,
  type TeamMembership,
  type User,
  updateUserGroup,
  deleteGroup,
  createGroup,
  listTeamAdmins,
  createTeamMembers,
  changeTeamMemberPassword,
  activateTeamMembers,
  setUserAsAdmin,
} from '../../Utils/GDevelopServices/User';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { listOtherUserCloudProjects } from '../../Utils/GDevelopServices/Project';
import { showErrorBox } from '../../UI/Messages/MessageBox';

type Props = {| children: React.Node |};

const TeamProvider = ({ children }: Props) => {
  const {
    limits,
    profile,
    getAuthorizationHeader,
    authenticated,
  } = React.useContext(AuthenticatedUserContext);
  const [groups, setGroups] = React.useState<?(TeamGroup[])>(null);
  const [team, setTeam] = React.useState<?Team>(null);
  const [members, setMembers] = React.useState<?(User[])>(null);
  const [admins, setAdmins] = React.useState<?(User[])>(null);
  const [memberships, setMemberships] = React.useState<?(TeamMembership[])>(
    null
  );

  const adminUserId = React.useMemo(() => (profile ? profile.id : null), [
    profile,
  ]);

  React.useEffect(
    () => {
      if (!authenticated) {
        setTeam(null);
        setGroups(null);
        setMembers(null);
        setMemberships(null);
      }
    },
    [authenticated]
  );

  React.useEffect(
    () => {
      const fetchTeam = async () => {
        if (
          !adminUserId ||
          !// This boolean could be memoized but it is useful to refresh
          // team data when limits are updated (for example when the Profile
          // dialog is open).
          (
            limits &&
            limits.capabilities.classrooms &&
            limits.capabilities.classrooms.showClassroomTab
          )
        )
          return;
        const teams = await listUserTeams(getAuthorizationHeader, adminUserId);
        // Being admin of multiple teams is not supported at the moment.
        setTeam(teams[0]);
      };
      fetchTeam();
    },
    [getAuthorizationHeader, adminUserId, limits]
  );

  React.useEffect(
    () => {
      const fetchGroups = async () => {
        if (!team || !adminUserId) return;

        const teamGroups = await listTeamGroups(
          getAuthorizationHeader,
          adminUserId,
          team.id
        );
        setGroups(teamGroups);
      };
      fetchGroups();
    },
    [team, getAuthorizationHeader, adminUserId]
  );

  const fetchMembers = React.useCallback(
    async () => {
      if (!team || !adminUserId) return;

      const teamMembers = await listTeamMembers(
        getAuthorizationHeader,
        adminUserId,
        team.id
      );
      setMembers(teamMembers);
      const teamAdmins = await listTeamAdmins(
        getAuthorizationHeader,
        adminUserId,
        team.id
      );
      setAdmins(teamAdmins);
    },
    [team, getAuthorizationHeader, adminUserId]
  );

  const onCreateMembers = React.useCallback(
    async quantity => {
      if (!team || !adminUserId) return;
      try {
        await createTeamMembers(getAuthorizationHeader, {
          teamId: team.id,
          quantity,
          adminUserId,
        });
      } catch (error) {
        console.error('An error occurred while creating team members:', error);
        showErrorBox({
          rawError: error,
          message:
            'There was an error while creating students in your plan. You can report it at education@gdevelop.io or try again later.',
          errorId: 'student-creation-error',
        });
      }
    },
    [team, getAuthorizationHeader, adminUserId]
  );

  const onChangeMemberPassword = React.useCallback(
    async (userId: string, newPassword: string) => {
      if (!adminUserId) return;
      try {
        await changeTeamMemberPassword(getAuthorizationHeader, {
          adminUserId,
          userId,
          newPassword,
        });
      } catch (error) {
        console.error('An error occurred while changing password:', error);
      }
    },
    [getAuthorizationHeader, adminUserId]
  );

  const onActivateMembers = React.useCallback(
    async (userIds: string[], activate: boolean) => {
      if (!adminUserId || !team || userIds.length === 0) return;

      await activateTeamMembers(getAuthorizationHeader, {
        adminUserId,
        userIds,
        teamId: team.id,
        activate,
      });
    },
    [getAuthorizationHeader, adminUserId, team]
  );

  React.useEffect(
    () => {
      fetchMembers();
    },
    [fetchMembers]
  );

  const fetchMemberships = React.useCallback(
    async () => {
      if (!team || !adminUserId) return;

      const teamMemberships = await listTeamMemberships(
        getAuthorizationHeader,
        adminUserId,
        team.id
      );
      setMemberships(teamMemberships);
    },
    [team, getAuthorizationHeader, adminUserId]
  );

  React.useEffect(
    () => {
      fetchMemberships();
    },
    [fetchMemberships]
  );

  const onChangeGroupName = React.useCallback(
    async (group: TeamGroup, newName: string) => {
      if (!team || !adminUserId || !groups) return;
      const updatedGroup = await updateGroup(
        getAuthorizationHeader,
        adminUserId,
        team.id,
        group.id,
        { name: newName }
      );
      const updatedGroupIndex = groups.findIndex(
        group_ => group_.id === group.id
      );
      if (updatedGroupIndex !== -1) {
        const newGroups = [...groups];
        newGroups[updatedGroupIndex] = updatedGroup;
        setGroups(newGroups);
      }
    },
    [team, getAuthorizationHeader, adminUserId, groups]
  );

  const onChangeUserGroup = React.useCallback(
    async (user: User, group: TeamGroup) => {
      if (!team || !adminUserId || !memberships) return;
      try {
        const membershipIndex = memberships.findIndex(
          membership => membership.userId === user.id
        );
        if (
          memberships[membershipIndex].groups &&
          memberships[membershipIndex].groups[0] === group.id
        ) {
          return;
        }
        await updateUserGroup(
          getAuthorizationHeader,
          adminUserId,
          team.id,
          group.id,
          user.id
        );
        if (membershipIndex !== -1) {
          const newMemberships = [...memberships];
          newMemberships[membershipIndex] = {
            ...memberships[membershipIndex],
            groups: [group.id],
          };
          setMemberships(newMemberships);
        }
      } catch (error) {
        console.error('An error occurred while update user group:', error);
      }
    },
    [team, getAuthorizationHeader, adminUserId, memberships]
  );

  const onListUserProjects = React.useCallback(
    async (user: User) => {
      if (!adminUserId) return [];
      return listOtherUserCloudProjects(
        getAuthorizationHeader,
        adminUserId,
        user.id
      );
    },
    [getAuthorizationHeader, adminUserId]
  );

  const onSetAdmin = React.useCallback(
    async (email: string, activate: boolean) => {
      if (!team || !adminUserId) return;
      await setUserAsAdmin(getAuthorizationHeader, {
        teamId: team.id,
        email,
        activate,
        adminUserId,
      });
    },
    [team, getAuthorizationHeader, adminUserId]
  );

  const onDeleteGroup = React.useCallback(
    async (group: TeamGroup) => {
      if (!adminUserId || !team) return;
      await deleteGroup(getAuthorizationHeader, adminUserId, team.id, group.id);
      setGroups(groups =>
        groups ? groups.filter(group_ => group_.id !== group.id) : null
      );
    },
    [team, getAuthorizationHeader, adminUserId]
  );

  const onCreateGroup = React.useCallback(
    async (attributes: {| name: string |}) => {
      if (!adminUserId || !team) return;
      const newGroup = await createGroup(
        getAuthorizationHeader,
        adminUserId,
        team.id,
        attributes
      );
      setGroups(groups ? [...groups, newGroup] : null);
    },
    [team, getAuthorizationHeader, adminUserId, groups]
  );

  const onRefreshMembers = React.useCallback(
    async () => {
      await Promise.all([fetchMembers(), fetchMemberships()]);
    },
    [fetchMembers, fetchMemberships]
  );

  const onRefreshAdmins = React.useCallback(
    async () => {
      if (!adminUserId || !team) return;
      const teamAdmins = await listTeamAdmins(
        getAuthorizationHeader,
        adminUserId,
        team.id
      );
      setAdmins(teamAdmins);
    },
    [team, getAuthorizationHeader, adminUserId]
  );

  const getAvailableSeats = React.useCallback(
    () =>
      team && members && admins
        ? team.seats -
          members.filter(member => !member.deactivatedAt).length -
          admins.length
        : null,
    [team, members, admins]
  );

  return (
    <TeamContext.Provider
      value={{
        team,
        groups,
        admins,
        members,
        memberships,
        onChangeGroupName,
        onChangeUserGroup,
        onListUserProjects,
        onDeleteGroup,
        onCreateGroup,
        onRefreshMembers,
        onRefreshAdmins,
        getAvailableSeats,
        onCreateMembers,
        onChangeMemberPassword,
        onActivateMembers,
        onSetAdmin,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export default TeamProvider;
