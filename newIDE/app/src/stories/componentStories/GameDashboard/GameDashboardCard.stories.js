// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import GameDashboardCard from '../../../GameDashboard/GameDashboardCard';
import {
  fakeSilverAuthenticatedUser,
  game1,
  game2,
  fakeFileMetadataAndStorageProviderNameForCloudProject,
  fakeFileMetadataAndStorageProviderNameForLocalProject,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';
import LocalFileStorageProvider from '../../../ProjectsStorage/LocalFileStorageProvider';

export default {
  title: 'GameDashboard/GameDashboardCard',
  component: GameDashboardCard,
  decorators: [paperDecorator],
};

export const UnpublishedGame = (): renders any => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameDashboardCard
      storageProviders={[CloudStorageProvider]}
      dashboardItem={{
        game: game2,
      }}
      isCurrentProjectOpened={false}
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      canSaveProject
      disabled={false}
      onSaveProject={action('onSaveProject')}
      closeProject={action('closeProject')}
      currentFileMetadata={null}
      lastModifiedInfoByProjectId={{}}
      onDeleteCloudProject={action('onDeleteCloudProject')}
      onRefreshGames={action('onRefreshGames')}
      onRegisterProject={action('onRegisterProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const PublishedGame = (): renders any => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameDashboardCard
      storageProviders={[CloudStorageProvider]}
      dashboardItem={{
        game: game1,
      }}
      isCurrentProjectOpened={false}
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      canSaveProject
      disabled={false}
      onSaveProject={action('onSaveProject')}
      closeProject={action('closeProject')}
      currentFileMetadata={null}
      lastModifiedInfoByProjectId={{}}
      onDeleteCloudProject={action('onDeleteCloudProject')}
      onRefreshGames={action('onRefreshGames')}
      onRegisterProject={action('onRegisterProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const CurrentlyOpenedGame = (): renders any => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameDashboardCard
      storageProviders={[CloudStorageProvider]}
      dashboardItem={{
        game: game1,
      }}
      isCurrentProjectOpened
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      canSaveProject
      disabled={false}
      onSaveProject={action('onSaveProject')}
      closeProject={action('closeProject')}
      currentFileMetadata={null}
      lastModifiedInfoByProjectId={{}}
      onDeleteCloudProject={action('onDeleteCloudProject')}
      onRefreshGames={action('onRefreshGames')}
      onRegisterProject={action('onRegisterProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const SavingGame = (): renders any => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameDashboardCard
      storageProviders={[CloudStorageProvider]}
      dashboardItem={{
        game: game1,
      }}
      isCurrentProjectOpened
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      canSaveProject={false}
      disabled={false}
      onSaveProject={action('onSaveProject')}
      closeProject={action('closeProject')}
      currentFileMetadata={null}
      lastModifiedInfoByProjectId={{}}
      onDeleteCloudProject={action('onDeleteCloudProject')}
      onRefreshGames={action('onRefreshGames')}
      onRegisterProject={action('onRegisterProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const DisabledGame = (): renders any => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameDashboardCard
      storageProviders={[CloudStorageProvider]}
      dashboardItem={{
        game: game1,
      }}
      isCurrentProjectOpened
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      canSaveProject
      disabled
      onSaveProject={action('onSaveProject')}
      closeProject={action('closeProject')}
      currentFileMetadata={null}
      lastModifiedInfoByProjectId={{}}
      onDeleteCloudProject={action('onDeleteCloudProject')}
      onRefreshGames={action('onRefreshGames')}
      onRegisterProject={action('onRegisterProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const LocalProject = (): renders any => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameDashboardCard
      dashboardItem={{
        projectFiles: [fakeFileMetadataAndStorageProviderNameForLocalProject],
      }}
      isCurrentProjectOpened={false}
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      onRefreshGames={action('onRefreshGames')}
      canSaveProject
      disabled={false}
      onSaveProject={action('onSaveProject')}
      closeProject={action('closeProject')}
      currentFileMetadata={null}
      lastModifiedInfoByProjectId={{}}
      storageProviders={[LocalFileStorageProvider, CloudStorageProvider]}
      onDeleteCloudProject={action('onDeleteCloudProject')}
      onRegisterProject={action('onRegisterProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const OpenedLocalProject = (): renders any => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameDashboardCard
      dashboardItem={{
        projectFiles: [fakeFileMetadataAndStorageProviderNameForLocalProject],
      }}
      isCurrentProjectOpened
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      onRefreshGames={action('onRefreshGames')}
      canSaveProject
      disabled={false}
      onSaveProject={action('onSaveProject')}
      closeProject={action('closeProject')}
      currentFileMetadata={null}
      lastModifiedInfoByProjectId={{}}
      storageProviders={[LocalFileStorageProvider, CloudStorageProvider]}
      onDeleteCloudProject={action('onDeleteCloudProject')}
      onRegisterProject={action('onRegisterProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const DisabledLocalProject = (): renders any => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameDashboardCard
      dashboardItem={{
        projectFiles: [fakeFileMetadataAndStorageProviderNameForLocalProject],
      }}
      isCurrentProjectOpened
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      onRefreshGames={action('onRefreshGames')}
      canSaveProject
      disabled
      onSaveProject={action('onSaveProject')}
      closeProject={action('closeProject')}
      currentFileMetadata={null}
      lastModifiedInfoByProjectId={{}}
      storageProviders={[LocalFileStorageProvider, CloudStorageProvider]}
      onDeleteCloudProject={action('onDeleteCloudProject')}
      onRegisterProject={action('onRegisterProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const CloudProject = (): renders any => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameDashboardCard
      dashboardItem={{
        projectFiles: [fakeFileMetadataAndStorageProviderNameForCloudProject],
      }}
      isCurrentProjectOpened={false}
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      onRefreshGames={action('onRefreshGames')}
      canSaveProject
      disabled={false}
      onSaveProject={action('onSaveProject')}
      closeProject={action('closeProject')}
      currentFileMetadata={null}
      lastModifiedInfoByProjectId={{}}
      storageProviders={[LocalFileStorageProvider, CloudStorageProvider]}
      onDeleteCloudProject={action('onDeleteCloudProject')}
      onRegisterProject={action('onRegisterProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const OpenedCloudProject = (): renders any => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameDashboardCard
      dashboardItem={{
        projectFiles: [fakeFileMetadataAndStorageProviderNameForCloudProject],
      }}
      isCurrentProjectOpened
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      onRefreshGames={action('onRefreshGames')}
      canSaveProject
      disabled={false}
      onSaveProject={action('onSaveProject')}
      closeProject={action('closeProject')}
      currentFileMetadata={null}
      lastModifiedInfoByProjectId={{}}
      storageProviders={[LocalFileStorageProvider, CloudStorageProvider]}
      onDeleteCloudProject={action('onDeleteCloudProject')}
      onRegisterProject={action('onRegisterProject')}
    />
  </AuthenticatedUserContext.Provider>
);

export const DisabledCloudProject = (): renders any => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameDashboardCard
      dashboardItem={{
        projectFiles: [fakeFileMetadataAndStorageProviderNameForCloudProject],
      }}
      isCurrentProjectOpened
      onOpenGameManager={action('onOpenGameManager')}
      onOpenProject={action('onOpenProject')}
      onUnregisterGame={action('onUnregisterGame')}
      askToCloseProject={action('askToCloseProject')}
      onRefreshGames={action('onRefreshGames')}
      canSaveProject
      disabled
      onSaveProject={action('onSaveProject')}
      closeProject={action('closeProject')}
      currentFileMetadata={null}
      lastModifiedInfoByProjectId={{}}
      storageProviders={[LocalFileStorageProvider, CloudStorageProvider]}
      onDeleteCloudProject={action('onDeleteCloudProject')}
      onRegisterProject={action('onRegisterProject')}
    />
  </AuthenticatedUserContext.Provider>
);
