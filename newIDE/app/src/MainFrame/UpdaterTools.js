// @flow
// See ElectronEventsBridge, AboutDialog and electron-app/main.js for handling the updates.

export type UpdateStatus = {
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

export const getUpdateNotificationTitle = (
  updateStatus: UpdateStatus
): string => {
  if (updateStatus.status === 'update-available')
    return 'A new update is available!';

  return '';
};

export const getUpdateNotificationBody = (
  updateStatus: UpdateStatus
): string => {
  if (updateStatus.status === 'update-available')
    return 'It will be downloaded and installed automatically (unless you deactivated this in preferences)';

  return '';
};

export const getUpdateStatusLabel = (status: string): string => {
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

export const getUpdateButtonLabel = (status: string): string => {
  if (status === 'update-available') return 'Update GDevelop to latest version';
  return 'Check again for new updates';
};

export const canDownloadUpdate = (status: string): boolean => {
  return status === 'update-available';
};
