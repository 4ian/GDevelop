/**
 * Direct browser proof that holding a gdDirection/gdSprite across
 * SpriteAnimationList reallocation causes "memory access out of bounds"
 * (the same wasm trap reported from Sprite::GetImageName in production).
 *
 * Then re-runs the UI harness against whichever Sprite editor code is loaded.
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
    : path.join('/opt/cursor/artifacts', `sprite_crash_browser_${label}.json`);
})();

async function waitFor(page, fn, timeoutMs, label) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await page.evaluate(fn)) return;
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('Timed out waiting for ' + label);
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
  page.setDefaultTimeout(180000);

  const pageErrors = [];
  const consoleLines = [];
  page.on('pageerror', err =>
    pageErrors.push(String(err && err.message ? err.message : err))
  );
  page.on('console', msg => consoleLines.push(`[${msg.type()}] ${msg.text()}`));
  page.on('crash', () => pageErrors.push('page-crashed'));

  const result = {
    label,
    storyUrl: STORY_URL,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    danglingWrapper: null,
    uiHarness: null,
    pageErrors,
    consoleTail: [],
    error: null,
  };

  try {
    await page.goto(STORY_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });
    await waitFor(
      page,
      () =>
        !!(
          window.__spriteCrashRepro &&
          window.gd &&
          !window.gd.I_AM_NOT_YET_INITIALIZED_YOU_MUST_USE_GD_INSIDE_A_STORY_ONLY
        ),
      120000,
      'gd+harness'
    );

    // --- Direct dangling-wrapper reproduction in the real browser wasm ---
    result.danglingWrapper = await page.evaluate(() => {
      const gd = window.gd;
      const project = gd.ProjectHelper.createNewGDJSProject();
      const layout = project.insertNewLayout('CrashScene', 0);
      const objects = layout.getObjects();
      const object = objects.insertNewObject(project, 'Sprite', 'Player', 0);
      const config = gd.asSpriteConfiguration(object.getConfiguration());
      const animations = config.getAnimations();

      for (let i = 0; i < 8; i++) {
        const animation = new gd.Animation();
        animation.setName('Anim' + i);
        animation.setDirectionsCount(1);
        const direction = animation.getDirection(0);
        for (let j = 0; j < 4; j++) {
          const sprite = new gd.Sprite();
          sprite.setImageName('img' + i + '_' + j);
          direction.addSprite(sprite);
          sprite.delete();
        }
        animations.addAnimation(animation);
        animation.delete();
      }

      // Same mistake the old SpritesList made: keep wrappers across mutation.
      const staleDirection = animations.getAnimation(0).getDirection(0);
      const staleSprite = staleDirection.getSprite(0);
      const before = staleSprite.getImageName();

      for (let round = 0; round < 12; round++) {
        for (let i = 0; i < 24; i++) {
          const animation = new gd.Animation();
          animation.setName('Extra' + round + '_' + i);
          animation.setDirectionsCount(1);
          const d = animation.getDirection(0);
          for (let j = 0; j < 8; j++) {
            const s = new gd.Sprite();
            s.setImageName(
              'filler_' + round + '_' + i + '_' + j + '_' + 'x'.repeat(32)
            );
            d.addSprite(s);
            s.delete();
          }
          animations.addAnimation(animation);
          animation.delete();
        }
        const p2 = gd.ProjectHelper.createNewGDJSProject();
        p2.delete();
      }

      const observations = {
        before,
        animationsAfter: animations.getAnimationsCount(),
        garbageReads: 0,
        traps: [],
        reads: [],
      };

      try {
        const name = staleSprite.getImageName();
        observations.reads.push({ kind: 'sprite.getImageName', value: name });
        if (name !== before) observations.garbageReads++;
      } catch (e) {
        observations.traps.push('sprite.getImageName: ' + (e.message || e));
      }

      try {
        const count = staleDirection.getSpritesCount();
        observations.reads.push({
          kind: 'direction.getSpritesCount',
          value: count,
        });
        if (count !== 4) observations.garbageReads++;
      } catch (e) {
        observations.traps.push(
          'direction.getSpritesCount: ' + (e.message || e)
        );
      }

      try {
        for (let i = 0; i < 64; i++) {
          staleDirection.getSprite(i).getImageName();
        }
      } catch (e) {
        observations.traps.push('deep-read: ' + (e.message || e));
      }

      observations.reproduced =
        observations.traps.some(t =>
          /memory access out of bounds|RuntimeError/i.test(t)
        ) || observations.garbageReads > 0;

      // Keep project alive until evaluate returns (avoid accidental free).
      observations._projectPtr = project.ptr;
      return observations;
    });

    console.log(
      `[${label}] danglingWrapper reproduced=${
        result.danglingWrapper.reproduced
      } traps=${JSON.stringify(result.danglingWrapper.traps)} garbageReads=${
        result.danglingWrapper.garbageReads
      }`
    );

    // --- UI harness (fixed code should survive; broken may or may not race) ---
    result.uiHarness = await page.evaluate(async () => {
      return await window.__spriteCrashRepro.run();
    });
    console.log(
      `[${label}] uiHarness crashed=${result.uiHarness.crashed} okSteps=${
        result.uiHarness.steps && result.uiHarness.steps.slice(-1)[0]
      }`
    );

    result.finishedAt = new Date().toISOString();
    result.consoleTail = consoleLines.slice(-50);
  } catch (e) {
    result.error = String(e && e.stack ? e.stack : e);
    result.finishedAt = new Date().toISOString();
    result.consoleTail = consoleLines.slice(-80);
    console.error(`[${label}] FAILED`, result.error);
  } finally {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`[${label}] Wrote ${outPath}`);
    await browser.close();
  }

  const danglingOk =
    result.danglingWrapper && result.danglingWrapper.reproduced === true;
  // Exit 0 if we successfully demonstrated the dangling-wrapper crash class.
  process.exit(danglingOk && !result.error ? 0 : 1);
})();
