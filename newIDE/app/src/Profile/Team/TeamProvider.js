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
} from '../../Utils/GDevelopServices/User';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { listOtherUserCloudProjects } from '../../Utils/GDevelopServices/Project';

type Props = {| children: React.Node |};

const TeamProvider = ({ children }: Props) => {
  const { profile, getAuthorizationHeader, authenticated } = React.useContext(
    AuthenticatedUserContext
  );
  const [groups, setGroups] = React.useState<?(TeamGroup[])>(null);
  const [team, setTeam] = React.useState<?Team>(null);
  const [members, setMembers] = React.useState<?(User[])>(null);
  const [memberships, setMemberships] = React.useState<?(TeamMembership[])>(
    null
  );

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
        if (!profile || !profile.isTeacher) return;
        const teams = await listUserTeams(getAuthorizationHeader, profile.id);
        // Being admin of multiple teams is not supported at the moment.
        setTeam(teams[0]);
      };
      fetchTeam();
    },
    [getAuthorizationHeader, profile]
  );

  React.useEffect(
    () => {
      const fetchGroups = async () => {
        if (!team || !profile) return;

        const teamGroups = await listTeamGroups(
          getAuthorizationHeader,
          profile.id,
          team.id
        );
        setGroups(teamGroups);
      };
      fetchGroups();
    },
    [team, getAuthorizationHeader, profile]
  );

  const fetchMembers = React.useCallback(
    async () => {
      if (!team || !profile) return;

      const teamMembers = await listTeamMembers(
        getAuthorizationHeader,
        profile.id,
        team.id
      );
      setMembers(teamMembers);
    },
    [team, getAuthorizationHeader, profile]
  );

  React.useEffect(
    () => {
      fetchMembers();
    },
    [fetchMembers]
  );

  const fetchMemberships = React.useCallback(
    async () => {
      if (!team || !profile) return;

      const teamMemberships = await listTeamMemberships(
        getAuthorizationHeader,
        profile.id,
        team.id
      );
      setMemberships(teamMemberships);
    },
    [team, getAuthorizationHeader, profile]
  );

  React.useEffect(
    () => {
      fetchMemberships();
    },
    [fetchMemberships]
  );

  const onChangeGroupName = React.useCallback(
    async (group: TeamGroup, newName: string) => {
      if (!team || !profile || !groups) return;
      const updatedGroup = await updateGroup(
        getAuthorizationHeader,
        profile.id,
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
    [team, getAuthorizationHeader, profile, groups]
  );

  const onChangeUserGroup = React.useCallback(
    async (user: User, group: TeamGroup) => {
      if (!team || !profile || !memberships) return;
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
          profile.id,
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
    [team, getAuthorizationHeader, profile, memberships]
  );

  const onListUserProjects = React.useCallback(
    async (user: User) => {
      if (!profile) return [];
      return listOtherUserCloudProjects(
        getAuthorizationHeader,
        profile.id,
        user.id
      );
    },
    [getAuthorizationHeader, profile]
  );

  const onDeleteGroup = React.useCallback(
    async (group: TeamGroup) => {
      if (!profile || !team) return;
      await deleteGroup(getAuthorizationHeader, profile.id, team.id, group.id);
      setGroups(groups =>
        groups ? groups.filter(group_ => group_.id !== group.id) : null
      );
    },
    [team, getAuthorizationHeader, profile]
  );

  const onCreateGroup = React.useCallback(
    async (attributes: {| name: string |}) => {
      if (!profile || !team) return;
      const newGroup = await createGroup(
        getAuthorizationHeader,
        profile.id,
        team.id,
        attributes
      );
      setGroups(groups ? [...groups, newGroup] : null);
    },
    [team, getAuthorizationHeader, profile, groups]
  );

  const onRefreshMembers = React.useCallback(
    async () => {
      await Promise.all([fetchMembers(), fetchMemberships()]);
    },
    [fetchMembers, fetchMemberships]
  );

  return (
    <TeamContext.Provider
      value={{
        team,
        groups,
        members,
        memberships,
        onChangeGroupName,
        onChangeUserGroup,
        onListUserProjects,
        onDeleteGroup,
        onCreateGroup,
        onRefreshMembers,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export default TeamProvider;
