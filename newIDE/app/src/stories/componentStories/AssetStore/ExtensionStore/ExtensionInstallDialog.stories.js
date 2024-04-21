// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import { testProject } from '../../../GDevelopJsInitializerDecorator';

import ExtensionInstallDialog from '../../../../AssetStore/ExtensionStore/ExtensionInstallDialog';
import {
  fireBulletExtensionShortHeader,
  fireBulletExtensionHeader,
  communityTierExtensionShortHeader,
  communityTierExtensionHeader,
  uncompatibleFireBulletExtensionShortHeader,
  alreadyInstalledExtensionShortHeader,
  alreadyInstalledCommunityExtensionShortHeader,
  newerVersionExtensionShortHeader,
} from '../../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'AssetStore/ExtensionStore/ExtensionInstallDialog',
  component: ExtensionInstallDialog,
  decorators: [paperDecorator],
};

const apiDataServerSideError = {
  mockData: [
    {
      url: `https://resources.gdevelop-app.com/extensions/FireBullet-header.json`,
      method: 'GET',
      status: 500,
      response: { data: 'status' },
    },
  ],
};

const apiDataFakeFireBulletExtension = {
  mockData: [
    {
      url: `https://resources.gdevelop-app.com/extensions/FireBullet-header.json`,
      method: 'GET',
      status: 200,
      response: fireBulletExtensionHeader,
    },
  ],
};

const apiDataFakeCommunityExtension = {
  mockData: [
    {
      url: `https://resources.gdevelop-app.com/extensions/FakeCommunityExtension-header.json`,
      method: 'GET',
      status: 200,
      response: communityTierExtensionHeader,
    },
  ],
};

export const Default = () => (
  <ExtensionInstallDialog
    project={testProject.project}
    extensionShortHeader={fireBulletExtensionShortHeader}
    isInstalling={false}
    onClose={action('close')}
    onInstall={() => Promise.resolve()}
    onEdit={action('edit')}
  />
);
Default.parameters = apiDataFakeFireBulletExtension;

export const BeingInstalled = () => (
  <ExtensionInstallDialog
    project={testProject.project}
    extensionShortHeader={fireBulletExtensionShortHeader}
    isInstalling={true}
    onClose={action('close')}
    onInstall={() => Promise.resolve()}
    onEdit={action('edit')}
  />
);
Default.parameters = apiDataFakeFireBulletExtension;

export const IncompatibleGdevelopVersion = () => (
  <ExtensionInstallDialog
    project={testProject.project}
    extensionShortHeader={uncompatibleFireBulletExtensionShortHeader}
    isInstalling={false}
    onClose={action('close')}
    onInstall={() => Promise.resolve()}
    onEdit={action('edit')}
  />
);
IncompatibleGdevelopVersion.parameters = apiDataFakeFireBulletExtension;

export const AlreadyInstalled = () => (
  <ExtensionInstallDialog
    project={testProject.project}
    extensionShortHeader={alreadyInstalledExtensionShortHeader}
    isInstalling={false}
    onClose={action('close')}
    onInstall={() => Promise.resolve()}
    onEdit={action('edit')}
  />
);
AlreadyInstalled.parameters = apiDataFakeFireBulletExtension;

export const Outdated = () => (
  <ExtensionInstallDialog
    project={testProject.project}
    extensionShortHeader={newerVersionExtensionShortHeader}
    isInstalling={false}
    onClose={action('close')}
    onInstall={() => Promise.resolve()}
    onEdit={action('edit')}
  />
);
Outdated.parameters = apiDataFakeFireBulletExtension;

export const AlreadyInstalledCommunityExtension = () => (
  <ExtensionInstallDialog
    project={testProject.project}
    extensionShortHeader={alreadyInstalledCommunityExtensionShortHeader}
    isInstalling={false}
    onClose={action('close')}
    onInstall={() => Promise.resolve()}
    onEdit={action('edit')}
  />
);
AlreadyInstalled.parameters = apiDataFakeFireBulletExtension;

export const WithServerSideError = () => (
  <ExtensionInstallDialog
    project={testProject.project}
    extensionShortHeader={fireBulletExtensionShortHeader}
    isInstalling={false}
    onClose={action('close')}
    onInstall={() => Promise.resolve()}
    onEdit={action('edit')}
  />
);
WithServerSideError.parameters = apiDataServerSideError;

export const CommunityExtension = () => (
  <ExtensionInstallDialog
    project={testProject.project}
    extensionShortHeader={communityTierExtensionShortHeader}
    isInstalling={false}
    onClose={action('close')}
    onInstall={() => Promise.resolve()}
    onEdit={action('edit')}
  />
);
CommunityExtension.parameters = apiDataFakeCommunityExtension;
