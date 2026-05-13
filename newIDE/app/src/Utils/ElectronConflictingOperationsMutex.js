// @flow

// There is a high chance of FS operations running while an Electron window is closing.
// We run into "Uncaught illegal access" errors from V8/Chrome/Electron on Electron when these
// FS operations are running while a BrowserWindow is destroyed (see WindowPortal).
// These "Uncaught illegal access" have no stacktrace, which seems to indicate a problem
// deep in Electron or related.
//
// We can't risk this.
//
// This modules prevents one or more FS operations to run concurrently with one or more window closing operations.

// All of this could maybe be removed:
// - When upgrading Electron.
// - If FS operations are moved entirely to the main process and the renderer process only uses
//   IPC to communicate with the main process.

let activeWindowOperations = new Set<string>();
let activeFsOperations = 0;

const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const logWithPrefix = (message: string): void => {
  console.info(`[ElectronConflictingOperationsMutex] ${message}`);
};

const logErrorWithPrefix = (message: string): void => {
  console.error(`[ElectronConflictingOperationsMutex] ${message}`);
};

export const safelyDoFsOperation = async <T>(
  fn: () => Promise<T>
): Promise<T> => {
  let hasWaitedForWindowClosing: Array<string> | null = null;
  if (activeWindowOperations.size > 0) {
    hasWaitedForWindowClosing = Array.from(activeWindowOperations);
    logWithPrefix(
      `Waiting for ${
        activeWindowOperations.size
      } window closing(s) (${hasWaitedForWindowClosing.join(
        ', '
      )}) to finish...`
    );
    while (activeWindowOperations.size > 0) {
      await delay(200);
    }
    // activeWindowOperations is now 0: don't delay and synchronously continue now.
  }

  // activeWindowOperations is now 0: it's safe to start a new fs operation.
  activeFsOperations++;
  if (hasWaitedForWindowClosing) {
    logWithPrefix(
      `FS operation can now start (waited for window closing(s): ${hasWaitedForWindowClosing.join(
        ', '
      )}).`
    );

    // Add a last delay to ensure the window operations are actually fully finished, even if useless in theory.
    // We've already signaled the FS operation is active, so it's safe to delay.
    await delay(100);
  }

  let isFinishedOrAbort = false;
  return new Promise((resolve, reject) => {
    const timeoutID = setTimeout(() => {
      if (isFinishedOrAbort) {
        // FS operation finished already - the timeout should have been cleared already, but all good that's the happy path.
        return;
      }

      // FS operation did not finish in 15 seconds - consider it aborted.
      logErrorWithPrefix(
        `FS operation did not finish in 15 seconds - considering it aborted.`
      );
      isFinishedOrAbort = true;
      activeFsOperations--;
      reject(new Error('FS operation aborted after 15 seconds.'));
    }, 15000);

    // Launch the operation and wait for it to finish.
    try {
      fn().then(
        result => {
          clearTimeout(timeoutID);
          if (isFinishedOrAbort) {
            logErrorWithPrefix(
              `FS operation finished (successfully), but was considered already aborted. Ignoring.`
            );
            return;
          }

          isFinishedOrAbort = true;
          activeFsOperations--;
          resolve(result);
        },
        error => {
          clearTimeout(timeoutID);
          if (isFinishedOrAbort) {
            logErrorWithPrefix(
              `FS operation finished (with error), but was considered already aborted. Ignoring.`
            );
            return;
          }

          isFinishedOrAbort = true;
          activeFsOperations--;
          reject(error);
        }
      );
    } catch (error) {
      // Synchronous error when running the function - unlikely but still catch it and reject the promise.
      clearTimeout(timeoutID);

      isFinishedOrAbort = true;
      activeFsOperations--;
      reject(error);
    }
  });
};

export const notifyWindowClosed = (targetId: string): void => {
  if (!activeWindowOperations.has(targetId)) {
    return;
  }

  logWithPrefix(`Window "${targetId}" marked as closed.`);
  activeWindowOperations.delete(targetId);
};

export const startWindowClosingIfSafe = (targetId: string): boolean => {
  if (activeWindowOperations.has(targetId)) {
    logWithPrefix(`Window "${targetId}" is already being closed.`);
    return true;
  }

  if (activeFsOperations > 0) {
    logWithPrefix(
      `Cannot close window "${targetId}" because ${activeFsOperations} fs operation(s) are in progress.`
    );
    return false;
  }
  // activeFsOperations is now 0.
  activeWindowOperations.add(targetId);
  setTimeout(() => {
    if (activeWindowOperations.has(targetId)) {
      logErrorWithPrefix(
        `Window "${targetId}" is still being closed after 6 seconds. Considering it closed anyway.`
      );
      notifyWindowClosed(targetId);
    }
  }, 6000);

  logWithPrefix(
    `Closing window "${targetId}" while no fs operation(s) are in progress.`
  );
  return true;
};

export const waitToSafelyStartWindowClosing = async (
  targetId: string
): Promise<void> => {
  if (activeWindowOperations.has(targetId)) {
    return;
  }

  if (activeFsOperations > 0) {
    logWithPrefix(
      `Waiting for ${activeFsOperations} fs operation(s) to finish before being able to close window "${targetId}"...`
    );
    while (activeFsOperations > 0) {
      await delay(100);
    }
    // activeFsOperations is now 0: don't delay and synchronously continue now.
  }
  // activeFsOperations is now 0: it's safe to start a closing operation.
  startWindowClosingIfSafe(targetId);
};
