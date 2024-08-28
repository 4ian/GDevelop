// @flow
import * as React from 'react';
import {
  type Team,
  type TeamGroup,
  type User,
  type TeamMembership,
} from '../../Utils/GDevelopServices/User';
import { type CloudProjectWithUserAccessInfo } from '../../Utils/GDevelopServices/Project';

export type TeamState = {|
  team: ?Team,
  groups: ?Array<TeamGroup>,
  members: ?Array<User>,
  admins: ?Array<User>,
  memberships: ?Array<TeamMembership>,
  onChangeGroupName: (group: TeamGroup, newName: string) => Promise<void>,
  onChangeUserGroup: (user: User, group: TeamGroup) => Promise<void>,
  onListUserProjects: (
    user: User
  ) => Promise<Array<CloudProjectWithUserAccessInfo>>,
  onDeleteGroup: (group: TeamGroup) => Promise<void>,
  onCreateGroup: (attributes: {| name: string |}) => Promise<void>,
  onRefreshMembers: () => Promise<void>,
  onRefreshAdmins: () => Promise<void>,
  getAvailableSeats: () => number | null,
  onCreateMembers: (quantity: number) => Promise<void>,
  onActivateMembers: (userIds: string[], activate: boolean) => Promise<void>,
  onSetAdmin: (email: string, activate: boolean) => Promise<void>,
  onChangeMemberPassword: (
    userId: string,
    newPassword: string
  ) => Promise<void>,
|};

export const initialTeamState = {
  team: null,
  groups: null,
  members: null,
  admins: null,
  memberships: null,
  onChangeGroupName: async () => {},
  onChangeUserGroup: async () => {},
  onListUserProjects: async () => [],
  onDeleteGroup: async () => {},
  onCreateGroup: async () => {},
  onRefreshMembers: async () => {},
  getAvailableSeats: () => null,
  onCreateMembers: async () => {},
  onActivateMembers: async () => {},
  onRefreshAdmins: async () => {},
  onSetAdmin: async () => {},
  onChangeMemberPassword: async () => {},
};

const TeamContext = React.createContext<TeamState>(initialTeamState);

export default TeamContext;
