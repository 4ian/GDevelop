// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import NewProjectSetupDialog from '../../../ProjectCreation/NewProjectSetupDialog';
import GoogleDriveStorageProvider from '../../../ProjectsStorage/GoogleDriveStorageProvider';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';
import UrlStorageProvider from '../../../ProjectsStorage/UrlStorageProvider';
import DownloadFileStorageProvider from '../../../ProjectsStorage/DownloadFileStorageProvider';
import {
  fakeSilverAuthenticatedUser,
  fakeAuthenticatedUserWithNoSubscriptionAndTooManyCloudProjects,
  fakeNotAuthenticatedUser,
  geometryMonsterExampleShortHeader,
  fakePrivateGameTemplateListingData,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Project Creation/NewProjectSetupDialog',
  component: NewProjectSetupDialog,
  decorators: [paperDecorator],
};

export const OpenAndNotAuthenticated = () => {
  return (
    <NewProjectSetupDialog
      authenticatedUser={fakeNotAuthenticatedUser}
      storageProviders={[
        UrlStorageProvider,
        CloudStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onClose={() => action('click on close')()}
      onCreateEmptyProject={() => action('create empty')()}
      onCreateFromExample={() => action('create from example')()}
      onCreateWithLogin={() => action('create with login')()}
      onCreateFromAIGeneration={() => action('create from AI generation')()}
      onCreateProjectFromPrivateGameTemplate={() =>
        action('create project from private game template')()
      }
      selectedExampleShortHeader={null}
      selectedPrivateGameTemplateListingData={null}
    />
  );
};

export const OpenAndAuthenticated = () => {
  return (
    <NewProjectSetupDialog
      authenticatedUser={fakeSilverAuthenticatedUser}
      storageProviders={[
        UrlStorageProvider,
        CloudStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onClose={() => action('click on close')()}
      onCreateEmptyProject={() => action('create empty')()}
      onCreateFromExample={() => action('create from example')()}
      onCreateWithLogin={() => action('create with login')()}
      onCreateFromAIGeneration={() => action('create from AI generation')()}
      onCreateProjectFromPrivateGameTemplate={() =>
        action('create project from private game template')()
      }
      selectedExampleShortHeader={null}
      selectedPrivateGameTemplateListingData={null}
    />
  );
};

export const Opening = () => {
  return (
    <NewProjectSetupDialog
      authenticatedUser={fakeSilverAuthenticatedUser}
      isOpeningProject
      storageProviders={[
        UrlStorageProvider,
        CloudStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onClose={() => action('click on close')()}
      onCreateEmptyProject={() => action('create empty')()}
      onCreateFromExample={() => action('create from example')()}
      onCreateWithLogin={() => action('create with login')()}
      onCreateFromAIGeneration={() => action('create from AI generation')()}
      onCreateProjectFromPrivateGameTemplate={() =>
        action('create project from private game template')()
      }
      selectedExampleShortHeader={null}
      selectedPrivateGameTemplateListingData={null}
    />
  );
};

export const LimitsReached = () => {
  return (
    <NewProjectSetupDialog
      authenticatedUser={
        fakeAuthenticatedUserWithNoSubscriptionAndTooManyCloudProjects
      }
      storageProviders={[
        CloudStorageProvider,
        UrlStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onClose={() => action('click on close')()}
      onCreateEmptyProject={() => action('create empty')()}
      onCreateFromExample={() => action('create from example')()}
      onCreateWithLogin={() => action('create with login')()}
      onCreateFromAIGeneration={() => action('create from AI generation')()}
      onCreateProjectFromPrivateGameTemplate={() =>
        action('create project from private game template')()
      }
      selectedExampleShortHeader={null}
      selectedPrivateGameTemplateListingData={null}
    />
  );
};

export const FromExample = () => {
  return (
    <NewProjectSetupDialog
      authenticatedUser={fakeSilverAuthenticatedUser}
      storageProviders={[
        UrlStorageProvider,
        CloudStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onClose={() => action('click on close')()}
      onCreateEmptyProject={() => action('create empty')()}
      onCreateFromExample={() => action('create from example')()}
      onCreateWithLogin={() => action('create with login')()}
      onCreateFromAIGeneration={() => action('create from AI generation')()}
      selectedExampleShortHeader={geometryMonsterExampleShortHeader}
      onCreateProjectFromPrivateGameTemplate={() =>
        action('create project from private game template')()
      }
      selectedPrivateGameTemplateListingData={null}
    />
  );
};

export const FromPrivateGameTemplate = () => {
  return (
    <NewProjectSetupDialog
      authenticatedUser={fakeSilverAuthenticatedUser}
      storageProviders={[
        UrlStorageProvider,
        CloudStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onClose={() => action('click on close')()}
      onCreateEmptyProject={() => action('create empty')()}
      onCreateFromExample={() => action('create from example')()}
      onCreateWithLogin={() => action('create with login')()}
      onCreateFromAIGeneration={() => action('create from AI generation')()}
      selectedExampleShortHeader={null}
      onCreateProjectFromPrivateGameTemplate={() =>
        action('create project from private game template')()
      }
      selectedPrivateGameTemplateListingData={
        fakePrivateGameTemplateListingData
      }
    />
  );
};
