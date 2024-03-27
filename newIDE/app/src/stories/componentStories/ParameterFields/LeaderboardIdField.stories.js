// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import { testProject } from '../../GDevelopJsInitializerDecorator';
import LeaderboardIdField from '../../../EventsSheet/ParameterFields/LeaderboardIdField';
import ValueStateHolder from '../../ValueStateHolder';

import LeaderboardContext from '../../../Leaderboard/LeaderboardContext';
import { type Leaderboard } from '../../../Utils/GDevelopServices/Play';

export default {
  title: 'ParameterFields/LeaderboardIdField',
  component: LeaderboardIdField,
  decorators: [paperDecorator],
};

const mockedLeaderboards = Array(5)
  .fill(0)
  .map((_, index) => ({
    id: `489165zad49-a8ad6-4a984-dcz8da-hjqn983qh${index}`,
    name: `Level ${index + 1}`,
    sort: 'DESC',
    gameId: 'fakeGameId',
    startDatetime: '2021-11-18T10:19:50.417Z',
    playerUnicityDisplayChoice: index % 2 === 0 ? 'PREFER_UNIQUE' : 'FREE',
    visibility: index % 3 === 0 ? 'HIDDEN' : 'PUBLIC',
  }));
const mockedEntries = Array(8)
  .fill(0)
  .map((_, index) => ({
    leaderboardId: '489165zad49-a8ad6-4a984-dcz8da-hjqn983qh0',
    id: `fze8f4ze9f489ze4f9zef4${index}`,
    playerName: `player${index % 2}`,
    score: Math.round(Math.random() * 20 + 150),
    createdAt: new Date(
      1647964688856 + Math.random() * -5000000000
    ).toISOString(),
  }))
  .sort((a, b) => a.score - b.score);
const leaderboardsByIds = mockedLeaderboards.reduce((acc, leaderboard) => {
  acc[leaderboard.id] = leaderboard;
  return acc;
}, {});

const MockLeaderboardProvider = ({ children }: {| children: React.Node |}) => {
  const [
    currentLeaderboard,
    setCurrentLeaderboard,
  ] = React.useState<Leaderboard>(mockedLeaderboards[3]);
  return (
    <LeaderboardContext.Provider
      value={{
        leaderboards: mockedLeaderboards,
        currentLeaderboard,
        displayOnlyBestEntry:
          currentLeaderboard.playerUnicityDisplayChoice === 'PREFER_UNIQUE',
        browsing: {
          entries: mockedEntries,
          goToNextPage: null,
          goToPreviousPage: null,
          goToFirstPage: null,
        },
        setDisplayOnlyBestEntry: action('setDisplayOnlyBestEntry'),
        createLeaderboard: () => action('createLeaderboard'),
        listLeaderboards: action('listLeaderboards'),
        selectLeaderboard: leaderboardId => {
          setCurrentLeaderboard(leaderboardsByIds[leaderboardId]);
        },
        updateLeaderboard: () => action('updateLeaderboard'),
        resetLeaderboard: () => action('resetLeaderboard'),
        deleteLeaderboard: () => action('deleteLeaderboard'),
        deleteLeaderboardEntry: () => action('deleteLeaderboardEntry'),
        fetchLeaderboardEntries: () => action('fetchLeaderboardEntries'),
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};

export const Default = () => (
  <MockLeaderboardProvider>
    <ValueStateHolder
      initialValue={''}
      render={(value, onChange) => (
        <LeaderboardIdField
          project={testProject.project}
          scope={{
            project: testProject.project,
            layout: testProject.testLayout,
          }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          value={value}
          onChange={onChange}
        />
      )}
    />
  </MockLeaderboardProvider>
);

export const InitialValidLeaderboard = () => (
  <MockLeaderboardProvider>
    <ValueStateHolder
      initialValue={'"489165zad49-a8ad6-4a984-dcz8da-hjqn983qh2"'}
      render={(value, onChange) => (
        <LeaderboardIdField
          project={testProject.project}
          scope={{
            project: testProject.project,
            layout: testProject.testLayout,
          }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          value={value}
          onChange={onChange}
        />
      )}
    />
  </MockLeaderboardProvider>
);

export const InitialInvalidLeaderboard = () => (
  <MockLeaderboardProvider>
    <ValueStateHolder
      initialValue={'5032ff25-6cd7-4adb-978d-8d2e532b16cf'}
      render={(value, onChange) => (
        <LeaderboardIdField
          project={testProject.project}
          scope={{
            project: testProject.project,
            layout: testProject.testLayout,
          }}
          globalObjectsContainer={testProject.project}
          objectsContainer={testProject.testLayout}
          value={value}
          onChange={onChange}
        />
      )}
    />
  </MockLeaderboardProvider>
);
