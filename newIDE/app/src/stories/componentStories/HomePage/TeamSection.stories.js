// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import {
  type Team,
  type TeamGroup,
  type TeamMembership,
  type User,
} from '../../../Utils/GDevelopServices/User';
import { type CloudProjectWithUserAccessInfo } from '../../../Utils/GDevelopServices/Project';
import { testProject } from '../../GDevelopJsInitializerDecorator';

import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import TeamContext from '../../../Profile/Team/TeamContext';
import TeamSection from '../../../MainFrame/EditorContainers/HomePage/TeamSection';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { fakeAuthenticatedUserWithEducationPlan } from '../../../fixtures/GDevelopServicesTestData';
import { delay } from '../../../Utils/Delay';
import sample from 'lodash/sample';
import Text from '../../../UI/Text';
import AlertProvider from '../../../UI/Alert/AlertProvider';

export default {
  title: 'HomePage/TeamSection',
  component: TeamSection,
  decorators: [paperDecorator],
};

const random = (min: number, range: number) =>
  Math.floor(Math.random() * range + min);

const initialTeam: Team = {
  id: 'teamId',
  createdAt: 160,
  seats: 9,
};

const initialAdmins: Array<User> = [
  // $FlowIgnore - the whole user object is not needed for this component
  {
    id: fakeAuthenticatedUserWithEducationPlan.profile
      ? fakeAuthenticatedUserWithEducationPlan.profile.id
      : 'user0',
    email: 'user0@teacher.com',
    username: 'Teacher',
  },
];

const initialMembers: Array<User> = [
  // $FlowIgnore - the whole user object is not needed for this component
  {
    id: 'user1',
    email: 'user1@hotmail.com',
    username: null,
    password: 'blue-chair-34',
  },
  // $FlowIgnore - the whole user object is not needed for this component
  {
    id: 'user2',
    email: 'user2@naver.com',
    username: 'DrCortex',
  },
  // $FlowIgnore - the whole user object is not needed for this component
  {
    id: 'user3',
    email: 'user3@gmail.com',
    username: 'Sonic',
  },
  // $FlowIgnore - the whole user object is not needed for this component
  {
    id: 'user4',
    email: 'user4@live.com',
    username: 'Peach',
    password: 'mario-help',
  },
  // $FlowIgnore - the whole user object is not needed for this component
  {
    id: 'user5',
    email: 'user5@live.fr',
    username: null,
  },
  // $FlowIgnore - the whole user object is not needed for this component
  {
    id: 'user6',
    email: 'user6@live.it',
    username: 'Mario',
  },
  // $FlowIgnore - the whole user object is not needed for this component
  {
    id: 'user7',
    email: 'user7@mail.ru',
    username: 'Bayonetta',
  },
  // $FlowIgnore - the whole user object is not needed for this component
  {
    id: 'user8',
    email: 'user8@mail.com',
    username: 'Bowser',
    deactivatedAt: 1355209080,
  },
];

const initialGroups = [
  { id: 'group1', name: 'Edelweiss' },
  { id: 'group2', name: 'Red square' },
];

const initialMemberships: Array<TeamMembership> = [
  {
    userId: 'user1',
    teamId: 'teamId',
    createdAt: 1659389384,
    groups: ['group1'],
  },
  {
    userId: 'user2',
    teamId: 'teamId',
    createdAt: 1659389384,
    groups: null,
  },
  {
    userId: 'user3',
    teamId: 'teamId',
    createdAt: 1659389384,
  },
  {
    userId: 'user4',
    teamId: 'teamId',
    createdAt: 1659389384,
    groups: ['group2'],
  },
  {
    userId: 'user5',
    teamId: 'teamId',
    createdAt: 1659389384,
    groups: ['group2'],
  },
  {
    userId: 'user6',
    teamId: 'teamId',
    createdAt: 1659389384,
    groups: ['group2'],
  },
  {
    userId: 'user7',
    teamId: 'teamId',
    createdAt: 1659389384,
    groups: null,
  },
  {
    userId: 'user8',
    teamId: 'teamId',
    createdAt: 1659389388,
    groups: null,
  },
];

