// @flow

import * as React from 'react';

import { action } from '@storybook/addon-actions';

import SaveToStorageProviderDialog from '../../../ProjectsStorage/SaveToStorageProviderDialog';
import GoogleDriveStorageProvider from '../../../ProjectsStorage/GoogleDriveStorageProvider';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';
import UrlStorageProvider from '../../../ProjectsStorage/UrlStorageProvider';
import DownloadFileStorageProvider from '../../../ProjectsStorage/DownloadFileStorageProvider';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import {
  fakeNotAuthenticatedUser,
  fakeAuthenticatedUserWithEmailVerified,
  tenCloudProjects,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Storage Providers/Writers/SaveToStorageProviderDialog',
  component: SaveToStorageProviderDialog,
};

export const UserNotAuthenticated = () => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <SaveToStorageProviderDialog
      storageProviders={[
        UrlStorageProvider,
        CloudStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onChooseProvider={action('onChooseProvider')}
      onClose={action('onClose')}
    />
  </AuthenticatedUserContext.Provider>
);

export const UserAuthenticatedWithEnoughStorage = () => (
  <AuthenticatedUserContext.Provider
    value={fakeAuthenticatedUserWithEmailVerified}
  >
    <SaveToStorageProviderDialog
      storageProviders={[
        UrlStorageProvider,
        CloudStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onChooseProvider={action('onChooseProvider')}
      onClose={action('onClose')}
    />
  </AuthenticatedUserContext.Provider>
);

export const UserAuthenticatedWithNotEnoughStorage = () => (
  <AuthenticatedUserContext.Provider
    value={{
      ...fakeAuthenticatedUserWithEmailVerified,
      cloudProjects: tenCloudProjects,
    }}
  >
    <SaveToStorageProviderDialog
      storageProviders={[
        UrlStorageProvider,
        CloudStorageProvider,
        GoogleDriveStorageProvider,
        DownloadFileStorageProvider,
      ]}
      onChooseProvider={action('onChooseProvider')}
      onClose={action('onClose')}
    />
  </AuthenticatedUserContext.Provider>
);
