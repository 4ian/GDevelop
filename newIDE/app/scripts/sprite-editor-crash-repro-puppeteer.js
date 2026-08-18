/**
 * Puppeteer harness: open the SpriteEditorCrashRepro Storybook story and run
 * the in-page stress test that reallocates animations while scrolling.
 *
 * Usage:
 *   node scripts/sprite-editor-crash-repro-puppeteer.js [--label fixed|broken] [--out report.json]
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('/tmp/puppeteer-runner/node_modules/puppeteer-core');

const STORY_URL =
  process.env.STORY_URL ||
  'http://localhost:9009/iframe.html?id=objecteditor-spriteeditorcrashrepro--reallocation-while-scrolling&viewMode=story';
const CHROME =
  process.env.CHROME_PATH ||
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/usr/bin/google-chrome-stable';
const label = (() => {
  const idx = process.argv.indexOf('--label');
  return idx >= 0 ? process.argv[idx + 1] : 'run';
})();
const outPath = (() => {
  const idx = process.argv.indexOf('--out');
  return idx >= 0
    ? process.argv[idx + 1]
    : path.join(
        '/opt/cursor/artifacts',
        `sprite_crash_repro_${label}.json`
      );
})();

async function waitForHarness(page, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const ready = await page.evaluate(() => {
      return !!(
        window.__spriteCrashRepro &&
        typeof window.__spriteCrashRepro.run === 'function' &&
        document.querySelector('[data-testid="sprite-crash-repro-root"]')
      );
    });
    if (ready) return;
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('Timed out waiting for __spriteCrashRepro harness');
}

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
  page.setDefaultTimeout(120000);

  const consoleLines = [];
  const pageErrors = [];
  page.on('console', msg => {
    consoleLines.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => {
    pageErrors.push(String(err && err.message ? err.message : err));
  });
  page.on('crash', () => {
    pageErrors.push('page-crashed');
  });

  const result = {
    label,
    storyUrl: STORY_URL,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    ok: false,
    harnessReport: null,
    pageErrors,
    consoleTail: [],
    error: null,
  };

  try {
    console.log(`[${label}] Opening ${STORY_URL}`);
    await page.goto(STORY_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await waitForHarness(page, 120000);
    console.log(`[${label}] Harness ready, running stress test...`);

    const harnessReport = await page.evaluate(async () => {
      return await window.__spriteCrashRepro.run();
    });
    result.harnessReport = harnessReport;

    const combinedErrors = [
      ...pageErrors,
      ...(harnessReport.pageErrors || []),
    ];
    const hasMemoryCrash = combinedErrors.some(msg =>
      /memory access out of bounds|RuntimeError|page-crashed/i.test(msg)
    );

    result.ok = !harnessReport.crashed && !hasMemoryCrash;
    result.finishedAt = new Date().toISOString();
    result.consoleTail = consoleLines.slice(-40);

    console.log(
      `[${label}] Done. ok=${result.ok} crashed=${harnessReport.crashed} ` +
        `addClicks=${harnessReport.addClicks} imagesClicked=${
          harnessReport.imagesClicked
        } animationsAfter=${harnessReport.animationsAfter}`
    );
    if (combinedErrors.length) {
      console.log(`[${label}] Errors:\n` + combinedErrors.join('\n'));
    }
  } catch (e) {
    result.error = String(e && e.stack ? e.stack : e);
    result.finishedAt = new Date().toISOString();
    result.consoleTail = consoleLines.slice(-80);
    console.error(`[${label}] FAILED:`, result.error);
  } finally {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`[${label}] Wrote ${outPath}`);
    await browser.close();
  }

  process.exit(result.ok ? 0 : 1);
})();