const MockTeamProvider = ({
  children,
  loading,
  noGroups,
  noMembers,
  noActiveMembers,
  teamSize,
}: {|
  children: React.Node,
  loading: boolean,
  noGroups?: boolean,
  noMembers?: boolean,
  noActiveMembers?: boolean,
  teamSize?: number,
|}) => {
  const team = { ...initialTeam, seats: teamSize || initialTeam.seats };
  const [nameChangeTryCount, setNameChangeTryCount] = React.useState<number>(0);
  const [userChangeTryCount, setUserChangeTryCount] = React.useState<number>(0);
  const [members, setMembers] = React.useState<?(User[])>(
    noMembers
      ? []
      : noActiveMembers
      ? initialMembers.filter(member => !!member.deactivatedAt)
      : initialMembers
  );
  const [admins, setAdmins] = React.useState<?(User[])>(initialAdmins);
  const [memberships, setMemberships] = React.useState<Array<TeamMembership>>(
    () => {
      const membershipsToConsider = noMembers
        ? []
        : noActiveMembers
        ? initialMembers
            .filter(member => !!member.deactivatedAt)
            .map(inactiveMember =>
              initialMemberships.find(
                membership => membership.userId === inactiveMember.id
              )
            )
            .filter(Boolean)
        : initialMemberships;
      if (noGroups) {
        return membershipsToConsider.map(membership => ({
          userId: membership.userId,
          teamId: membership.teamId,
          createdAt: membership.createdAt,
        }));
      } else {
        return membershipsToConsider;
      }
    }
  );
  const [groups, setGroups] = React.useState<Array<TeamGroup>>(
    noGroups ? [] : initialGroups
  );

  const listUserProjects = async (
    user: User
  ): Promise<CloudProjectWithUserAccessInfo[]> => {
    await delay(1000);
    return [
      {
        id: 'cloudProject1',
        name: `${user.username || user.email}_project_${random(0, 10000)}`,
        lastModifiedAt: '2021-11-20T11:59:50.417Z',
        createdAt: '2021-11-18T10:19:50.417Z',
        updatedAt: '2021-11-18T10:19:50.417Z',
      },
      {
        id: 'cloudProject2',
        name: `${user.username || user.email}_project_${random(0, 10000)}`,
        lastModifiedAt: '2022-02-20T11:59:50.417Z',
        createdAt: '2022-01-08T10:19:50.417Z',
        updatedAt: '2022-01-08T10:19:50.417Z',
      },
    ];
  };

  const changeGroupName = async (group, newName) => {
    setNameChangeTryCount(nameChangeTryCount + 1);
    if (nameChangeTryCount % 3 === 1) {
      await delay(1000);
      throw new Error('Group name change error');
    }
    const newGroups = [...groups];
    const foundGroupIndex = groups.findIndex(_group => _group.id === group.id);
    if (foundGroupIndex === -1) return;
    await delay(1000);
    newGroups[foundGroupIndex].name = newName;
    setGroups(newGroups);
  };

  const changeUserGroup = async (user: User, group: TeamGroup) => {
    setUserChangeTryCount(userChangeTryCount + 1);
    if (userChangeTryCount % 3 === 1) {
      await delay(1000);
      throw new Error('User group change error');
    }
    const membershipToChangeIndex = memberships.findIndex(
      membership => membership.userId === user.id
    );
    if (
      membershipToChangeIndex === -1 ||
      (memberships[membershipToChangeIndex].groups &&
        memberships[membershipToChangeIndex].groups[0] === group.id)
    ) {
      return;
    }
    await delay(1000);
    const newMemberships = [...memberships];
    newMemberships[membershipToChangeIndex].groups = [group.id];
    setMemberships(newMemberships);
  };

  const deleteGroup = async (group: TeamGroup) => {
    await delay(1000);
    setGroups(groups => groups.filter(group_ => group_.id !== group.id));
  };

  const createGroup = async (attributes: {| name: string |}) => {
    await delay(1000);
    const newGroup = { ...attributes, id: `group${random(100, 10000)}` };
    setGroups([...groups, newGroup]);
  };

  const getAvailableSeats = () =>
    team && members && admins
      ? team.seats -
        members.filter(member => !member.deactivatedAt).length -
        admins.length
      : null;

  const setAdmin = async (email: string, activate: boolean) => {
    await delay(1000);
    if (!admins || !members) return;
    if (email === 'sub@user.com') {
      const error = new Error('SetAdminError');
      // $FlowIgnore
      error.response = {
        status: 400,
        data: { code: 'team-admin-creation/user-has-subscription' },
      };
      throw error;
    }
    if (email === initialAdmins[0].email) {
      const error = new Error('SetAdminError');
      // $FlowIgnore
      error.response = {
        status: 400,
        data: { code: 'team-admin-creation/owner-cannot-be-modified' },
      };
      throw error;
    }
    if (members.findIndex(member => member.email === email) >= 0) {
      const error = new Error('SetAdminError');
      // $FlowIgnore
      error.response = {
        status: 400,
        data: { code: 'team-admin-creation/user-with-autogenerated-email' },
      };
      throw error;
    }
    const newAdmins = [...admins];
    const adminIndex = admins.findIndex(admin => admin.email === email);
    if (activate) {
      if (adminIndex >= 0) {
        const error = new Error('SetAdminError');
        // $FlowIgnore
        error.response = {
          status: 400,
          data: { code: 'team-admin-creation/user-already-admin' },
        };
        throw error;
      }
      if (members && admins.length + members.length >= team.seats) {
        const error = new Error('SetAdminError');
        // $FlowIgnore
        error.response = {
          status: 400,
          data: { code: 'team-admin-creation/team-full' },
        };
        throw error;
      }

      const teacherId = `teacher${random(2000, 10000)}`;
      // $FlowIgnore - the whole user object is not needed for this component
      const newTeacher: User = {
        id: teacherId,
        email,
        username: teacherId.toLocaleUpperCase(),
      };
      newAdmins.push(newTeacher);
    } else {
      if (adminIndex === -1) {
        const error = new Error('SetAdminError');
        // $FlowIgnore
        error.response = {
          status: 400,
          data: { code: 'team-admin-creation/user-not-admin' },
        };
        throw error;
      }
      newAdmins.splice(adminIndex, 1);
    }
    setAdmins(newAdmins);
  };

  const refreshMembers = async () => {
    await delay(800);
    setMembers(members => {
      if (!members) return members;
      const chosenMemberIndex = Math.floor(Math.random() * members.length);
      const newMembers = [...members];
      // Simulate a username being set while refreshing members.
      newMembers[chosenMemberIndex] = {
        ...newMembers[chosenMemberIndex],
        username:
          Math.random() > 0.5
            ? null
            : sample(['donatello', 'rafaelo', 'leonardo', 'michelangelo']) +
              random(0, 1000),
      };
      return newMembers;
    });
  };
  const refreshAdmins = async () => {
    await delay(500);
  };

  const createMembers = async () => {
    await delay(2000);
    if (members && members.length < 2) {
      // No accounts created, we create a bunch of them
      setMembers(initialMembers);
      setMemberships(
        initialMemberships.map(membership => ({
          userId: membership.userId,
          teamId: membership.teamId,
          createdAt: membership.createdAt,
        }))
      );
    } else {
      if (!members) return;
      // We create the accounts one by one (batch creation won't work, only single addition button)
      const newMembers = [...members];
      const newUserId = `user${random(1000, 1000)}`;
      // $FlowIgnore - the whole user object is not needed for this component
      const newUser: User = {
        id: newUserId,
        email: `${newUserId}@naver.com`,
        username: null,
      };
      newMembers.push(newUser);
      const newMemberships = [...memberships];
      newMemberships.push({
        userId: newUser.id,
        teamId: 'teamId',
        createdAt: Date.now(),
        groups: null,
      });
      setMemberships(newMemberships);
      setMembers(newMembers);
    }
  };

  const changeMemberPassword = async (userId: string, newPassword: string) => {
    if (!members) return;
    const newMembers = [...members];
    const memberIndex = newMembers.findIndex(member => member.id === userId);
    if (memberIndex === -1) return;
    newMembers.splice(memberIndex, 1, {
      ...newMembers[memberIndex],
      password: newPassword,
    });
    setMembers(newMembers);
  };

  return (
    <AlertProvider>
      <DragAndDropContextProvider>
        <AuthenticatedUserContext.Provider
          value={fakeAuthenticatedUserWithEducationPlan}
        >
          <TeamContext.Provider
            value={{
              team: loading ? null : team,
              members: loading ? null : members,
              groups: loading ? null : groups,
              admins: loading ? null : admins,
              memberships: loading ? null : memberships,
              onChangeGroupName: changeGroupName,
              onChangeUserGroup: changeUserGroup,
              onListUserProjects: listUserProjects,
              onDeleteGroup: deleteGroup,
              onCreateGroup: createGroup,
              onRefreshMembers: refreshMembers,
              onRefreshAdmins: refreshAdmins,
              onCreateMembers: createMembers,
              getAvailableSeats,
              onActivateMembers: action('activateMembers'),
              onChangeMemberPassword: changeMemberPassword,
              onSetAdmin: setAdmin,
            }}
          >
            <Text allowSelection>
              Story note: To test trying to add admin that already has a
              subscription, enter email `sub@user.com`
            </Text>
            {children}
          </TeamContext.Provider>
        </AuthenticatedUserContext.Provider>
      </DragAndDropContextProvider>
    </AlertProvider>
  );
};

