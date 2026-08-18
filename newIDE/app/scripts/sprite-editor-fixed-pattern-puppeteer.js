/**
 * Run ResolveDirectionByIndex — fixed pattern must SURVIVE reallocation.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('/tmp/puppeteer-runner/node_modules/puppeteer-core');

const STORY_URL =
  process.env.STORY_URL ||
  'http://localhost:9009/iframe.html?id=objecteditor-spriteeditorcrashrepro--resolve-direction-by-index&viewMode=story';
const CHROME =
  process.env.CHROME_PATH ||
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/usr/bin/google-chrome-stable';
const outPath =
  process.argv.includes('--out')
    ? process.argv[process.argv.indexOf('--out') + 1]
    : '/opt/cursor/artifacts/sprite_fixed_pattern_survives.json';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', err =>
    pageErrors.push(String(err && err.message ? err.message : err))
  );

  const result = {
    storyUrl: STORY_URL,
    startedAt: new Date().toISOString(),
    report: null,
    pageErrors,
    error: null,
  };

  try {
    await page.goto(STORY_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });
    await page.waitForFunction(
      () =>
        !!(
          window.__fixedDirectionRepro &&
          typeof window.__fixedDirectionRepro.run === 'function'
        ),
      { timeout: 120000 }
    );
    result.report = await page.evaluate(async () => {
      return await window.__fixedDirectionRepro.run();
    });
    result.finishedAt = new Date().toISOString();
    console.log(
      `fixed-pattern status=${result.report.status} crashed=${
        result.report.crashed
      } afterCount=${result.report.afterCount} reads=${
        result.report.reads && result.report.reads.length
      }`
    );
  } catch (e) {
    result.error = String(e && e.stack ? e.stack : e);
    console.error(result.error);
  } finally {
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log('Wrote', outPath);
    await browser.close();
  }

  process.exit(result.report && !result.report.crashed && !result.error ? 0 : 1);
})();
