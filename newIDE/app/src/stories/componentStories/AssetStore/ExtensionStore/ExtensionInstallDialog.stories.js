// @flow
import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import { testProject } from '../../../GDevelopJsInitializerDecorator';
import AlertProvider from '../../../../UI/Alert/AlertProvider';
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
import { cdnClient } from '../../../../Utils/GDevelopServices/Extension';

export default {
  title: 'AssetStore/ExtensionStore/ExtensionInstallDialog',
  component: ExtensionInstallDialog,
  decorators: [paperDecorator],
};

export const Default = () => {
  const extensionCdnMock = React.useMemo(() => {
    const mock = new MockAdapter(cdnClient, {
      delayResponse: 250,
    });

    mock
      .onGet(
        'https://resources.gdevelop-app.com/extensions/FireBullet-header.json'
      )
      .reply(200, fireBulletExtensionHeader);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        extensionCdnMock.restore();
      };
    },
    [extensionCdnMock]
  );

  return (
    <AlertProvider>
      <ExtensionInstallDialog
        project={testProject.project}
        extensionShortHeader={fireBulletExtensionShortHeader}
        isInstalling={false}
        onClose={action('close')}
        onInstall={() => Promise.resolve()}
        onEdit={action('edit')}
      />
    </AlertProvider>
  );
};

export const BeingInstalled = () => {
  const extensionCdnMock = React.useMemo(() => {
    const mock = new MockAdapter(cdnClient, {
      delayResponse: 250,
    });

    mock
      .onGet(
        'https://resources.gdevelop-app.com/extensions/FireBullet-header.json'
      )
      .reply(200, fireBulletExtensionHeader);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        extensionCdnMock.restore();
      };
    },
    [extensionCdnMock]
  );

  return (
    <AlertProvider>
      <ExtensionInstallDialog
        project={testProject.project}
        extensionShortHeader={fireBulletExtensionShortHeader}
        isInstalling={true}
        onClose={action('close')}
        onInstall={() => Promise.resolve()}
        onEdit={action('edit')}
      />
    </AlertProvider>
  );
};

export const IncompatibleGdevelopVersion = () => {
  const extensionCdnMock = React.useMemo(() => {
    const mock = new MockAdapter(cdnClient, {
      delayResponse: 250,
    });

    mock
      .onGet(
        'https://resources.gdevelop-app.com/extensions/FireBullet-header.json'
      )
      .reply(200, fireBulletExtensionHeader);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        extensionCdnMock.restore();
      };
    },
    [extensionCdnMock]
  );

  return (
    <AlertProvider>
      <ExtensionInstallDialog
        project={testProject.project}
        extensionShortHeader={uncompatibleFireBulletExtensionShortHeader}
        isInstalling={false}
        onClose={action('close')}
        onInstall={() => Promise.resolve()}
        onEdit={action('edit')}
      />
    </AlertProvider>
  );
};

export const AlreadyInstalled = () => {
  const extensionCdnMock = React.useMemo(() => {
    const mock = new MockAdapter(cdnClient, {
      delayResponse: 250,
    });

    mock
      .onGet(
        'https://resources.gdevelop-app.com/extensions/FireBullet-header.json'
      )
      .reply(200, fireBulletExtensionHeader);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        extensionCdnMock.restore();
      };
    },
    [extensionCdnMock]
  );

  return (
    <AlertProvider>
      <ExtensionInstallDialog
        project={testProject.project}
        extensionShortHeader={alreadyInstalledExtensionShortHeader}
        isInstalling={false}
        onClose={action('close')}
        onInstall={() => Promise.resolve()}
        onEdit={action('edit')}
      />
    </AlertProvider>
  );
};

export const Outdated = () => {
  const extensionCdnMock = React.useMemo(() => {
    const mock = new MockAdapter(cdnClient, {
      delayResponse: 250,
    });

    mock
      .onGet(
        'https://resources.gdevelop-app.com/extensions/FireBullet-header.json'
      )
      .reply(200, fireBulletExtensionHeader);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        extensionCdnMock.restore();
      };
    },
    [extensionCdnMock]
  );

  return (
    <AlertProvider>
      <ExtensionInstallDialog
        project={testProject.project}
        extensionShortHeader={newerVersionExtensionShortHeader}
        isInstalling={false}
        onClose={action('close')}
        onInstall={() => Promise.resolve()}
        onEdit={action('edit')}
      />
    </AlertProvider>
  );
};

export const AlreadyInstalledCommunityExtension = () => {
  const extensionCdnMock = React.useMemo(() => {
    const mock = new MockAdapter(cdnClient, {
      delayResponse: 250,
    });

    mock
      .onGet(
        'https://resources.gdevelop-app.com/extensions/FireBullet-header.json'
      )
      .reply(200, fireBulletExtensionHeader);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        extensionCdnMock.restore();
      };
    },
    [extensionCdnMock]
  );

  return (
    <AlertProvider>
      <ExtensionInstallDialog
        project={testProject.project}
        extensionShortHeader={alreadyInstalledCommunityExtensionShortHeader}
        isInstalling={false}
        onClose={action('close')}
        onInstall={() => Promise.resolve()}
        onEdit={action('edit')}
      />
    </AlertProvider>
  );
};

export const WithServerSideError = () => {
  const extensionCdnMock = React.useMemo(() => {
    const mock = new MockAdapter(cdnClient, {
      delayResponse: 250,
    });

    mock
      .onGet(
        'https://resources.gdevelop-app.com/extensions/FireBullet-header.json'
      )
      .reply(500, { data: 'status' });

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        extensionCdnMock.restore();
      };
    },
    [extensionCdnMock]
  );

  return (
    <AlertProvider>
      <ExtensionInstallDialog
        project={testProject.project}
        extensionShortHeader={fireBulletExtensionShortHeader}
        isInstalling={false}
        onClose={action('close')}
        onInstall={() => Promise.resolve()}
        onEdit={action('edit')}
      />
    </AlertProvider>
  );
};

export const CommunityExtension = () => {
  const extensionCdnMock = React.useMemo(() => {
    const mock = new MockAdapter(cdnClient, {
      delayResponse: 250,
    });

    mock
      .onGet(
        'https://resources.gdevelop-app.com/extensions/FakeCommunityExtension-header.json'
      )
      .reply(200, communityTierExtensionHeader);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        extensionCdnMock.restore();
      };
    },
    [extensionCdnMock]
  );

  return (
    <AlertProvider>
      <ExtensionInstallDialog
        project={testProject.project}
        extensionShortHeader={communityTierExtensionShortHeader}
        isInstalling={false}
        onClose={action('close')}
        onInstall={() => Promise.resolve()}
        onEdit={action('edit')}
      />
    </AlertProvider>
  );
};
