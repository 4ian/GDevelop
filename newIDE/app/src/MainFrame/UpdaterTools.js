// @flow
// See ElectronEventsBridge, AboutDialog and electron-app/main.js for handling the updates.

import { Trans } from '@lingui/macro';
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
};

export const getElectronUpdateNotificationTitle = (
  updateStatus: ElectronUpdateStatus
) => {
  if (updateStatus.status === 'update-available')
    return 'A new update is available!';

  return '';
};

export const getElectronUpdateNotificationBody = (
  updateStatus: ElectronUpdateStatus
) => {
  if (updateStatus.status === 'update-available')
    return 'It will be downloaded and installed automatically (unless you deactivated this in preferences)';

  return '';
};

export const getElectronUpdateStatusLabel = (status: string) => {
  if (status === 'checking-for-update') return 'Checking for update...';
  if (status === 'update-available') return 'A new update is available!';
  if (status === 'update-not-available')
    return "No update available. You're using the latest version!";
  if (status === 'error') return 'Error while checking update';
  if (status === 'download-progress')
    return 'A new update is being downloaded...';
  if (status === 'update-downloaded')
    return 'A new update will be installed after you quit and relaunch GDevelop';
  return '';
};

export const getElectronUpdateButtonLabel = (status: string) => {
  if (status === 'update-available') return 'Update GDevelop to latest version';
  return 'Check again for new updates';
};

export const canDownloadElectronUpdate = (status: string) => {
  return status === 'update-available';
};

type ServiceWorkerUpdateStatus =
  | 'unknown'
  | 'not-installed'
  | 'installed'
  | 'update-installing'
  | 'update-ready';

export const useServiceWorkerUpdateStatus = () => {
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
) => {
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
