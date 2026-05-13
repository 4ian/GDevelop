// @flow
// See ElectronEventsBridge, AboutDialog and electron-app/main.js for handling the updates.

import { Trans, t } from '@lingui/macro';
import { type I18n } from '@lingui/core';
import React from 'react';

export type ElectronUpdateStatus = {
  message: string,
  status:
    | 'checking-for-update'
    | 'update-available'
    | 'update-not-available'
    | 'error'
    | 'download-progress'
    | 'update-downloaded'
    | 'unknown',
  info?: {| version?: string |},
};

export const getElectronUpdateNotificationTitle = (
  updateStatus: ElectronUpdateStatus,
  i18n: I18n
): string => {
  if (updateStatus.status === 'update-available')
    return i18n._(t`A new update is available!`);

  return '';
};

export const getElectronUpdateNotificationBody = (
  updateStatus: ElectronUpdateStatus,
  i18n: I18n,
  autoDownloadUpdates: boolean
): string => {
  if (updateStatus.status === 'update-available') {
    const version = updateStatus.info && updateStatus.info.version;
    if (autoDownloadUpdates) {
      return version
        ? i18n._(
            t`Version ${version} is available and will be downloaded and installed automatically.`
          )
        : i18n._(t`It will be downloaded and installed automatically.`);
    } else {
      return version
        ? i18n._(
            t`Version ${version} is available. Open About to download and install it.`
          )
        : i18n._(t`Open About to download and install it.`);
    }
  }

  return '';
};

export const getElectronUpdateStatusLabel = (
  status: string
): string | React.Node => {
  if (status === 'checking-for-update')
    return <Trans>Checking for update...</Trans>;
  if (status === 'update-available')
    return <Trans>A new update is available!</Trans>;
  if (status === 'update-not-available')
    return <Trans>No update available. You're using the latest version!</Trans>;
  if (status === 'error') return <Trans>Error while checking update</Trans>;
  if (status === 'download-progress')
    return <Trans>A new update is being downloaded...</Trans>;
  if (status === 'update-downloaded')
    return (
      <Trans>
        A new update will be installed after you quit and relaunch GDevelop
      </Trans>
    );
  return '';
};

export const getElectronUpdateButtonLabel = (status: string): React.Node => {
  if (status === 'update-available')
    return <Trans>Update GDevelop to latest version</Trans>;
  return <Trans>Check again for new updates</Trans>;
};

export const canDownloadElectronUpdate = (status: string): boolean => {
  return status === 'update-available';
};

type ServiceWorkerUpdateStatus =
  | 'unknown'
  | 'not-installed'
  | 'installed'
  | 'update-installing'
  | 'update-ready';

export const useServiceWorkerUpdateStatus = (): ServiceWorkerUpdateStatus => {
  const [
    serviceWorkerUpdateStatus,
    setServiceWorkerUpdateStatus,
  ] = React.useState<ServiceWorkerUpdateStatus>('unknown');

  React.useEffect(() => {
    (async () => {
      if (navigator.serviceWorker) {
        const { serviceWorker } = navigator;
        const alreadyHasServiceWorkerInstalled = !!serviceWorker.controller;
        setServiceWorkerUpdateStatus(
          alreadyHasServiceWorkerInstalled ? 'installed' : 'not-installed'
        );

        const registration = await serviceWorker.getRegistration();
        if (registration) {
          const installingWorker = registration.installing;
          if (installingWorker) {
            if (installingWorker.state === 'installed') {
              setServiceWorkerUpdateStatus('update-ready');
            } else {
              setServiceWorkerUpdateStatus('update-installing');
            }
          }
        }
      }
    })();
  }, []);

  return serviceWorkerUpdateStatus;
};

export const getServiceWorkerStatusLabel = (
  status: ServiceWorkerUpdateStatus
): React.Node => {
  if (status === 'not-installed') {
    return <Trans>Not installed as an app. No updates available.</Trans>;
  } else if (status === 'installed') {
    return <Trans>Installed as an app. No updates available.</Trans>;
  } else if (status === 'update-installing') {
    return <Trans>An update is installing.</Trans>;
  } else if (status === 'update-ready') {
    return (
      <Trans>
        An update is ready to be installed. Close ALL GDevelop apps or tabs in
        your browser, then open it again.
      </Trans>
    );
  }

  return <Trans>Unknown status.</Trans>;
};
