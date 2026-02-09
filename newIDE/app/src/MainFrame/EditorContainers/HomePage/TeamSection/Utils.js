// @flow
import {
  type TeamGroup,
  type TeamMembership,
  type User,
} from '../../../../Utils/GDevelopServices/User';

type GroupWithMembers = {| group: TeamGroup, members: User[] |};

export const groupMembersByGroupId = ({
  groups,
  members,
  memberships,
}: {|
  groups: ?(TeamGroup[]),
  members: ?(User[]),
  memberships: ?(TeamMembership[]),
|}): ?{|
  active: { [groupId: string]: GroupWithMembers },
  inactive: User[],
|} => {
  if (!(groups && members && memberships)) return null;
  const membersByGroupId = {
    NONE: { group: { id: 'none', name: 'none' }, members: [] },
  };
  const deactivatedMembers = [];
  members.forEach(member => {
    const membership = memberships.find(
      membership => membership.userId === member.id
    );
    if (!membership) return;
    if (member.deactivatedAt) {
      deactivatedMembers.push(member);
      return;
    }
    const memberGroups = membership.groups;
    if (!memberGroups) {
      const itemWithoutGroup = membersByGroupId['NONE'];
      membersByGroupId['NONE'] = {
        members: [
          ...((itemWithoutGroup && itemWithoutGroup.members) || []),
          // $FlowFixMe[incompatible-type]
          member,
        ],
        group: { id: 'none', name: 'none' },
      };
      return;
    }
    const group = groups.find(group => group.id === memberGroups[0]);
    if (!group) return;
    // $FlowFixMe[invalid-computed-prop]
    const item = membersByGroupId[group.id];
    if (item) {
      item.members = [...item.members, member];
    } else {
      // $FlowFixMe[prop-missing]
      membersByGroupId[group.id] = { group, members: [member] };
    }
  });
  groups.forEach(group => {
    if (!(group.id in membersByGroupId)) {
      // $FlowFixMe[prop-missing]
      membersByGroupId[group.id] = { group, members: [] };
    }
  });
  // $FlowFixMe[incompatible-type]
  return { active: membersByGroupId, inactive: deactivatedMembers };
};

export const sortGroupsWithMembers = (groupWithMembersByGroupId: {
  [groupId: string]: GroupWithMembers,
}): GroupWithMembers[] =>
  Object.keys(groupWithMembersByGroupId)
    .map(id => (id === 'NONE' ? null : groupWithMembersByGroupId[id]))
    .filter(Boolean)
    .sort((a, b) => a.group.name.localeCompare(b.group.name));
