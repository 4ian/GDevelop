// @ts-check

const { installPageHelpers } = require('./PageHelpers');
const {
  getPortableBuild,
  getExampleProject,
  launchEditor,
} = require('./RealEditor');
const { runSteps, runMonkey } = require('./Runner');
const { wait, watchPageErrors } = require('./PageDriver');

const DEBUGGING_PORT = 9333;

/**
 * Run the tests using a real, packaged version of the editor: these are smoke
 * tests, only there to catch something badly broken in the real app.
 */
const runEditorSuite = async ({ tests, options, reporter }) => {
  const { binaryPath, version } = await getPortableBuild({
    zipPath: options.gdevelopZipPath,
    branch: options.gdevelopBranch,
    workDirectory: options.workDirectory,
    log: reporter.log,
  });

  for (const test of tests) {
    reporter.log('');
    reporter.log(`TEST ${test.name}`);
    if (test.description) reporter.log(`   ${test.description}`);

    const projectPath = test.example
      ? getExampleProject({
          slug: test.example,
          workDirectory: options.workDirectory,
          log: reporter.log,
        })
      : null;

    let pageErrors = [];
    let editor = null;
    let result = { failures: [], performed: 0, skipped: 0 };
    const screenshotPath = name =>
      reporter.getScreenshotPath(`${test.name}-${name}`);

    try {
      editor = await launchEditor({
        binaryPath,
        projectPath,
        debuggingPort: DEBUGGING_PORT,
        log: reporter.log,
      });
      const page = editor.page;
      pageErrors = watchPageErrors(page);

      // The helpers are installed in the already loaded page: the window of the
      // editor is opened by the app itself, not by the test.
      const helpers = test.helpers || (test.helper ? [test.helper] : []);
      await page.evaluate(`(${installPageHelpers.toString()})()`);
      for (const helper of helpers) {
        if (helper.installPageHelpers)
          await page.evaluate(`(${helper.installPageHelpers.toString()})()`);
      }

      result = await test.run({
        page,
        pageErrors,
        reporter,
        version,
        projectPath,
        options,
        screenshot: async name => {
          await page.screenshot({ path: screenshotPath(name) });
        },
        // The same runners as the Storybook tests, already bound to this page.
        runSteps: ({ helper, steps }) =>
          runSteps({ page, pageErrors, helper, steps, reporter }),
        runMonkey: ({ helper, seed, steps, actionNames }) =>
          runMonkey({
            page,
            pageErrors,
            helper,
            seed: seed || 1,
            steps: steps || options.editorMonkeySteps,
            actionNames,
            reporter,
            verbose: options.verbose,
          }),
      });
    } catch (error) {
      reporter.log(`   ❌ ${error.message || String(error)}`);
      result.failures = [...result.failures, error.message || String(error)];
      if (editor) {
        try {
          await editor.page.screenshot({ path: screenshotPath('failure') });
        } catch (screenshotError) {
          // Ignore: the window may already be gone.
        }
      }
    } finally {
      if (editor) {
        await wait(500);
        await editor.stop();
        await wait(1000);
      }
    }

    if (pageErrors.length && !result.failures.length) {
      result.failures.push(`the editor threw: ${pageErrors[0].split('\n')[0]}`);
      reporter.log(`   💥 the editor threw: ${pageErrors[0].split('\n')[0]}`);
    }
    reporter.addResult({ name: test.name, ...result });
  }
};

module.exports = { runEditorSuite };
