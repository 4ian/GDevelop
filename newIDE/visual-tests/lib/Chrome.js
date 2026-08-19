// @ts-check

const fs = require('fs');
const puppeteer = require('puppeteer');

/**
 * The Chrome to run the tests in: the one asked for, one installed on the
 * machine, or the one `npm install` downloaded for Puppeteer.
 */
const findChrome = givenPath => {
  const candidates = [
    givenPath,
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/local/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  const existing = candidates.find(candidate => fs.existsSync(candidate));
  if (existing) return existing;

  try {
    const downloadedPath = puppeteer.executablePath();
    if (fs.existsSync(downloadedPath)) return downloadedPath;
  } catch (error) {
    // No browser downloaded for Puppeteer.
  }
  throw new Error(
    'No Chrome found to run the tests in. Run `npm install` in ' +
      'newIDE/visual-tests (it downloads one) or pass --chrome-path=...'
  );
};

module.exports = { findChrome };
