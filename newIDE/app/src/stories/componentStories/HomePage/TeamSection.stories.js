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
import random from 'lodash/random';
import sample from 'lodash/sample';

export default {
  title: 'HomePage/TeamSection',
  component: TeamSection,
  decorators: [paperDecorator],
};

const team: Team = {
  id: 'teamId',
  createdAt: 160,
  seats: 8,
};

const initialMembers: Array<User> = [
  // $FlowIgnore - the whole user object is not needed for this component
  {
    id: 'user1',
    email: 'user1@hotmail.com',
    username: null,
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
];

const MockTeamProvider = ({
  children,
  loading,
  noGroups,
}: {|
  children: React.Node,
  loading: boolean,
  noGroups?: boolean,
|}) => {
  const [nameChangeTryCount, setNameChangeTryCount] = React.useState<number>(0);
  const [userChangeTryCount, setUserChangeTryCount] = React.useState<number>(0);
  const [members, setMembers] = React.useState<?(User[])>(initialMembers);
  const [memberships, setMemberships] = React.useState<Array<TeamMembership>>(
    noGroups
      ? initialMemberships.map(membership => ({
          userId: membership.userId,
          teamId: membership.teamId,
          createdAt: membership.createdAt,
        }))
      : initialMemberships
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
        name: `${user.username || user.email}_project_${random(
          0,
          10000,
          false
        )}`,
        lastModifiedAt: '2021-11-20T11:59:50.417Z',
        createdAt: '2021-11-18T10:19:50.417Z',
        updatedAt: '2021-11-18T10:19:50.417Z',
      },
      {
        id: 'cloudProject2',
        name: `${user.username || user.email}_project_${random(
          0,
          10000,
          false
        )}`,
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

  const refreshMembers = async () => {
    await delay(800);
    setMembers(members => {
      if (!members) return members;
      const chosenMemberIndex = Math.floor(Math.random() * members.length);
      const newMembers = [...members];
      newMembers[chosenMemberIndex] = {
        ...newMembers[chosenMemberIndex],
        username:
          Math.random() > 0.5
            ? null
            : sample(['donatello', 'rafaelo', 'leonardo', 'michelangelo']) +
              random(0, 1000, false),
      };
      return newMembers;
    });
  };

  return (
    <DragAndDropContextProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithEducationPlan}
      >
        <TeamContext.Provider
          value={{
            team: loading ? null : team,
            members: loading ? null : members,
            groups: loading ? null : groups,
            memberships: loading ? null : memberships,
            onChangeGroupName: changeGroupName,
            onChangeUserGroup: changeUserGroup,
            onListUserProjects: listUserProjects,
            onDeleteGroup: deleteGroup,
            onCreateGroup: createGroup,
            onRefreshMembers: refreshMembers,
          }}
        >
          {children}
        </TeamContext.Provider>
      </AuthenticatedUserContext.Provider>
    </DragAndDropContextProvider>
  );
};

export const Default = () => (
  <MockTeamProvider loading={false}>
    <FixedHeightFlexContainer height={600}>
      <TeamSection
        project={testProject.project}
        currentFileMetadata={null}
        onOpenRecentFile={action('onOpenRecentFile')}
        storageProviders={[CloudStorageProvider]}
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
      />
    </FixedHeightFlexContainer>
  </MockTeamProvider>
);