export const Default = () => (
  <MockTeamProvider loading={false} teamSize={12}>
    <FixedHeightFlexContainer height={600}>
      <TeamSection
        project={testProject.project}
        currentFileMetadata={null}
        onOpenRecentFile={action('onOpenRecentFile')}
        storageProviders={[CloudStorageProvider]}
        onOpenTeachingResources={action('onOpenTeachingResources')}
      />
    </FixedHeightFlexContainer>
  </MockTeamProvider>
);

export const WithNoGroupsYet = () => (
  <MockTeamProvider loading={false} noGroups>
    <FixedHeightFlexContainer height={600}>
      <TeamSection
        project={testProject.project}
        currentFileMetadata={null}
        onOpenRecentFile={action('onOpenRecentFile')}
        storageProviders={[CloudStorageProvider]}
        onOpenTeachingResources={action('onOpenTeachingResources')}
      />
    </FixedHeightFlexContainer>
  </MockTeamProvider>
);

export const WithNoStudentsYet = () => (
  <MockTeamProvider loading={false} noGroups noMembers>
    <FixedHeightFlexContainer height={600}>
      <TeamSection
        project={testProject.project}
        currentFileMetadata={null}
        onOpenRecentFile={action('onOpenRecentFile')}
        storageProviders={[CloudStorageProvider]}
        onOpenTeachingResources={action('onOpenTeachingResources')}
      />
    </FixedHeightFlexContainer>
  </MockTeamProvider>
);

export const WithArchivedStudentsOnly = () => (
  <MockTeamProvider loading={false} noGroups noActiveMembers>
    <FixedHeightFlexContainer height={600}>
      <TeamSection
        project={testProject.project}
        currentFileMetadata={null}
        onOpenRecentFile={action('onOpenRecentFile')}
        storageProviders={[CloudStorageProvider]}
        onOpenTeachingResources={action('onOpenTeachingResources')}
      />
    </FixedHeightFlexContainer>
  </MockTeamProvider>
);

export const Loading = () => (
  <MockTeamProvider loading={true}>
    <FixedHeightFlexContainer height={600}>
      <TeamSection
        project={testProject.project}
        currentFileMetadata={null}
        onOpenRecentFile={action('onOpenRecentFile')}
        storageProviders={[CloudStorageProvider]}
        onOpenTeachingResources={action('onOpenTeachingResources')}
      />
    </FixedHeightFlexContainer>
  </MockTeamProvider>
);
