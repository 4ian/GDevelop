// @flow
const chokidar = require('chokidar');
const debounce = require('lodash.debounce');
const electron = require('electron');
const child_process = require('child_process');
const process = require('process');
const path = require('path');
const log = require('electron-log');

/**
 * Returns the folder corresponding to newIDE/app in **development**.
 * @returns {string}
 */
const findDevelopmentNewIdeAppPath = () => {
  const developmentElectronAppFolder = process.cwd();
  return path.join(developmentElectronAppFolder, '../app');
};

/**
 * Launch the newIDE script `import-GDJS-Runtime`.
 * Cleaning the GDJS output folder and copying sources are both
 * skipped to speed up the build.
 * @returns {Promise<void>}
 */
const importGDJSRuntime = () => {
  if (!child_process || !path) return Promise.reject(new Error('Unsupported'));

  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    child_process.exec(
      `node "${path.join(
        findDevelopmentNewIdeAppPath(),
        'scripts/import-GDJS-Runtime.js'
      )}" --skip-clean --skip-sources`,
      (error, stdout, stderr) => {
        if (error) {
          log.error(`GDJS Runtime update error:\n${error}`);
          reject(error);
          return;
        }

        const duration = (performance.now() - startTime).toFixed(0);
        log.info(`GDJS Runtime updated in ${duration}ms:\n${stdout}`);

        if (stderr) {
          log.error(`GDJS Runtime update error:\n${stderr}`);
          reject(new Error('Error while updating GDJS Runtime'));
          return;
        }

        resolve();
      }
    );
  });
};

/**
 * Callback for fs.watch, so that  whenever a source file is changed,
 * it relaunches automatically the script to import.
 */
const onWatchEvent = debounce(
  /**
   * @param {string} event
   * @param {string} filename
   */
  (event, filename) => {
    const eventName = event || 'unknown-event';
    const resolvedFilename = filename || 'unknown-file';
    log.info(
      `GDJS/extensions watchers found a "${eventName}" in ${resolvedFilename}, updating GDJS Runtime...`
    );
    importGDJSRuntime().catch(() => {});
  },
  100 /* Avoid running the script too much in case multiple changes are fired at the same time. */
);

const genericWatcherErrorMessage =
  'Error in watcher for GDJS Runtime - manually call npm run `node import-GDJS-Runtime.js` in the newIDE/app/scripts folder if you make changes to GDJS. Error:';

let watcher = null;

/**
 * Set up some watchers for GDJS and Extensions sources.
 */
const setupLocalGDJSDevelopmentWatcher = () => {
  if (watcher) {
    log.info('Local GDJS watchers already set up - skipping.');
    return;
  }

  const startTime = performance.now();

  const relativeWatchPaths = [
    // Watch all files in GDJS Runtime:
    '../../GDJS/Runtime/**/*',
    // Watch only JS/TS source files in extensions:
    '../../Extensions/**/*.ts',
    '../../Extensions/**/*.js',
  ];
  const watchPaths = relativeWatchPaths.map(watchPath =>
    path.join(findDevelopmentNewIdeAppPath(), watchPath)
  );

  // Reload extensions when the component is first mounted
  importGDJSRuntime().catch(() => {});

  watcher = chokidar
    .watch(watchPaths, {
      awaitWriteFinish: true,
      ignoreInitial: true,
    })
    .on('all', onWatchEvent)
    .on('error', e => log.error(genericWatcherErrorMessage, e))
    .on('ready', () => {
      const totalTimeStr = (performance.now() - startTime).toFixed(2);
      log.info(
        `Watchers for GDJS Runtime/extensions installed in ${totalTimeStr}ms.`
      );
    });
};

const closeLocalGDJSDevelopmentWatcher = () => {
  if (!watcher) return;

  log.info('Closing watchers for GDJS.');
  watcher.close();
  watcher = null;
};

module.exports = {
  setupLocalGDJSDevelopmentWatcher,
  closeLocalGDJSDevelopmentWatcher,
};
