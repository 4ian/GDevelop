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
|}): ?{ [groupId: string]: GroupWithMembers } => {
  if (!(groups && members && memberships)) return null;
  const membersByGroupId = {};
  members.forEach(member => {
    const membership = memberships.find(
      membership => membership.userId === member.id
    );
    if (!membership) return;
    const memberGroups = membership.groups;
    if (!memberGroups) {
      const itemWithoutGroup = membersByGroupId['NONE'];
      membersByGroupId['NONE'] = {
        members: [
          ...((itemWithoutGroup && itemWithoutGroup.members) || []),
          member,
        ],
        group: { id: 'none', name: 'none' },
      };
      return;
    }
    const group = groups.find(group => group.id === memberGroups[0]);
    if (!group) return;
    const item = membersByGroupId[group.id];
    if (item) {
      item.members = [...item.members, member];
    } else {
      membersByGroupId[group.id] = { group, members: [member] };
    }
  });
  groups.forEach(group => {
    if (!(group.id in membersByGroupId)) {
      membersByGroupId[group.id] = { group, members: [] };
    }
  });
  return membersByGroupId;
};
