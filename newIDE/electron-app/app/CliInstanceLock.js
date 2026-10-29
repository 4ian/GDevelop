const fs = require('fs');
const path = require('path');

const LOCK_FILE_NAME = 'cli-instance.lock';
const POLL_INTERVAL_MS = 250;

const isProcessAlive = pid => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return false;
  }
};

const readLockedPid = lockFilePath => {
  try {
    const pid = parseInt(fs.readFileSync(lockFilePath, 'utf8'), 10);
    return Number.isInteger(pid) && pid !== process.pid ? pid : null;
  } catch (error) {
    return null;
  }
};

/**
 * The CLI and MCP instances skip the single instance lock, but two Electron
 * processes on the same user data folder fight for the IndexedDB storage: the
 * second one fails to open it and runs logged out (no Firebase session) for
 * its whole life. An MCP client reconnecting spawns the new instance before
 * the previous one has exited, so the new instance waits for it here.
 *
 * Resolves once no previous CLI instance is alive (or after `timeoutMs`).
 */
const waitForPreviousCliInstance = async ({ app, log, timeoutMs }) => {
  const lockFilePath = path.join(app.getPath('userData'), LOCK_FILE_NAME);
  const startTime = Date.now();
  let previousPid = readLockedPid(lockFilePath);
  while (previousPid && isProcessAlive(previousPid)) {
    if (Date.now() - startTime > timeoutMs) {
      log.warn(
        `Previous CLI instance (pid ${previousPid}) still alive after ${timeoutMs}ms: starting anyway (the session may not be available).`
      );
      break;
    }
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    previousPid = readLockedPid(lockFilePath);
  }
  if (previousPid) {
    log.info(
      `Waited ${Date.now() -
        startTime}ms for the previous CLI instance (pid ${previousPid}) to exit.`
    );
  }

  fs.writeFileSync(lockFilePath, String(process.pid));
  app.on('will-quit', () => {
    if (readLockedPid(lockFilePath) === null) {
      // Our own pid (readLockedPid returns null for it): release the lock.
      try {
        fs.unlinkSync(lockFilePath);
      } catch (error) {
        // Already removed.
      }
    }
  });
};

module.exports = { waitForPreviousCliInstance };
