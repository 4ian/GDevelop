// @flow
import * as React from 'react';
import {
  type Team,
  type TeamGroup,
  type User,
  type TeamMembership,
} from '../../Utils/GDevelopServices/User';

export type TeamState = {|
  team: ?Team,
  groups: ?Array<TeamGroup>,
  members: ?Array<User>,
  memberships: ?Array<TeamMembership>,
|};

export const initialTeamState = {
  team: null,
  groups: null,
  members: null,
  memberships: null,
};

const TeamContext = React.createContext<TeamState>(initialTeamState);

export default TeamContext;
