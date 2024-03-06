// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import List from '@material-ui/core/List';
import { Line, Column } from '../../../../UI/Grid';

import {
  type FileMetadataAndStorageProviderName,
  type FileMetadata,
  type StorageProvider,
} from '../../../../ProjectsStorage';
import SectionContainer, { SectionRow } from '../SectionContainer';
import CircularProgress from '../../../../UI/CircularProgress';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import {
  type TeamGroup,
  type User,
} from '../../../../Utils/GDevelopServices/User';
import { type CloudProjectWithUserAccessInfo } from '../../../../Utils/GDevelopServices/Project';
import TeamContext from '../../../../Profile/Team/TeamContext';
import TeamGroupNameField from './TeamGroupNameField';
import NewTeamGroupNameField from './NewTeamGroupNameField';
import TeamMemberRow from './TeamMemberRow';
import { makeDropTarget } from '../../../../UI/DragAndDrop/DropTarget';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import EmptyMessage from '../../../../UI/EmptyMessage';
import Text from '../../../../UI/Text';
import FlatButton from '../../../../UI/FlatButton';
import Add from '../../../../UI/CustomSvgIcons/Add';
import TeamMemberProjectsView from './TeamMemberProjectsView';
import Refresh from '../../../../UI/CustomSvgIcons/Refresh';
import { ColumnStackLayout } from '../../../../UI/Layout';
import Paper from '../../../../UI/Paper';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import RaisedButton from '../../../../UI/RaisedButton';
import { groupMembersByGroupId } from './utils';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../../../UI/Menu/ContextMenu';
import type { ClientCoordinates } from '../../../../Utils/UseLongTouch';
import { type MenuItemTemplate } from '../../../../UI/Menu/Menu.flow';

const PADDING = 16;

const styles = {
  list: { padding: 0 },
  lobbyContainer: { padding: PADDING },
  roomsContainer: { paddingRight: PADDING },
  titleAdornmentContainer: { paddingRight: PADDING },
};

const sortMembersByNameOrEmail = (a: User, b: User) => {
  return (a.username || a.email).localeCompare(b.username || b.email);
};

const DropTarget = makeDropTarget('team-groups');

type Props = {|
  project: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  storageProviders: Array<StorageProvider>,
|};

export type TeamSectionInterface = {|
  forceUpdate: () => void,
|};

