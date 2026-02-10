// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { FileToCloudProjectResourceUploader } from '../../../ResourcesList/FileToCloudProjectResourceUploader';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';
import UrlStorageProvider from '../../../ProjectsStorage/UrlStorageProvider';
import paperDecorator from '../../PaperDecorator';
import GDevelopJsInitializerDecorator from '../../GDevelopJsInitializerDecorator';
import {
  fakeSilverAuthenticatedUser,
  fakeNotAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

const gd: libGDevelop = global.gd;

export default {
  title: 'ResourcesList/FileToCloudProjectResourceUploader',
  component: FileToCloudProjectResourceUploader,
  decorators: [paperDecorator, GDevelopJsInitializerDecorator],
};

export const Default = (): React.Node => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <FileToCloudProjectResourceUploader
      createNewResource={() => new gd.ImageResource()}
      onChooseResources={action('onChooseResources')}
      options={{
        initialSourceName: 'unused',
        multiSelection: true,
        resourceKind: 'image',
      }}
      fileMetadata={{ fileIdentifier: 'fake-identifier' }}
      getStorageProvider={() => CloudStorageProvider}
      automaticallyOpenInput={false}
    />
  </AuthenticatedUserContext.Provider>
);

export const AutomaticallyOpenInput = (): React.Node => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <FileToCloudProjectResourceUploader
      createNewResource={() => new gd.ImageResource()}
      onChooseResources={action('onChooseResources')}
      options={{
        initialSourceName: 'unused',
        multiSelection: true,
        resourceKind: 'image',
      }}
      fileMetadata={{ fileIdentifier: 'fake-identifier' }}
      getStorageProvider={() => CloudStorageProvider}
      automaticallyOpenInput
    />
  </AuthenticatedUserContext.Provider>
);

export const SingleFile = (): React.Node => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <FileToCloudProjectResourceUploader
      createNewResource={() => new gd.ImageResource()}
      onChooseResources={action('onChooseResources')}
      options={{
        initialSourceName: 'unused',
        multiSelection: false,
        resourceKind: 'image',
      }}
      fileMetadata={{ fileIdentifier: 'fake-identifier' }}
      getStorageProvider={() => CloudStorageProvider}
      automaticallyOpenInput={false}
    />
  </AuthenticatedUserContext.Provider>
);

export const IncompatibleStorageProvider = (): React.Node => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <FileToCloudProjectResourceUploader
      createNewResource={() => new gd.ImageResource()}
      onChooseResources={action('onChooseResources')}
      options={{
        initialSourceName: 'unused',
        multiSelection: true,
        resourceKind: 'image',
      }}
      fileMetadata={{ fileIdentifier: 'fake-identifier' }}
      getStorageProvider={() => UrlStorageProvider}
      automaticallyOpenInput={false}
    />
  </AuthenticatedUserContext.Provider>
);

export const NotAuthenticatedUser = (): React.Node => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <FileToCloudProjectResourceUploader
      createNewResource={() => new gd.ImageResource()}
      onChooseResources={action('onChooseResources')}
      options={{
        initialSourceName: 'unused',
        multiSelection: true,
        resourceKind: 'image',
      }}
      fileMetadata={{ fileIdentifier: 'fake-identifier' }}
      getStorageProvider={() => UrlStorageProvider}
      automaticallyOpenInput={false}
    />
  </AuthenticatedUserContext.Provider>
);
