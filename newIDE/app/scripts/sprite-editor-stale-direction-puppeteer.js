/**
 * Run the StaleDirectionPropRender Storybook story — deliberately holds a
 * gdDirection across reallocation, then reads it (the old SpritesList pattern).
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('/tmp/puppeteer-runner/node_modules/puppeteer-core');

const STORY_URL =
  process.env.STORY_URL ||
  'http://localhost:9009/iframe.html?id=objecteditor-spriteeditorcrashrepro--stale-direction-prop-render&viewMode=story';
const CHROME =
  process.env.CHROME_PATH ||
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/usr/bin/google-chrome-stable';
const label = (() => {
  const idx = process.argv.indexOf('--label');
  return idx >= 0 ? process.argv[idx + 1] : 'stale-direction';
})();
const outPath = (() => {
  const idx = process.argv.indexOf('--out');
  return idx >= 0
    ? process.argv[idx + 1]
    : path.join(
        '/opt/cursor/artifacts',
        `sprite_stale_direction_${label}.json`
      );
})();

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
  page.on('crash', () => pageErrors.push('page-crashed'));

  const result = {
    label,
    storyUrl: STORY_URL,
    startedAt: new Date().toISOString(),
    finishedAt: null,
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
          window.__staleDirectionRepro &&
          typeof window.__staleDirectionRepro.run === 'function'
        ),
      { timeout: 120000 }
    );
    result.report = await page.evaluate(async () => {
      return await window.__staleDirectionRepro.run();
    });
    // Collect any page errors that fired during the run.
    await new Promise(r => setTimeout(r, 200));
    result.pageErrors = pageErrors.slice();
    if (
      !result.report.crashed &&
      pageErrors.some(e => /memory access out of bounds|RuntimeError/i.test(e))
    ) {
      result.report.crashed = true;
      result.report.status = 'CRASHED';
      result.report.traps = [
        ...(result.report.traps || []),
        ...pageErrors,
      ];
    }
    result.finishedAt = new Date().toISOString();
    console.log(
      `[${label}] status=${result.report.status} crashed=${
        result.report.crashed
      } traps=${JSON.stringify(result.report.traps)} reads=${
        result.report.reads && result.report.reads.length
      }`
    );
  } catch (e) {
    result.error = String(e && e.stack ? e.stack : e);
    result.finishedAt = new Date().toISOString();
    console.error(`[${label}] FAILED`, result.error);
  } finally {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`[${label}] Wrote ${outPath}`);
    await browser.close();
  }

  process.exit(result.report && result.report.crashed ? 0 : 1);
})();
