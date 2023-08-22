// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
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

export default {
  title: 'HomePage/TeamSection',
  component: TeamSection,
  decorators: [paperDecorator, muiDecorator],
};

const team: Team = {
  id: 'teamId',
  createdAt: 160,
  seats: 8,
};

const members: Array<User> = [
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
const memberships: Array<TeamMembership> = [
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
}: {|
  children: React.Node,
  loading: boolean,
|}) => {
  const [nameChangeTryCount, setNameChangeTryCount] = React.useState<number>(0);
  const [groups, setGroups] = React.useState<Array<TeamGroup>>([
    { id: 'group1', name: 'Edelweiss' },
    { id: 'group2', name: 'Red square' },
  ]);

  const onListUserProjects = async (
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
      },
    ];
  };

  const changeGroupName = async (group, newName) => {
    setNameChangeTryCount(nameChangeTryCount + 1);
    if (nameChangeTryCount % 3 === 1) {
      await delay(1000);
      throw new Error('Group name error change');
    }
    const newGroups = [...groups];
    const foundGroupIndex = groups.findIndex(_group => _group.id === group.id);
    if (foundGroupIndex === -1) return;
    await delay(1000);
    newGroups[foundGroupIndex].name = newName;
    setGroups(newGroups);
  };

  return (
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
          onListUserProjects,
        }}
      >
        {children}
      </TeamContext.Provider>
    </AuthenticatedUserContext.Provider>
  );
};

export const Default = () => (
  <MockTeamProvider loading={false}>
    <FixedHeightFlexContainer height={600}>
      <TeamSection
        project={testProject.project}
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
        onOpenRecentFile={action('onOpenRecentFile')}
        storageProviders={[CloudStorageProvider]}
      />
    </FixedHeightFlexContainer>
  </MockTeamProvider>
);
