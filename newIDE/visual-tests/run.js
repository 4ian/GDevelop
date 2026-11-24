#!/usr/bin/env node
// @ts-check

/**
 * Runs the visual monkey tests: they manipulate the editor in a real browser
 * and check that nothing is broken. See README.md.
 *
 * Examples:
 *   node run.js --list
 *   node run.js --suite=storybook
 *   node run.js --suite=storybook --test=monkey --headful
 *   node run.js --suite=storybook --only-changed --base-ref=origin/master
 *   node run.js --suite=editor --gdevelop-zip=../electron-app/dist/gdevelop.zip
 */

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const { makeReporter } = require('./lib/Reporter');
const { runStorybookSuite } = require('./lib/StorybookSuite');
const { runEditorSuite } = require('./lib/EditorSuite');
const {
  getChangedFiles,
  filterTestsForChangedFiles,
} = require('./lib/ChangedFiles');

const SUITES = {
  storybook: {
    directory: 'storybook-tests',
    run: runStorybookSuite,
    description: 'Storybook stories of a single editor, checked precisely',
  },
  editor: {
    directory: 'editor-tests',
    run: runEditorSuite,
    description: 'A real packaged app opening a real game, checked roughly',
  },
};

const loadTests = suiteName => {
  const directory = path.join(__dirname, SUITES[suiteName].directory);
  return fs
    .readdirSync(directory)
    .filter(fileName => fileName.endsWith('.js'))
    .map(fileName => require(path.join(directory, fileName)))
    .reduce((all, tests) => all.concat(tests), [])
    .map(test => ({ ...test, suite: suiteName }));
};

const describeTest = test =>
  test.monkey
    ? ` (${test.monkey.seeds.length} random sessions of ${
        test.monkey.steps
      } manipulations)`
    : test.steps
    ? ` (${test.steps.length} manipulations)`
    : '';

const main = async () => {
  const args = minimist(process.argv.slice(2));
  const suiteNames =
    !args.suite || args.suite === 'all'
      ? Object.keys(SUITES)
      : String(args.suite).split(',');
  suiteNames.forEach(suiteName => {
    if (!SUITES[suiteName])
      throw new Error(
        `Unknown suite "${suiteName}" (known: ${Object.keys(SUITES).join(
          ', '
        )})`
      );
  });

  // The tests asked for: by name, by what the changes touch, or from a file
  // (what `circleci tests split` gives to each parallel container).
  const namesFromFile = args['tests-file']
    ? fs
        .readFileSync(String(args['tests-file']), 'utf8')
        .split(/\s+/)
        .filter(Boolean)
    : null;
  const changedFiles = args['only-changed']
    ? getChangedFiles(String(args['base-ref'] || 'origin/master'))
    : null;

  const getTestsOf = (suiteName, log) => {
    let tests = loadTests(suiteName);
    if (args.test)
      tests = tests.filter(test => test.name.includes(String(args.test)));
    if (namesFromFile)
      tests = tests.filter(test => namesFromFile.includes(test.name));
    if (args['only-changed'])
      tests = filterTestsForChangedFiles({ tests, changedFiles, log });
    return tests;
  };

  // `--list-names` prints one name per line, to be split across containers.
  if (args['list-names']) {
    suiteNames.forEach(suiteName =>
      getTestsOf(suiteName).forEach(test => console.log(test.name))
    );
    return true;
  }
  if (args.list) {
    suiteNames.forEach(suiteName => {
      console.log(`\n${suiteName} — ${SUITES[suiteName].description}`);
      getTestsOf(suiteName).forEach(test =>
        console.log(`  ${test.name}${describeTest(test)}`)
      );
    });
    return true;
  }

  const options = {
    headful: !!args.headful,
    verbose: !!args.verbose,
    chromePath: args['chrome-path'] || null,
    storybookUrl: args['storybook-url'] || null,
    storybookPort: Number(args['storybook-port'] || 9010),
    rebuildStorybook: !!args['rebuild-storybook'],
    gdevelopZipPath: args['gdevelop-zip']
      ? path.resolve(String(args['gdevelop-zip']))
      : null,
    gdevelopBranch: args['gdevelop-branch'] || 'master',
    editorMonkeySteps: Number(args['editor-monkey-steps'] || 30),
    workDirectory: path.resolve(String(args['work-dir'] || './work')),
  };

  let allPassed = true;
  for (const suiteName of suiteNames) {
    const reporter = makeReporter({
      artifactsDirectory: path.resolve(
        String(args['artifacts-dir'] || './artifacts'),
        suiteName
      ),
      logFileName: `${suiteName}-visual-tests.log`,
      junitPath: args['junit-path'] ? String(args['junit-path']) : null,
      suiteName,
    });
    const tests = getTestsOf(suiteName, reporter.log);
    reporter.log(
      `Running ${tests.length} test(s) of the "${suiteName}" suite ` +
        `(${SUITES[suiteName].description}).`
    );
    if (!tests.length) {
      reporter.log('No test to run.');
      continue;
    }

    await SUITES[suiteName].run({ tests, options, reporter });
    allPassed = reporter.writeSummary() && allPassed;
  }
  return allPassed;
};

main().then(
  allPassed => process.exit(allPassed ? 0 : 1),
  error => {
    console.error(error && error.stack ? error.stack : error);
    process.exit(2);
  }
);
