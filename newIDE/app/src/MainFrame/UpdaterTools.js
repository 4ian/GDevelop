// @flow
// See ElectronEventsBridge, AboutDialog and electron-app/main.js for handling the updates.

import { t, Trans } from '@lingui/macro';
import React from 'react';
import useAlertDialog from '../UI/Alert/useAlertDialog';

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

export const useServiceWorkerCheckAndAskToUpdate = () => {
  const serviceWorkerUpdateStatus = useServiceWorkerUpdateStatus();
  const { showConfirmation, showAlert } = useAlertDialog();
  React.useEffect(
    () => {
      if (serviceWorkerUpdateStatus === 'update-ready') {
        const timeoutId = setTimeout(() => {
          (async () => {
            const answer = await showConfirmation({
              title: t`New update available!`,
              message: t`A new version of GDevelop is available. Would you like to update now? The app will be reloaded.`,
            });
            if (answer) {
              try {
                await clearServiceWorkerAndForceReload();
              } catch (error) {
                console.error('Unable to update service worker', error);
                await showAlert({
                  title: t`Unable to update`,
                  message: t`Unable to update the app. Please close all your tabs and try again.`,
                });
              }
            }
          })();
        }, 3000); // Let a bit of time for the app to load before showing the update dialog.
        return () => clearTimeout(timeoutId);
      }
    },
    [serviceWorkerUpdateStatus, showConfirmation, showAlert]
  );
};

const clearServiceWorkerAndForceReload = async () => {
  const { serviceWorker } = navigator;
  if (!serviceWorker) {
    throw new Error('Service worker not available');
  }
  const registration = await serviceWorker.getRegistration();
  if (!registration) {
    throw new Error('Service worker registration not available');
  }
  await registration.unregister();
  const cacheKeys = await caches.keys();
  await Promise.all(cacheKeys.map(key => caches.delete(key)));
  window.location.reload();
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
