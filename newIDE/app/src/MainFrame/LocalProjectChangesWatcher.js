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
  onProjectFilesChanged: (dismissSignal: AbortSignal) => Promise<void> | void,
|};

export const showLocalProjectFilesChangedDialog = async ({
  showConfirmation,
  onReloadProject,
  onBackupProject,
  dismissSignal,
}: {|
  showConfirmation: ShowConfirmFunction,
  onReloadProject: () => Promise<void>,
  onBackupProject: () => Promise<void>,
  dismissSignal?: AbortSignal,
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
    dismissOnAbortSignal: dismissSignal,
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
      let isChecking = typeof baselineModificationTime !== 'number';
      let pendingDialogAbortController: ?AbortController = null;
      let latestPendingModificationTime: ?number = null;
      let shouldAcknowledgePendingChanges = true;

      const initializeBaselineIfNeeded = async () => {
        if (typeof baselineModificationTime === 'number') return;
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
          if (isDisposed || typeof latestModificationTime !== 'number') return;

          const currentBaselineModificationTime = baselineModificationTime;
          if (typeof currentBaselineModificationTime !== 'number') {
            baselineModificationTime = latestModificationTime;
            return;
          }

          if (latestModificationTime <= currentBaselineModificationTime) {
            if (pendingDialogAbortController) {
              // The disk is no longer ahead of the editor. Close the warning
              // without acknowledging a modification that was reverted.
              shouldAcknowledgePendingChanges = false;
              pendingDialogAbortController.abort();
            }
            return;
          }

          const previousPendingModificationTime = latestPendingModificationTime;
          latestPendingModificationTime =
            typeof previousPendingModificationTime === 'number'
              ? Math.max(
                  previousPendingModificationTime,
                  latestModificationTime
                )
              : latestModificationTime;
          if (pendingDialogAbortController) {
            // Keep the current dialog open while polling continues. Any newer
            // disk version will be acknowledged if the user dismisses it.
            return;
          }

          const dialogAbortController = new AbortController();
          pendingDialogAbortController = dialogAbortController;
          shouldAcknowledgePendingChanges = true;
          (async () => {
            try {
              await onProjectFilesChanged(dialogAbortController.signal);
            } catch (error) {
              console.warn(
                'Unable to handle local project files changes:',
                error
              );
            } finally {
              if (pendingDialogAbortController === dialogAbortController) {
                const modificationTimeToAcknowledge = latestPendingModificationTime;
                if (
                  !isDisposed &&
                  shouldAcknowledgePendingChanges &&
                  typeof modificationTimeToAcknowledge === 'number'
                ) {
                  // A user dismissal acknowledges every disk version observed
                  // while the dialog was open, avoiding duplicate warnings.
                  baselineModificationTime = modificationTimeToAcknowledge;
                }
                pendingDialogAbortController = null;
                latestPendingModificationTime = null;
              }
            }
          })();
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
        if (pendingDialogAbortController) {
          pendingDialogAbortController.abort();
        }
        clearInterval(intervalId);
      };
    },
    [enabled, fileIdentifier, lastKnownModificationTime, onProjectFilesChanged]
  );
};

export default useLocalProjectChangesWatcher;
