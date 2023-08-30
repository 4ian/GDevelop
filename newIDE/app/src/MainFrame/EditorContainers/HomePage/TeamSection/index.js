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
import NewTeamGroupNameField from './NewTeamGroupNameField';
import TeamMemberRow from './TeamMemberRow';
import { makeDropTarget } from '../../../../UI/DragAndDrop/DropTarget';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import {
  ProjectFileListItem,
  transformCloudProjectsIntoFileMetadataWithStorageProviderName,
} from '../BuildSection';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import EmptyMessage from '../../../../UI/EmptyMessage';
import AlertMessage from '../../../../UI/AlertMessage';
import Text from '../../../../UI/Text';
import FlatButton from '../../../../UI/FlatButton';
import Add from '../../../../UI/CustomSvgIcons/Add';

const sortMembersByNameOrEmail = (a: User, b: User) => {
  return (a.username || a.email).localeCompare(b.username || b.email);
};

const DropTarget = makeDropTarget('team-groups');

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
  groups.forEach(group => {
    if (!(group.id in membersByGroupId)) {
      membersByGroupId[group.id] = { group, members: [] };
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
      onChangeUserGroup,
      onListUserProjects,
      onDeleteGroup,
      onCreateGroup,
    } = React.useContext(TeamContext);
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const forceUpdate = useForceUpdate();
    const windowWidth = useResponsiveWindowWidth();
    const isMobile = windowWidth === 'small';

    React.useImperativeHandle(ref, () => ({
      forceUpdate,
    }));

    const draggedUserRef = React.useRef<?User>(null);
    const [selectedUser, setSelectedUser] = React.useState<?User>(null);
    const [
      selectedUserProjects,
      setSelectedUserProjects,
    ] = React.useState<?Array<CloudProjectWithUserAccessInfo>>(null);
    const [
      isLoadingUserProjects,
      setIsLoadingUserProjects,
    ] = React.useState<boolean>(false);
    const [
      showNewGroupNameField,
      setShowNewGroupNameField,
    ] = React.useState<boolean>(false);

    const setDraggedUser = React.useCallback((user: User) => {
      draggedUserRef.current = user;
    }, []);

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

    if (selectedUser && selectedUserProjects) {
      const fileMetadataAndStorageProviderNames = transformCloudProjectsIntoFileMetadataWithStorageProviderName(
        selectedUserProjects,
        selectedUser.id
      );
      return (
        <SectionContainer
          title={
            <Trans>
              {selectedUser.username || selectedUser.email}'s projects
            </Trans>
          }
          backAction={() => {
            setSelectedUser(null);
            setSelectedUserProjects(null);
          }}
        >
          <SectionRow>
            <Line>
              <Column noMargin expand>
                {fileMetadataAndStorageProviderNames.length === 0 ? (
                  <>
                    <EmptyMessage>
                      <Trans>This user does not have projects yet.</Trans>
                    </EmptyMessage>
                    <AlertMessage kind="info">
                      <Trans>
                        Here are displayed their cloud projects only, they might
                        need to save their local projects as cloud projects for
                        you to see them.
                      </Trans>
                    </AlertMessage>
                  </>
                ) : (
                  <List>
                    {fileMetadataAndStorageProviderNames.map(file => (
                      <ProjectFileListItem
                        file={file}
                        key={file.fileMetadata.fileIdentifier}
                        onOpenRecentFile={onOpenRecentFile}
                        storageProviders={storageProviders}
                        isWindowWidthMediumOrLarger={!isMobile}
                        hideDeleteContextMenuAction={true}
                      />
                    ))}
                  </List>
                )}
              </Column>
            </Line>
          </SectionRow>
        </SectionContainer>
      );
    }

    const membersNotInAGroup = membersByGroupId['NONE'];
    const groupsAndMembers = Object.keys(membersByGroupId)
      .map(id => (id === 'NONE' ? null : membersByGroupId[id]))
      .filter(Boolean)
      .sort((a, b) => a.group.name.localeCompare(b.group.name));

    return (
      <SectionContainer title={<Trans>Classrooms</Trans>}>
        <SectionRow>
          {membersNotInAGroup && (
            <Line>
              <Column noMargin expand>
                <Text size="section-title" noMargin>
                  <Trans>Unassigned members</Trans>
                </Text>
                <List>
                  {membersNotInAGroup.members
                    .sort(sortMembersByNameOrEmail)
                    .map(member => (
                      <TeamMemberRow
                        key={member.id}
                        member={member}
                        onListUserProjects={() => listUserProjects(member)}
                        disabled={isLoadingUserProjects}
                        onDrag={setDraggedUser}
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
          )}
          <Line justifyContent="space-between" alignItems="center">
            <Text size="section-title" noMargin>
              <Trans>Rooms</Trans>
            </Text>
            <FlatButton
              primary
              label={<Trans>Create a new room</Trans>}
              leftIcon={<Add fontSize="small" />}
              onClick={() => setShowNewGroupNameField(true)}
            />
          </Line>
          {showNewGroupNameField && (
            <Line>
              <NewTeamGroupNameField
                onValidateGroupName={onCreateGroup}
                onDismiss={() => setShowNewGroupNameField(false)}
              />
            </Line>
          )}
          {groupsAndMembers.length > 0 ? (
            groupsAndMembers.map(({ group, members }) => (
              <DropTarget
                canDrop={() => true}
                drop={() => {
                  if (!draggedUserRef.current) return;
                  onChangeUserGroup(draggedUserRef.current, group);
                  draggedUserRef.current = null;
                }}
                key={group.id}
              >
                {({ connectDropTarget, isOver }) =>
                  connectDropTarget(
                    <div
                      style={
                        isOver
                          ? {
                              backgroundColor:
                                gdevelopTheme.paper.backgroundColor.light,
                              outline: `2px dashed ${
                                gdevelopTheme.dropIndicator.canDrop
                              }`,
                            }
                          : undefined
                      }
                    >
                      <Line noMargin>
                        <Column noMargin expand>
                          <Column noMargin>
                            <TeamGroupNameField
                              group={group}
                              onFinishEditingGroupName={onChangeGroupName}
                              allowDelete={members.length === 0}
                              onDeleteGroup={onDeleteGroup}
                            />
                          </Column>
                          <List>
                            {members
                              .sort(sortMembersByNameOrEmail)
                              .map(member => (
                                <TeamMemberRow
                                  key={member.id}
                                  member={member}
                                  onListUserProjects={() =>
                                    listUserProjects(member)
                                  }
                                  onDrag={setDraggedUser}
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
                    </div>
                  )
                }
              </DropTarget>
            ))
          ) : !showNewGroupNameField ? (
            <EmptyMessage>
              <Trans>Create a room and drag and drop members in it.</Trans>
            </EmptyMessage>
          ) : null}
        </SectionRow>
      </SectionContainer>
    );
  }
);

export default TeamSection;
