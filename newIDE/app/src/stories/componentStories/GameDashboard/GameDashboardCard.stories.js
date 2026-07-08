// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import GameDashboardCard, {
  type DashboardItem,
} from '../../../GameDashboard/GameDashboardCard';
import {
  fakeSilverAuthenticatedUser,
  fakeAuthenticatedUserWithNoSubscription,
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

export const UnpublishedGame = (): React.Node => (
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

export const PublishedGame = (): React.Node => (
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

export const CurrentlyOpenedGame = (): React.Node => (
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

export const SavingGame = (): React.Node => (
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

export const DisabledGame = (): React.Node => (
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

export const LocalProject = (): React.Node => (
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

export const OpenedLocalProject = (): React.Node => (
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

export const DisabledLocalProject = (): React.Node => (
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

export const CloudProject = (): React.Node => (
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

export const OpenedCloudProject = (): React.Node => (
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

export const DisabledCloudProject = (): React.Node => (
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

const buildDeletedCloudProjectDashboardItem = (
  deletedSinceInMs: number
): DashboardItem => {
  const deletedAt = new Date(Date.now() - deletedSinceInMs).toISOString();
  return {
    deletedCloudProject: {
      id: 'deleted-cloud-project-id',
      name: 'My deleted project',
      createdAt: '2023-01-01T10:00:00.000Z',
      updatedAt: deletedAt,
      deletedAt,
      lastModifiedAt: deletedAt,
    },
  };
};

// The restore button state mirrors what GamesList computes with
// `isProjectRestorable`: `onRestoreProject` is only passed when the project
// is still within the user's restoration time window (1 hour without a
// subscription, the whole retention period with one).
const DeletedCloudProjectCard = ({
  authenticatedUser,
  deletedSinceInMs,
  restorable,
}: {|
  authenticatedUser: typeof fakeSilverAuthenticatedUser,
  deletedSinceInMs: number,
  restorable: boolean,
|}) => (
  <AuthenticatedUserContext.Provider value={authenticatedUser}>
    <GameDashboardCard
      dashboardItem={buildDeletedCloudProjectDashboardItem(deletedSinceInMs)}
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
      onRestoreProject={
        restorable ? async () => action('onRestoreProject')() : undefined
      }
    />
  </AuthenticatedUserContext.Provider>
);

export const DeletedCloudProjectLastHourWithoutSubscription = (): React.Node => (
  <DeletedCloudProjectCard
    authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
    deletedSinceInMs={30 * 60 * 1000} // 30 minutes ago: still restorable.
    restorable
  />
);

export const DeletedCloudProjectLastHourWithSubscription = (): React.Node => (
  <DeletedCloudProjectCard
    authenticatedUser={fakeSilverAuthenticatedUser}
    deletedSinceInMs={30 * 60 * 1000} // 30 minutes ago.
    restorable
  />
);

export const DeletedCloudProjectLast30DaysWithoutSubscription = (): React.Node => (
  <DeletedCloudProjectCard
    authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
    deletedSinceInMs={10 * 24 * 3600 * 1000} // 10 days ago: the 1 hour window is over.
    restorable={false}
  />
);

export const DeletedCloudProjectLast30DaysWithSubscription = (): React.Node => (
  <DeletedCloudProjectCard
    authenticatedUser={fakeSilverAuthenticatedUser}
    deletedSinceInMs={10 * 24 * 3600 * 1000} // 10 days ago: restorable with a subscription.
    restorable
  />
);
