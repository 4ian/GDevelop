// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import List from '@material-ui/core/List';
import { Line, Column } from '../../../../UI/Grid';

import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../../../../ProjectsStorage';
import SectionContainer, { SectionRow } from '../SectionContainer';
import CircularProgress from '../../../../UI/CircularProgress';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import {
  type TeamGroup,
  type TeamMembership,
  type User,
} from '../../../../Utils/GDevelopServices/User';
import { type CloudProjectWithUserAccessInfo } from '../../../../Utils/GDevelopServices/Project';
import TeamContext from '../../../../Profile/Team/TeamContext';
import TeamGroupNameField from './TeamGroupNameField';
import TeamMemberRow from './TeamMemberRow';

const sortMembersByNameOrEmail = (a: User, b: User) => {
  return (a.username || a.email).localeCompare(b.username || b.email);
};

type GroupWithMembers = {| group: TeamGroup, members: User[] |};

type Props = {|
  project: ?gdProject,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  storageProviders: Array<StorageProvider>,
|};

export type TeamSectionInterface = {|
  forceUpdate: () => void,
|};

const groupMembersByGroupId = ({
  groups,
  members,
  memberships,
}: {
  groups: ?(TeamGroup[]),
  members: ?(User[]),
  memberships: ?(TeamMembership[]),
}): ?{ [groupId: string]: GroupWithMembers } => {
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
  return membersByGroupId;
};

const TeamSection = React.forwardRef<Props, TeamSectionInterface>(
  ({ project, onOpenRecentFile, storageProviders }, ref) => {
    const {
      groups,
      members,
      memberships,
      onChangeGroupName,
      onListUserProjects,
    } = React.useContext(TeamContext);
    const forceUpdate = useForceUpdate();

    React.useImperativeHandle(ref, () => ({
      forceUpdate,
    }));

    const [selectedUser, setSelectedUser] = React.useState<?User>(null);
    const [
      selectedUserProjects,
      setSelectedUserProjects,
    ] = React.useState<?Array<CloudProjectWithUserAccessInfo>>(null);
    const [
      isLoadingUserProjects,
      setIsLoadingUserProjects,
    ] = React.useState<boolean>(false);

    const listUserProjects = React.useCallback(
      async (user: User) => {
        setIsLoadingUserProjects(true);
        try {
          setSelectedUser(user);
          const userProjects = await onListUserProjects(user);
          setSelectedUserProjects(userProjects);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoadingUserProjects(false);
        }
      },
      [onListUserProjects]
    );

    const membersByGroupId = groupMembersByGroupId({
      groups,
      members,
      memberships,
    });
    if (!membersByGroupId) {
      return (
        <>
          <SectionContainer title={<Trans>Team</Trans>}>
            <SectionRow>
              <Line>
                <Column noMargin expand alignItems="center">
                  <CircularProgress />
                </Column>
              </Line>
            </SectionRow>
          </SectionContainer>
        </>
      );
    }

    const membersNotInAGroup = membersByGroupId['NONE'];
    const groupsAndMembers = Object.keys(membersByGroupId)
      .map(id => (id === 'NONE' ? null : membersByGroupId[id]))
      .filter(Boolean)
      .sort((a, b) => a.group.name.localeCompare(b.group.name));

    return (
      <>
        <SectionContainer title={<Trans>Team</Trans>}>
          <SectionRow>
            <Line>
              <Column noMargin expand>
                {membersNotInAGroup && (
                  <List>
                    {membersNotInAGroup.members
                      .sort(sortMembersByNameOrEmail)
                      .map(member => (
                        <TeamMemberRow
                          member={member}
                          onListUserProjects={() => listUserProjects(member)}
                          disabled={isLoadingUserProjects}
                          isLoading={
                            isLoadingUserProjects &&
                            !!selectedUser &&
                            member.id === selectedUser.id
                          }
                        />
                      ))}
                  </List>
                )}
              </Column>
            </Line>
            {groupsAndMembers.length > 0 &&
              groupsAndMembers.map(({ group, members }) => (
                <Line>
                  <Column noMargin expand>
                    <TeamGroupNameField
                      group={group}
                      onFinishEditingGroupName={onChangeGroupName}
                    />
                    <List>
                      {members.sort(sortMembersByNameOrEmail).map(member => (
                        <TeamMemberRow
                          member={member}
                          onListUserProjects={() => listUserProjects(member)}
                          disabled={isLoadingUserProjects}
                          isLoading={
                            isLoadingUserProjects &&
                            !!selectedUser &&
                            member.id === selectedUser.id
                          }
                        />
                      ))}
                    </List>
                  </Column>
                </Line>
              ))}
          </SectionRow>
        </SectionContainer>
      </>
    );
  }
);

export default TeamSection;
