// @flow

import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import { action } from '@storybook/addon-actions';
import {
  fakeFileMetadataAndStorageProviderNameForCloudProject,
  fakeFileMetadataAndStorageProviderNameForLocalProject,
  fakeSilverAuthenticatedUser,
  game1,
  game2,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import GamesList from '../../../GameDashboard/GamesList';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';
import PreferencesContext, {
  initialPreferences,
  type Preferences,
} from '../../../MainFrame/Preferences/PreferencesContext';
import LocalFileStorageProvider from '../../../ProjectsStorage/LocalFileStorageProvider';

export default {
  title: 'GameDashboard/GamesList',
  component: GamesList,
  decorators: [paperDecorator],
};

export const NoGamesOrProjects = () => {
  const projectFiles = [];

  const preferences: Preferences = {
    ...initialPreferences,
    values: {
      ...initialPreferences.values,
      recentProjectFiles: projectFiles,
    },
    getRecentProjectFiles: () => projectFiles,
  };

  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchText, setSearchText] = React.useState('');

  return (
    <PreferencesContext.Provider value={preferences}>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <GamesList
          storageProviders={[CloudStorageProvider, LocalFileStorageProvider]}
          project={null}
          games={[]}
          onRefreshGames={action('onRefreshGames')}
          onOpenGameManager={action('onOpenGameManager')}
          onOpenProject={action('onOpenProject')}
          canOpen={true}
          askToCloseProject={action('askToCloseProject')}
          closeProject={action('closeProject')}
          canSaveProject
          currentFileMetadata={null}
          isUpdatingGame={false}
          onChooseProject={action('onChooseProject')}
          onOpenNewProjectSetupDialog={action('onOpenNewProjectSetupDialog')}
          onSaveProject={action('onSaveProject')}
          onUnregisterGame={action('onUnregisterGame')}
          onDeleteCloudProject={action('onDeleteCloudProject')}
          onRegisterProject={action('onRegisterProject')}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </AuthenticatedUserContext.Provider>
    </PreferencesContext.Provider>
  );
};

export const WithOnlyGames = () => {
  const projectFiles = [
    {
      ...fakeFileMetadataAndStorageProviderNameForLocalProject,
      fileMetadata: {
        ...fakeFileMetadataAndStorageProviderNameForLocalProject.fileMetadata,
        gameId: game1.id,
      },
    },
  ];

  const preferences: Preferences = {
    ...initialPreferences,
    values: {
      ...initialPreferences.values,
      recentProjectFiles: projectFiles,
    },
    getRecentProjectFiles: () => projectFiles,
  };

  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchText, setSearchText] = React.useState('');

  return (
    <PreferencesContext.Provider value={preferences}>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <GamesList
          storageProviders={[CloudStorageProvider, LocalFileStorageProvider]}
          project={null}
          games={[game1, game2]}
          onRefreshGames={action('onRefreshGames')}
          onOpenGameManager={action('onOpenGameManager')}
          onOpenProject={action('onOpenProject')}
          canOpen={true}
          askToCloseProject={action('askToCloseProject')}
          closeProject={action('closeProject')}
          canSaveProject
          currentFileMetadata={null}
          isUpdatingGame={false}
          onChooseProject={action('onChooseProject')}
          onOpenNewProjectSetupDialog={action('onOpenNewProjectSetupDialog')}
          onSaveProject={action('onSaveProject')}
          onUnregisterGame={action('onUnregisterGame')}
          onDeleteCloudProject={action('onDeleteCloudProject')}
          onRegisterProject={action('onRegisterProject')}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </AuthenticatedUserContext.Provider>
    </PreferencesContext.Provider>
  );
};

export const WithOnlyProjects = () => {
  const projectFiles = [
    fakeFileMetadataAndStorageProviderNameForCloudProject,
    fakeFileMetadataAndStorageProviderNameForLocalProject,
  ];

  const preferences: Preferences = {
    ...initialPreferences,
    values: {
      ...initialPreferences.values,
      recentProjectFiles: projectFiles,
    },
    getRecentProjectFiles: () => projectFiles,
  };

  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchText, setSearchText] = React.useState('');

  return (
    <PreferencesContext.Provider value={preferences}>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <GamesList
          storageProviders={[CloudStorageProvider, LocalFileStorageProvider]}
          project={null}
          games={[]}
          onRefreshGames={action('onRefreshGames')}
          onOpenGameManager={action('onOpenGameManager')}
          onOpenProject={action('onOpenProject')}
          canOpen={true}
          askToCloseProject={action('askToCloseProject')}
          closeProject={action('closeProject')}
          canSaveProject
          currentFileMetadata={null}
          isUpdatingGame={false}
          onChooseProject={action('onChooseProject')}
          onOpenNewProjectSetupDialog={action('onOpenNewProjectSetupDialog')}
          onSaveProject={action('onSaveProject')}
          onUnregisterGame={action('onUnregisterGame')}
          onDeleteCloudProject={action('onDeleteCloudProject')}
          onRegisterProject={action('onRegisterProject')}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </AuthenticatedUserContext.Provider>
    </PreferencesContext.Provider>
  );
};

export const WithGamesAndProjects = () => {
  const projectFiles = [
    fakeFileMetadataAndStorageProviderNameForCloudProject,
    fakeFileMetadataAndStorageProviderNameForLocalProject,
    {
      ...fakeFileMetadataAndStorageProviderNameForLocalProject,
      fileMetadata: {
        ...fakeFileMetadataAndStorageProviderNameForLocalProject.fileMetadata,
        gameId: game1.id,
      },
    },
  ];

  const preferences: Preferences = {
    ...initialPreferences,
    values: {
      ...initialPreferences.values,
      recentProjectFiles: projectFiles,
    },
    getRecentProjectFiles: () => projectFiles,
  };

  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchText, setSearchText] = React.useState('');

  return (
    <PreferencesContext.Provider value={preferences}>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <GamesList
          storageProviders={[CloudStorageProvider, LocalFileStorageProvider]}
          project={null}
          games={[game1, game2]}
          onRefreshGames={action('onRefreshGames')}
          onOpenGameManager={action('onOpenGameManager')}
          onOpenProject={action('onOpenProject')}
          canOpen={true}
          askToCloseProject={action('askToCloseProject')}
          closeProject={action('closeProject')}
          canSaveProject
          currentFileMetadata={null}
          isUpdatingGame={false}
          onChooseProject={action('onChooseProject')}
          onOpenNewProjectSetupDialog={action('onOpenNewProjectSetupDialog')}
          onSaveProject={action('onSaveProject')}
          onUnregisterGame={action('onUnregisterGame')}
          onDeleteCloudProject={action('onDeleteCloudProject')}
          onRegisterProject={action('onRegisterProject')}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          searchText={searchText}
          setSearchText={setSearchText}
        />
      </AuthenticatedUserContext.Provider>
    </PreferencesContext.Provider>
  );
};
