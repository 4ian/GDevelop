// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import NewProjectSetupDialog from '../../../ProjectCreation/NewProjectSetupDialog';
import GoogleDriveStorageProvider from '../../../ProjectsStorage/GoogleDriveStorageProvider';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';
import UrlStorageProvider from '../../../ProjectsStorage/UrlStorageProvider';
import DownloadFileStorageProvider from '../../../ProjectsStorage/DownloadFileStorageProvider';
import {
  fakeIndieAuthenticatedUser,
  fakeNoSubscriptionAndTooManyCloudProjectsAuthenticatedUser,
  fakeNotAuthenticatedAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Project Creation/NewProjectSetupDialog',
  component: NewProjectSetupDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const OpenAndAuthenticated = () => {
  return (
    <NewProjectSetupDialog
      authenticatedUser={fakeIndieAuthenticatedUser}
      storageProviders={[
        UrlStorageProvider,
        CloudStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onClose={() => action('click on close')()}
      onCreate={() => action('click on create')()}
    />
  );
};

export const TooManyCloudProjects = () => {
  return (
    <NewProjectSetupDialog
      authenticatedUser={
        fakeNoSubscriptionAndTooManyCloudProjectsAuthenticatedUser
      }
      storageProviders={[
        CloudStorageProvider,
        UrlStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onClose={() => action('click on close')()}
      onCreate={() => action('click on create')()}
    />
  );
};

export const OpenAndNotAuthenticated = () => {
  return (
    <NewProjectSetupDialog
      authenticatedUser={fakeNotAuthenticatedAuthenticatedUser}
      storageProviders={[
        UrlStorageProvider,
        CloudStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onClose={() => action('click on close')()}
      onCreate={() => action('click on create')()}
    />
  );
};

export const Opening = () => {
  return (
    <NewProjectSetupDialog
      authenticatedUser={fakeIndieAuthenticatedUser}
      isOpening
      storageProviders={[
        UrlStorageProvider,
        CloudStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onClose={() => action('click on close')()}
      onCreate={() => action('click on create')()}
    />
  );
};
