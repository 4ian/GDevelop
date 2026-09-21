// @ts-check

const puppeteer = require('puppeteer');
const { installPageHelpers } = require('./PageHelpers');
const { startStorybook } = require('./StorybookServer');
const { runSteps, runMonkey } = require('./Runner');
const { wait, watchPageErrors } = require('./PageDriver');
const { findChrome } = require('./Chrome');

/** Install the generic page helpers, then the ones of the editor being tested. */
const getPageHelpersScript = helper =>
  `(${installPageHelpers.toString()})();` +
  (helper && helper.installPageHelpers
    ? `(${helper.installPageHelpers.toString()})();`
    : '');

/**
 * Wait for the story to be rendered and consistent: the editor takes a while
 * to display everything (GDevelop.js must load first), and `helper.check`
 * reports problems until it does. Returns the problems left on timeout.
 */
const waitUntilConsistent = async (page, helper, timeoutInMs) => {
  const startedAt = Date.now();
  let problems = [];
  while (Date.now() - startedAt < timeoutInMs) {
    try {
      problems = (await helper.check(page)).problems;
    } catch (error) {
      problems = [error.message || String(error)];
    }
    if (!problems.length) return [];
    await wait(500);
  }
  return problems;
};

const openStory = async ({ browser, storybookUrl, test, headful }) => {
  const page = await browser.newPage();
  if (!headful) await page.setViewport({ width: 1500, height: 1000 });
  const pageErrors = watchPageErrors(page);

  try {
    await page.evaluateOnNewDocument(getPageHelpersScript(test.helper));
    await page.goto(
      `${storybookUrl}/iframe.html?id=${test.story}&viewMode=story`,
      { waitUntil: 'domcontentloaded', timeout: 120000 }
    );
    const problems = await waitUntilConsistent(page, test.helper, 180000);
    if (problems.length)
      throw new Error(`The story was not displayed: ${problems.join('; ')}`);
  } catch (error) {
    await page.close();
    throw error;
  }
  await wait(1500);
  return { page, pageErrors };
};

/** Run the tests written against the Storybook stories. */
const runStorybookSuite = async ({ tests, options, reporter }) => {
  const storybook = await startStorybook({
    storybookUrl: options.storybookUrl,
    port: options.storybookPort,
    rebuild: options.rebuildStorybook,
    log: reporter.log,
  });

  const browser = await puppeteer.launch({
    executablePath: findChrome(options.chromePath),
    headless: options.headful ? false : 'new',
    slowMo: options.headful ? 20 : 0,
    defaultViewport: options.headful ? null : { width: 1500, height: 1000 },
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      options.headful ? '--window-size=1900,1140' : '--window-size=1500,1000',
      '--window-position=0,0',
    ],
  });

  try {
    for (const test of tests) {
      const runs = test.monkey
        ? test.monkey.seeds.map(seed => ({ seed }))
        : [{ seed: null }];

      for (const { seed } of runs) {
        const name = seed === null ? test.name : `${test.name} (seed ${seed})`;
        reporter.log('');
        reporter.log(`TEST ${name}`);
        if (test.description) reporter.log(`   ${test.description}`);

        let page = null;
        try {
          const opened = await openStory({
            browser,
            storybookUrl: storybook.url,
            test,
            headful: options.headful,
          });
          page = opened.page;
          const pageErrors = opened.pageErrors;
          if (test.helper.summarize)
            reporter.log(`   ${await test.helper.summarize(page)}`);

          const result = test.monkey
            ? await runMonkey({
                page,
                pageErrors,
                helper: test.helper,
                seed,
                steps: test.monkey.steps,
                reporter,
                verbose: options.verbose,
              })
            : await runSteps({
                page,
                pageErrors,
                helper: test.helper,
                steps: test.steps,
                reporter,
              });

          const final = await test.helper.check(page);
          if (
            !result.failures.length &&
            !result.knownIssues.length &&
            final.problems.length
          ) {
            result.failures.push(...final.problems);
            reporter.log(`   ❌ final check: ${final.problems.join('; ')}`);
          }
          reporter.addResult({ name, ...result });
        } catch (error) {
          const message = error.message || String(error);
          reporter.log(`   ❌ ${message}`);
          reporter.addResult({
            name,
            failures: [message],
            performed: 0,
            skipped: 0,
          });
        }
        if (page) {
          await page.screenshot({ path: reporter.getScreenshotPath(name) });
          await page.close();
        }
      }
    }
  } finally {
    await browser.close();
    await storybook.stop();
  }
};

module.exports = { runStorybookSuite };
