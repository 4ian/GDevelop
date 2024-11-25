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
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

export default {
  title: 'Project Creation/NewProjectSetupDialog',
  component: NewProjectSetupDialog,
  decorators: [paperDecorator],
};

export const OpenAndNotAuthenticated = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
      <NewProjectSetupDialog
        storageProviders={[
          UrlStorageProvider,
          CloudStorageProvider,
          GoogleDriveStorageProvider,
          DownloadFileStorageProvider,
        ]}
        onClose={() => action('click on close')()}
        onCreateEmptyProject={() => action('create empty')()}
        onCreateFromExample={() => action('create from example')()}
        onCreateFromAIGeneration={() => action('create from AI generation')()}
        onCreateProjectFromPrivateGameTemplate={() =>
          action('create project from private game template')()
        }
        selectedExampleShortHeader={null}
        selectedPrivateGameTemplateListingData={null}
        onSelectExampleShortHeader={() => action('select example')()}
        onSelectPrivateGameTemplateListingData={() =>
          action('select private game template')()
        }
        privateGameTemplateListingDatasFromSameCreator={[]}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const OpenAndAuthenticated = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <NewProjectSetupDialog
        storageProviders={[
          UrlStorageProvider,
          CloudStorageProvider,
          GoogleDriveStorageProvider,
          DownloadFileStorageProvider,
        ]}
        onClose={() => action('click on close')()}
        onCreateEmptyProject={() => action('create empty')()}
        onCreateFromExample={() => action('create from example')()}
        onCreateFromAIGeneration={() => action('create from AI generation')()}
        onCreateProjectFromPrivateGameTemplate={() =>
          action('create project from private game template')()
        }
        selectedExampleShortHeader={null}
        selectedPrivateGameTemplateListingData={null}
        onSelectExampleShortHeader={() => action('select example')()}
        onSelectPrivateGameTemplateListingData={() =>
          action('select private game template')()
        }
        privateGameTemplateListingDatasFromSameCreator={[]}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const Opening = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <NewProjectSetupDialog
        isProjectOpening
        storageProviders={[
          UrlStorageProvider,
          CloudStorageProvider,
          GoogleDriveStorageProvider,
          DownloadFileStorageProvider,
        ]}
        onClose={() => action('click on close')()}
        onCreateEmptyProject={() => action('create empty')()}
        onCreateFromExample={() => action('create from example')()}
        onCreateFromAIGeneration={() => action('create from AI generation')()}
        onCreateProjectFromPrivateGameTemplate={() =>
          action('create project from private game template')()
        }
        selectedExampleShortHeader={null}
        selectedPrivateGameTemplateListingData={null}
        onSelectExampleShortHeader={() => action('select example')()}
        onSelectPrivateGameTemplateListingData={() =>
          action('select private game template')()
        }
        privateGameTemplateListingDatasFromSameCreator={[]}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const LimitsReached = () => {
  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithNoSubscriptionAndTooManyCloudProjects}
    >
      <NewProjectSetupDialog
        storageProviders={[
          CloudStorageProvider,
          UrlStorageProvider,
          GoogleDriveStorageProvider,
          DownloadFileStorageProvider,
        ]}
        onClose={() => action('click on close')()}
        onCreateEmptyProject={() => action('create empty')()}
        onCreateFromExample={() => action('create from example')()}
        onCreateFromAIGeneration={() => action('create from AI generation')()}
        onCreateProjectFromPrivateGameTemplate={() =>
          action('create project from private game template')()
        }
        selectedExampleShortHeader={null}
        selectedPrivateGameTemplateListingData={null}
        onSelectExampleShortHeader={() => action('select example')()}
        onSelectPrivateGameTemplateListingData={() =>
          action('select private game template')()
        }
        privateGameTemplateListingDatasFromSameCreator={[]}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const FromExample = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <NewProjectSetupDialog
        storageProviders={[
          UrlStorageProvider,
          CloudStorageProvider,
          GoogleDriveStorageProvider,
          DownloadFileStorageProvider,
        ]}
        onClose={() => action('click on close')()}
        onCreateEmptyProject={() => action('create empty')()}
        onCreateFromExample={() => action('create from example')()}
        onCreateFromAIGeneration={() => action('create from AI generation')()}
        selectedExampleShortHeader={geometryMonsterExampleShortHeader}
        onCreateProjectFromPrivateGameTemplate={() =>
          action('create project from private game template')()
        }
        selectedPrivateGameTemplateListingData={null}
        onSelectExampleShortHeader={() => action('select example')()}
        onSelectPrivateGameTemplateListingData={() =>
          action('select private game template')()
        }
        privateGameTemplateListingDatasFromSameCreator={[]}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const FromExampleWithoutGoingBack = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <NewProjectSetupDialog
        storageProviders={[
          UrlStorageProvider,
          CloudStorageProvider,
          GoogleDriveStorageProvider,
          DownloadFileStorageProvider,
        ]}
        onClose={() => action('click on close')()}
        onCreateEmptyProject={() => action('create empty')()}
        onCreateFromExample={() => action('create from example')()}
        onCreateFromAIGeneration={() => action('create from AI generation')()}
        selectedExampleShortHeader={geometryMonsterExampleShortHeader}
        onCreateProjectFromPrivateGameTemplate={() =>
          action('create project from private game template')()
        }
        selectedPrivateGameTemplateListingData={null}
        onSelectExampleShortHeader={() => action('select example')()}
        onSelectPrivateGameTemplateListingData={() =>
          action('select private game template')()
        }
        privateGameTemplateListingDatasFromSameCreator={[]}
        preventBackHome
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const FromPrivateGameTemplate = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <NewProjectSetupDialog
        storageProviders={[
          UrlStorageProvider,
          CloudStorageProvider,
          GoogleDriveStorageProvider,
          DownloadFileStorageProvider,
        ]}
        onClose={() => action('click on close')()}
        onCreateEmptyProject={() => action('create empty')()}
        onCreateFromExample={() => action('create from example')()}
        onCreateFromAIGeneration={() => action('create from AI generation')()}
        selectedExampleShortHeader={null}
        onCreateProjectFromPrivateGameTemplate={() =>
          action('create project from private game template')()
        }
        selectedPrivateGameTemplateListingData={
          fakePrivateGameTemplateListingData
        }
        onSelectExampleShortHeader={() => action('select example')()}
        onSelectPrivateGameTemplateListingData={() =>
          action('select private game template')()
        }
        privateGameTemplateListingDatasFromSameCreator={[]}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const FromPrivateGameTemplateWithoutGoingBack = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <NewProjectSetupDialog
        storageProviders={[
          UrlStorageProvider,
          CloudStorageProvider,
          GoogleDriveStorageProvider,
          DownloadFileStorageProvider,
        ]}
        onClose={() => action('click on close')()}
        onCreateEmptyProject={() => action('create empty')()}
        onCreateFromExample={() => action('create from example')()}
        onCreateFromAIGeneration={() => action('create from AI generation')()}
        selectedExampleShortHeader={null}
        onCreateProjectFromPrivateGameTemplate={() =>
          action('create project from private game template')()
        }
        selectedPrivateGameTemplateListingData={
          fakePrivateGameTemplateListingData
        }
        onSelectExampleShortHeader={() => action('select example')()}
        onSelectPrivateGameTemplateListingData={() =>
          action('select private game template')()
        }
        privateGameTemplateListingDatasFromSameCreator={[]}
        preventBackHome
      />
    </AuthenticatedUserContext.Provider>
  );
};
