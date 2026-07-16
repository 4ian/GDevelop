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
  areProjectFilesSameAsMemory: () => Promise<boolean>,
  onProjectFilesChanged: (
    dismissSignal: AbortSignal,
    dismissDialog: () => void
  ) => Promise<void> | void,
|};

export const showLocalProjectFilesChangedDialog = async ({
  showConfirmation,
  onReloadProject,
  onBackupProject,
  dismissSignal,
  dismissDialog,
}: {|
  showConfirmation: ShowConfirmFunction,
  onReloadProject: () => Promise<void>,
  onBackupProject: () => Promise<void>,
  dismissSignal?: AbortSignal,
  dismissDialog?: () => void,
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
    // Reloading makes this warning obsolete. Explicitly terminate its
    // lifecycle now instead of waiting for another polling tick.
    if (dismissDialog) dismissDialog();
    await onReloadProject();
  } else if (shouldBackUpProject) {
    await onBackupProject();
  }
};

const useLocalProjectChangesWatcher = ({
  enabled,
  fileIdentifier,
  lastKnownModificationTime,
  areProjectFilesSameAsMemory,
  onProjectFilesChanged,
}: Props) => {
  const onProjectFilesChangedRef = React.useRef(onProjectFilesChanged);
  const areProjectFilesSameAsMemoryRef = React.useRef(
    areProjectFilesSameAsMemory
  );
  const baselineModificationTimeRef = React.useRef<?number>(
    lastKnownModificationTime
  );

  onProjectFilesChangedRef.current = onProjectFilesChanged;
  areProjectFilesSameAsMemoryRef.current = areProjectFilesSameAsMemory;

  React.useEffect(
    () => {
      if (!enabled || !fileIdentifier) return;

      baselineModificationTimeRef.current = lastKnownModificationTime;
    },
    [enabled, fileIdentifier, lastKnownModificationTime]
  );

  React.useEffect(
    () => {
      if (!enabled || !fileIdentifier) return;

      let isDisposed = false;
      let pendingDialogAbortController: ?AbortController = null;
      let latestPendingModificationTime: ?number = null;
      let isChecking = typeof baselineModificationTimeRef.current !== 'number';

      const initializeBaselineIfNeeded = async () => {
        if (typeof baselineModificationTimeRef.current === 'number') return;
        try {
          baselineModificationTimeRef.current = await getLocalProjectLastModifiedDate(
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
          if (isDisposed) return;

          const activeDialogAbortController = pendingDialogAbortController;
          if (activeDialogAbortController) {
            if (typeof latestModificationTime === 'number') {
              latestPendingModificationTime = latestModificationTime;
            }
            let projectFilesSameAsMemory = false;
            try {
              projectFilesSameAsMemory = await areProjectFilesSameAsMemoryRef.current();
            } catch (error) {
              console.warn(
                'Unable to compare local project files with the in-memory project:',
                error
              );
            }
            if (
              isDisposed ||
              pendingDialogAbortController !== activeDialogAbortController
            ) {
              return;
            }

            if (projectFilesSameAsMemory) {
              // Only a full content comparison can prove that the warning is
              // no longer needed. Modification times are used solely to
              // detect that a comparison should begin.
              const matchingModificationTime =
                typeof latestModificationTime === 'number'
                  ? latestModificationTime
                  : latestPendingModificationTime;
              if (typeof matchingModificationTime === 'number') {
                baselineModificationTimeRef.current = matchingModificationTime;
              }
              latestPendingModificationTime = null;
              activeDialogAbortController.abort();
            }
            return;
          }

          if (typeof latestModificationTime !== 'number') return;

          const currentBaselineModificationTime =
            baselineModificationTimeRef.current;
          if (typeof currentBaselineModificationTime !== 'number') {
            baselineModificationTimeRef.current = latestModificationTime;
            return;
          }

          if (latestModificationTime <= currentBaselineModificationTime) return;

          latestPendingModificationTime = latestModificationTime;

          const dialogAbortController = new AbortController();
          pendingDialogAbortController = dialogAbortController;
          (async () => {
            try {
              await onProjectFilesChangedRef.current(
                dialogAbortController.signal,
                () => dialogAbortController.abort()
              );
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
                  typeof modificationTimeToAcknowledge === 'number'
                ) {
                  // A user dismissal acknowledges every disk version observed
                  // while the dialog was open, avoiding duplicate warnings.
                  baselineModificationTimeRef.current = modificationTimeToAcknowledge;
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
    [enabled, fileIdentifier]
  );
};

export default useLocalProjectChangesWatcher;
