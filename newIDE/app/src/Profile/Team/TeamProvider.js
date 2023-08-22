// @flow

import * as React from 'react';
import TeamContext from './TeamContext';
import {
  listTeamGroups,
  listTeamMembers,
  listTeamMemberships,
  listUserTeams,
  type Team,
  type TeamGroup,
  type TeamMembership,
  type User,
} from '../../Utils/GDevelopServices/User';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';

type Props = {| children: React.Node |};

const TeamProvider = ({ children }: Props) => {
  const { profile, getAuthorizationHeader } = React.useContext(
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

  React.useEffect(
    () => {
      const fetchMembers = async () => {
        if (!team || !profile) return;

        const teamMembers = await listTeamMembers(
          getAuthorizationHeader,
          profile.id,
          team.id
        );
        setMembers(teamMembers);
      };
      fetchMembers();
    },
    [team, getAuthorizationHeader, profile]
  );

  React.useEffect(
    () => {
      const fetchMemberships = async () => {
        if (!team || !profile) return;

        const teamMemberships = await listTeamMemberships(
          getAuthorizationHeader,
          profile.id,
          team.id
        );
        setMemberships(teamMemberships);
      };
      fetchMemberships();
    },
    [team, getAuthorizationHeader, profile]
  );

  const onChangeGroupName = async () => {};
  const onChangeUserGroup = async () => {};
  const onListUserProjects = async () => [];

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
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export default TeamProvider;
