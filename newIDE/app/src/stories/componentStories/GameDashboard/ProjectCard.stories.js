// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import ProjectCard from '../../../GameDashboard/ProjectCard';
import {
  fakeFileMetadataAndStorageProviderNameForCloudProject,
  fakeFileMetadataAndStorageProviderNameForLocalProject,
  fakeSilverAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';
import LocalFileStorageProvider from '../../../ProjectsStorage/LocalFileStorageProvider';

export default {
  title: 'GameDashboard/ProjectCard',
  component: ProjectCard,
  decorators: [paperDecorator],
};

export const LocalProject = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <ProjectCard
      projectFileMetadataAndStorageProviderName={
        fakeFileMetadataAndStorageProviderNameForLocalProject
      }
      isCurrentProjectOpened={false}
      onOpenProject={action('onOpenProject')}
      askToCloseProject={action('askToCloseProject')}
      closeProject={action('closeProject')}
      onRefreshGames={action('onRefreshGames')}
      disabled={false}
      currentFileMetadata={null}
      lastModifiedInfo={null}
      storageProviders={[LocalFileStorageProvider, CloudStorageProvider]}
    />
  </AuthenticatedUserContext.Provider>
);

export const OpenedLocalProject = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <ProjectCard
      projectFileMetadataAndStorageProviderName={
        fakeFileMetadataAndStorageProviderNameForLocalProject
      }
      isCurrentProjectOpened
      onOpenProject={action('onOpenProject')}
      askToCloseProject={action('askToCloseProject')}
      closeProject={action('closeProject')}
      onRefreshGames={action('onRefreshGames')}
      disabled={false}
      currentFileMetadata={
        fakeFileMetadataAndStorageProviderNameForLocalProject.fileMetadata
      }
      lastModifiedInfo={null}
      storageProviders={[LocalFileStorageProvider, CloudStorageProvider]}
    />
  </AuthenticatedUserContext.Provider>
);

export const DisabledLocalProject = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <ProjectCard
      projectFileMetadataAndStorageProviderName={
        fakeFileMetadataAndStorageProviderNameForLocalProject
      }
      isCurrentProjectOpened
      onOpenProject={action('onOpenProject')}
      askToCloseProject={action('askToCloseProject')}
      closeProject={action('closeProject')}
      onRefreshGames={action('onRefreshGames')}
      disabled
      currentFileMetadata={
        fakeFileMetadataAndStorageProviderNameForLocalProject.fileMetadata
      }
      lastModifiedInfo={null}
      storageProviders={[LocalFileStorageProvider, CloudStorageProvider]}
    />
  </AuthenticatedUserContext.Provider>
);

export const CloudProject = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <ProjectCard
      projectFileMetadataAndStorageProviderName={
        fakeFileMetadataAndStorageProviderNameForCloudProject
      }
      isCurrentProjectOpened={false}
      onOpenProject={action('onOpenProject')}
      askToCloseProject={action('askToCloseProject')}
      closeProject={action('closeProject')}
      onRefreshGames={action('onRefreshGames')}
      disabled={false}
      currentFileMetadata={null}
      lastModifiedInfo={null}
      storageProviders={[LocalFileStorageProvider, CloudStorageProvider]}
    />
  </AuthenticatedUserContext.Provider>
);

export const OpenedCloudProject = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <ProjectCard
      projectFileMetadataAndStorageProviderName={
        fakeFileMetadataAndStorageProviderNameForCloudProject
      }
      isCurrentProjectOpened
      onOpenProject={action('onOpenProject')}
      askToCloseProject={action('askToCloseProject')}
      closeProject={action('closeProject')}
      onRefreshGames={action('onRefreshGames')}
      disabled={false}
      currentFileMetadata={
        fakeFileMetadataAndStorageProviderNameForCloudProject.fileMetadata
      }
      lastModifiedInfo={null}
      storageProviders={[LocalFileStorageProvider, CloudStorageProvider]}
    />
  </AuthenticatedUserContext.Provider>
);

export const DisabledCloudProject = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <ProjectCard
      projectFileMetadataAndStorageProviderName={
        fakeFileMetadataAndStorageProviderNameForCloudProject
      }
      isCurrentProjectOpened
      onOpenProject={action('onOpenProject')}
      askToCloseProject={action('askToCloseProject')}
      closeProject={action('closeProject')}
      onRefreshGames={action('onRefreshGames')}
      disabled
      currentFileMetadata={
        fakeFileMetadataAndStorageProviderNameForCloudProject.fileMetadata
      }
      lastModifiedInfo={null}
      storageProviders={[LocalFileStorageProvider, CloudStorageProvider]}
    />
  </AuthenticatedUserContext.Provider>
);
