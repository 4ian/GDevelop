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

const onWatchEvent = debounce(
  /**
   * @param {string} event
   * @param {string} filename
   */
  (event, filename) => {
    // Nothing to do for now.
    log.info(`GDJS watcher found a change.`);
  },
  100 /* Avoid running the script too much in case multiple changes are fired at the same time. */
);

let watcher = null;

/**
 * Set up some watchers for GDJS and Extensions sources.
 */
const setupLocalGDJSDevelopmentWatcher = () => {
  if (watcher) {
    log.info('GDJS changes watcher already set up - skipping.');
    return;
  }

  const startTime = performance.now();
  watcher = chokidar
    .watch(path.join(findDevelopmentNewIdeAppPath(), 'resources/GDJS'), {
      awaitWriteFinish: true,
      ignoreInitial: true,
    })
    .on('all', onWatchEvent)
    .on('error', e => log.error("Can't set up a watcher for GDJS changes:", e))
    .on('ready', () => {
      const totalTimeStr = (performance.now() - startTime).toFixed(2);
      log.info(`Watchers for GDJS changes installed in ${totalTimeStr}ms.`);
    });
};

const closeLocalGDJSDevelopmentWatcher = () => {
  if (!watcher) return;

  log.info('Closing GDJS changes watcher.');
  watcher.close();
  watcher = null;
};

module.exports = {
  setupLocalGDJSDevelopmentWatcher,
  closeLocalGDJSDevelopmentWatcher,
};
