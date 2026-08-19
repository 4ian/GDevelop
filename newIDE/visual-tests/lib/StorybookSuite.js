// @ts-check

const path = require('path');
const puppeteer = require('puppeteer');
const { installPageHelpers } = require('./PageHelpers');
const { startStorybook } = require('./StorybookServer');
const { runSteps, runMonkey } = require('./Runner');
const { wait } = require('./PageDriver');
const { findChrome } = require('./Chrome');

/** Install the generic page helpers, then the ones of the editor being tested. */
const getPageHelpersScript = helper =>
  `(${installPageHelpers.toString()})();` +
  (helper && helper.installPageHelpers
    ? `(${helper.installPageHelpers.toString()})();`
    : '');

const openStory = async ({ browser, storybookUrl, test, headful }) => {
  const page = await browser.newPage();
  if (!headful) await page.setViewport({ width: 1500, height: 1000 });

  const pageErrors = [];
  page.on('pageerror', error => {
    const message = error.message || String(error);
    pageErrors.push(
      message +
        (error.stack
          ? '\n' +
            error.stack
              .split('\n')
              .slice(0, 8)
              .join('\n')
          : '')
    );
  });
  page.on('console', message => {
    const text = message.text();
    if (
      message.type() === 'error' &&
      text.includes('The above error occurred in the')
    )
      pageErrors.push('React reports: ' + text.split('\n')[1]);
  });

  await page.evaluateOnNewDocument(getPageHelpersScript(test.helper));
  await page.goto(
    `${storybookUrl}/iframe.html?id=${test.story}&viewMode=story`,
    { waitUntil: 'domcontentloaded', timeout: 120000 }
  );
  // Wait for GDevelop.js to be loaded and the story to be rendered.
  await page.waitForFunction(
    () =>
      !!window.gdVisualTests &&
      (document.querySelectorAll('img').length > 0 ||
        (!!window.gdVisualTests.spriteEditor &&
          window.gdVisualTests.spriteEditor.describe().hasEmptyPlaceholder)),
    { timeout: 180000, polling: 500 }
  );
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

        const { page, pageErrors } = await openStory({
          browser,
          storybookUrl: storybook.url,
          test,
          headful: options.headful,
        });
        const initial = await test.helper.check(page);
        reporter.log(
          `   ${initial.described.rows.length} animations, ` +
            `${initial.described.imagesCount} thumbnails displayed.`
        );

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
        await page.screenshot({
          path: path.join(
            reporter.getArtifactsDirectory(),
            `${name.replace(/[^a-z0-9]+/gi, '-')}.png`
          ),
        });
        reporter.addResult({ name, ...result });
        await page.close();
      }
    }
  } finally {
    await browser.close();
    await storybook.stop();
  }
};

module.exports = { runStorybookSuite };
