// @ts-check

const { spawnSync } = require('child_process');
const path = require('path');

const repositoryRoot = path.resolve(__dirname, '..', '..', '..');

/** The files changed compared to a reference, or null if it can't be told. */
const getChangedFiles = baseRef => {
  const result = spawnSync(
    'git',
    ['diff', '--name-only', `${baseRef}...HEAD`],
    { cwd: repositoryRoot, encoding: 'utf8' }
  );
  if (result.status !== 0) return null;
  return result.stdout
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
};

/**
 * The tests to run for these changes: the ones watching a path that changed.
 * A test watching nothing always runs, and everything runs when the tests
 * themselves changed or when the changes can't be told.
 */
const filterTestsForChangedFiles = ({ tests, changedFiles, log }) => {
  if (!changedFiles) {
    if (log) log('The changed files could not be listed: running every test.');
    return tests;
  }
  if (!changedFiles.length) {
    if (log) log('No file changed: running every test.');
    return tests;
  }
  if (changedFiles.some(file => file.startsWith('newIDE/visual-tests/'))) {
    if (log) log('The tests themselves changed: running every test.');
    return tests;
  }

  return tests.filter(test => {
    const watchedPaths = getWatchedPaths(test);
    if (!watchedPaths.length) return true;
    return changedFiles.some(file =>
      watchedPaths.some(watchedPath => file.startsWith(watchedPath))
    );
  });
};

/** The paths a test watches: its own, or the ones of the helpers it uses. */
const getWatchedPaths = test => {
  if (test.paths) return test.paths;
  const helpers = test.helpers || (test.helper ? [test.helper] : []);
  return helpers.reduce((all, helper) => all.concat(helper.paths || []), []);
};

module.exports = {
  getChangedFiles,
  filterTestsForChangedFiles,
  getWatchedPaths,
};
