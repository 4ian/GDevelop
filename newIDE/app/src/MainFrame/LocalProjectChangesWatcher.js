// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { getLocalProjectLastModifiedDate } from '../ProjectsStorage/LocalFileStorageProvider/LocalProjectFileModificationTime';
import { type ShowConfirmFunction } from '../UI/Alert/AlertContext';

export const LOCAL_PROJECT_CHANGES_POLL_INTERVAL = 5000;

type Props = {|
  enabled: boolean,
  fileIdentifier: ?string,
  lastKnownModificationTime: ?number,
  onProjectFilesChanged: () => Promise<void> | void,
|};

export const showLocalProjectFilesChangedDialog = async ({
  showConfirmation,
  onReloadProject,
  onBackupProject,
}: {|
  showConfirmation: ShowConfirmFunction,
  onReloadProject: () => Promise<void>,
  onBackupProject: () => Promise<void>,
|}): Promise<void> => {
  let shouldBackUpProject = false;
  const shouldReloadProject = await showConfirmation({
    title: t`Project files changed on disk`,
    message: t`This project was modified outside GDevelop. Reload it from disk to use the newer files, or back up the current in-memory project to another folder before continuing.`,
    confirmButtonLabel: t`Reload project`,
    secondaryActionButtonLabel: t`Back up to another folder`,
    dismissButtonLabel: t`Not now`,
    onClickSecondaryAction: () => {
      shouldBackUpProject = true;
    },
    level: 'warning',
    maxWidth: 'sm',
  });

  if (shouldReloadProject) {
    await onReloadProject();
  } else if (shouldBackUpProject) {
    await onBackupProject();
  }
};

const useLocalProjectChangesWatcher = ({
  enabled,
  fileIdentifier,
  lastKnownModificationTime,
  onProjectFilesChanged,
}: Props) => {
  React.useEffect(
    () => {
      if (!enabled || !fileIdentifier) return;

      let isDisposed = false;
      let baselineModificationTime = lastKnownModificationTime;
      let isChecking = baselineModificationTime === null;

      const initializeBaselineIfNeeded = async () => {
        if (baselineModificationTime !== null) return;
        try {
          baselineModificationTime = await getLocalProjectLastModifiedDate(
            fileIdentifier
          );
        } finally {
          isChecking = false;
        }
      };

      initializeBaselineIfNeeded().catch(error => {
        console.warn('Unable to initialize local project file watcher:', error);
      });

      const intervalId = setInterval(async () => {
        if (isDisposed || isChecking) return;
        isChecking = true;
        try {
          const latestModificationTime = await getLocalProjectLastModifiedDate(
            fileIdentifier
          );
          if (isDisposed || latestModificationTime === null) return;

          if (baselineModificationTime === null) {
            baselineModificationTime = latestModificationTime;
            return;
          }
          if (latestModificationTime <= baselineModificationTime) return;

          // Acknowledge this disk version before showing the dialog, so
          // dismissing it does not show the same warning every five seconds.
          baselineModificationTime = latestModificationTime;
          await onProjectFilesChanged();
        } catch (error) {
          console.warn(
            'Unable to check local project files for changes:',
            error
          );
        } finally {
          isChecking = false;
        }
      }, LOCAL_PROJECT_CHANGES_POLL_INTERVAL);

      return () => {
        isDisposed = true;
        clearInterval(intervalId);
      };
    },
    [enabled, fileIdentifier, lastKnownModificationTime, onProjectFilesChanged]
  );
};

export default useLocalProjectChangesWatcher;