const TeamSection = React.forwardRef<Props, TeamSectionInterface>(
  (
    { project, onOpenRecentFile, storageProviders, currentFileMetadata },
    ref
  ) => {
    const {
      groups,
      members,
      memberships,
      onChangeGroupName,
      onChangeUserGroup,
      onListUserProjects,
      onDeleteGroup,
      onCreateGroup,
      onRefreshMembers,
    } = React.useContext(TeamContext);
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const forceUpdate = useForceUpdate();
    const { isMobile } = useResponsiveWindowSize();
    const contextMenu = React.useRef<?ContextMenuInterface>(null);

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
    const [isLoadingMembers, setIsLoadingMembers] = React.useState<boolean>(
      false
    );
    const [movingUsers, setMovingUsers] = React.useState<?{|
      groupId: string,
      users: User[],
    |}>(null);

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

    const onRefreshTeamMembers = React.useCallback(
      async () => {
        setIsLoadingMembers(true);
        try {
          await onRefreshMembers();
        } catch (error) {
          console.error(
            'An error occurred when refreshing team members:',
            error
          );
        } finally {
          setIsLoadingMembers(false);
        }
      },
      [onRefreshMembers]
    );

    const changeUserGroup = React.useCallback(
      async (user: User, group: TeamGroup) => {
        try {
          setMovingUsers({
            groupId: group.id,
            users: [user],
          });
          await onChangeUserGroup(user, group);
        } catch (error) {
          console.error(
            `An error occurred when changing user ${user.email} to group ${
              group.name
            }: `,
            error
          );
        } finally {
          setMovingUsers(null);
        }
      },
      [onChangeUserGroup]
    );

    const buildContextMenu = (
      i18n: I18nType,
      member: User
    ): Array<MenuItemTemplate> => {
      return [
        {
          label: i18n._(t`See projects`),
          click: () => listUserProjects(member),
        },
      ];
    };

    const openContextMenu = React.useCallback(
      (event: ClientCoordinates, member: User) => {
        if (contextMenu.current) {
          contextMenu.current.open(event.clientX, event.clientY, { member });
        }
      },
      []
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

    if (selectedUser) {
      return (
        <TeamMemberProjectsView
          user={selectedUser}
          currentFileMetadata={currentFileMetadata}
          projects={selectedUserProjects}
          storageProviders={storageProviders}
          onOpenRecentFile={onOpenRecentFile}
          onClickBack={() => {
            setSelectedUser(null);
            setSelectedUserProjects(null);
          }}
          onRefreshProjects={listUserProjects}
          isLoadingProjects={isLoadingUserProjects}
        />
      );
    }

    const membersNotInAGroup = membersByGroupId['NONE'];
    const membersNotInAGroupToDisplay =
      membersNotInAGroup && !!movingUsers
        ? {
            group: membersNotInAGroup.group,
            members: membersNotInAGroup.members.filter(
              member => !movingUsers.users.includes(member)
            ),
          }
        : membersNotInAGroup;
    const groupsAndMembers = Object.keys(membersByGroupId)
      .map(id => (id === 'NONE' ? null : membersByGroupId[id]))
      .filter(Boolean)
      .sort((a, b) => a.group.name.localeCompare(b.group.name));

    return (
      <SectionContainer
        title={<Trans>Classrooms</Trans>}
        titleAdornment={
          <div style={styles.titleAdornmentContainer}>
            <FlatButton
              primary
              disabled={isLoadingMembers}
              label={
                isMobile ? (
                  <Trans>Refresh</Trans>
                ) : (
                  <Trans>Refresh dashboard</Trans>
                )
              }
              onClick={onRefreshTeamMembers}
              leftIcon={<Refresh fontSize="small" />}
            />
          </div>
        }
      >
        <SectionRow>
          {membersNotInAGroupToDisplay && (
            <Paper background="medium" style={styles.lobbyContainer}>
              <Line noMargin>
                <ColumnStackLayout noMargin expand>
                  <Text size="section-title" noMargin>
                    <Trans>Lobby</Trans>
                  </Text>
                  <List style={styles.list}>
                    {membersNotInAGroupToDisplay.members
                      .sort(sortMembersByNameOrEmail)
                      .map(member => (
                        <TeamMemberRow
                          isTemporary={false}
                          key={member.id}
                          onOpenContextMenu={openContextMenu}
                          member={member}
                          onListUserProjects={() => listUserProjects(member)}
                          onDrag={setDraggedUser}
                        />
                      ))}
                  </List>
                </ColumnStackLayout>
              </Line>
            </Paper>
          )}
          <div style={styles.roomsContainer}>
            <Line justifyContent="space-between" alignItems="center">
              <Text size="section-title" noMargin>
                <Trans>Rooms</Trans>
              </Text>
              <RaisedButton
                primary
                label={
                  isMobile ? (
                    <Trans>Create</Trans>
                  ) : (
                    <Trans>Create a new room</Trans>
                  )
                }
                icon={<Add fontSize="small" />}
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
            <ColumnStackLayout noMargin>
              {groupsAndMembers.length > 0 ? (
                groupsAndMembers.map(({ group, members }) => {
                  const membersToDisplay = [...members];
                  if (!!movingUsers && movingUsers.groupId === group.id) {
                    movingUsers.users.forEach(movingUser => {
                      if (
                        !members.some(member => member.id === movingUser.id)
                      ) {
                        membersToDisplay.push(movingUser);
                      }
                    });
                  }

                  return (
                    <DropTarget
                      canDrop={() => true}
                      drop={() => {
                        const droppedUser = draggedUserRef.current;
                        if (!droppedUser) return;
                        changeUserGroup(droppedUser, group);
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
                                    allowDelete={membersToDisplay.length === 0}
                                    onDeleteGroup={onDeleteGroup}
                                  />
                                </Column>
                                <List style={styles.list}>
                                  {membersToDisplay
                                    .sort(sortMembersByNameOrEmail)
                                    .map(member => {
                                      const isTemporary =
                                        !!movingUsers &&
                                        movingUsers.users.some(
                                          user => user.id === member.id
                                        );
                                      return (
                                        <TeamMemberRow
                                          isTemporary={isTemporary}
                                          key={
                                            member.id +
                                            (isTemporary ? '_temp' : '')
                                          }
                                          member={member}
                                          onOpenContextMenu={openContextMenu}
                                          onListUserProjects={() =>
                                            listUserProjects(member)
                                          }
                                          onDrag={setDraggedUser}
                                        />
                                      );
                                    })}
                                </List>
                              </Column>
                            </Line>
                          </div>
                        )
                      }
                    </DropTarget>
                  );
                })
              ) : !showNewGroupNameField ? (
                <EmptyMessage>
                  <Trans>Create a room and drag and drop members in it.</Trans>
                </EmptyMessage>
              ) : null}
            </ColumnStackLayout>
          </div>
        </SectionRow>
        <ContextMenu
          ref={contextMenu}
          buildMenuTemplate={(_i18n, { member }) =>
            buildContextMenu(_i18n, member)
          }
        />
      </SectionContainer>
    );
  }
);

const TeamSectionWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Team section</Trans>}
    scope="start-page-team"
  >
    <TeamSection {...props} />
  </ErrorBoundary>
);

export default TeamSectionWithErrorBoundary;
