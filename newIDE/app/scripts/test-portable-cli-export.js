// @ts-check
/**
 * End-to-end smoke test for the GDevelop "portable" build + CLI export.
 *
 * What it does:
 *   1. Downloads the latest Linux portable zip of GDevelop (built on master
 *      by the CircleCI build-linux job and uploaded to S3).
 *   2. Extracts it into a working directory.
 *   3. Downloads an example game from the GDevelop-examples repository
 *      (defaults to "3d-platformer").
 *   4. Runs the extracted GDevelop binary in CLI mode with
 *      `--run-command EXPORT_HTML5_EXTERNAL` to export the game to HTML5.
 *   5. Verifies the exported HTML5 game looks valid (e.g. `index.html`
 *      exists) and copies it to an artifacts folder.
 *
 * Usage:
 *   node test-portable-cli-export.js [--branch=master] [--example=3d-platformer]
 *                                    [--workDir=./.portable-cli-test]
 *                                    [--artifactsDir=./portable-cli-artifacts]
 *
 * The script intentionally has zero npm dependencies so it can be run in a
 * minimal CI image, only relying on Node.js built-ins and the standard
 * Unix tools `unzip`, `curl` and `git`.
 */

'use strict';

const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const https = require('https');
const { spawn, spawnSync } = require('child_process');

const args = parseArgs(process.argv.slice(2));
const branch = args.branch || 'master';
const exampleSlug = args.example || '3d-platformer';
const workDir = path.resolve(args.workDir || './.portable-cli-test');
const artifactsDir = path.resolve(
  args.artifactsDir || './portable-cli-artifacts'
);

const S3_BASE = `https://gdevelop-releases.s3.amazonaws.com/${branch}/latest`;
const EXAMPLES_REPO = 'https://github.com/GDevelopApp/GDevelop-examples.git';

const log = (...m) => console.log('[portable-cli-test]', ...m);
const fail = msg => {
  console.error('[portable-cli-test] ❌', msg);
  process.exit(1);
};

async function main() {
  log(`Using branch=${branch}, example=${exampleSlug}`);
  log(`Work dir:      ${workDir}`);
  log(`Artifacts dir: ${artifactsDir}`);

  await fsPromises.mkdir(workDir, { recursive: true });
  await fsPromises.mkdir(artifactsDir, { recursive: true });

  // 1. Find out the current GDevelop version on master via latest-linux.yml.
  const latestLinuxYmlPath = path.join(workDir, 'latest-linux.yml');
  log(`Downloading ${S3_BASE}/latest-linux.yml ...`);
  await downloadFile(`${S3_BASE}/latest-linux.yml`, latestLinuxYmlPath);
  const version = parseVersionFromLatestYml(
    fs.readFileSync(latestLinuxYmlPath, 'utf8')
  );
  if (!version) fail('Could not find version in latest-linux.yml');
  log(`Detected GDevelop version: ${version}`);

  // 2. Download the Linux portable zip.
  const portableZipName = `gdevelop-${version}.zip`;
  const portableZipPath = path.join(workDir, portableZipName);
  log(`Downloading ${S3_BASE}/${portableZipName} ...`);
  await downloadFile(`${S3_BASE}/${portableZipName}`, portableZipPath);
  const zipStat = fs.statSync(portableZipPath);
  log(`Downloaded ${formatBytes(zipStat.size)}`);

  // 3. Extract the portable zip.
  const extractedDir = path.join(workDir, `gdevelop-${version}`);
  await fsPromises.rm(extractedDir, { recursive: true, force: true });
  await fsPromises.mkdir(extractedDir, { recursive: true });
  log(`Extracting portable zip to ${extractedDir} ...`);
  runSync('unzip', ['-q', portableZipPath, '-d', extractedDir]);

  // 4. Locate the GDevelop executable inside the extracted dir.
  const gdevelopBinary = findExecutable(extractedDir);
  if (!gdevelopBinary) {
    fail(
      `Could not find a GDevelop executable inside ${extractedDir}. ` +
        `Contents: ${listDir(extractedDir).join(', ')}`
    );
  }
  log(`Found GDevelop binary: ${gdevelopBinary}`);
  fs.chmodSync(gdevelopBinary, 0o755);

  // 5. Fetch the example game from GDevelop-examples.
  const exampleDir = path.join(workDir, 'example', exampleSlug);
  await fsPromises.rm(path.join(workDir, 'example'), {
    recursive: true,
    force: true,
  });
  log(`Cloning ${exampleSlug} from GDevelop-examples (sparse) ...`);
  cloneExampleSparse(EXAMPLES_REPO, exampleSlug, path.join(workDir, 'example'));
  const gameJsonPath = path.join(exampleDir, `${exampleSlug}.json`);
  if (!fs.existsSync(gameJsonPath)) {
    fail(
      `Example game project not found at ${gameJsonPath} after sparse clone.`
    );
  }
  log(`Example game project: ${gameJsonPath}`);

  // 6. Run the GDevelop CLI export.
  log('Running GDevelop CLI HTML5 export ...');
  await runCliExport(gdevelopBinary, gameJsonPath);

  // 7. Verify the export.
  const exportedBuildDir = path.join(exampleDir, 'build');
  const exportedIndex = path.join(exportedBuildDir, 'index.html');
  if (!fs.existsSync(exportedIndex)) {
    fail(
      `Export did not produce an index.html at ${exportedIndex}. ` +
        `Build dir contents: ${
          fs.existsSync(exportedBuildDir)
            ? listDir(exportedBuildDir).join(', ')
            : '(missing)'
        }`
    );
  }
  const indexStat = fs.statSync(exportedIndex);
  if (indexStat.size < 200) {
    fail(`Exported index.html is suspiciously small (${indexStat.size} bytes).`);
  }
  log(`✅ index.html exported (${formatBytes(indexStat.size)})`);

  // 8. Save the exported HTML5 game as a zip artifact.
  const artifactZip = path.join(
    artifactsDir,
    `${exampleSlug}-html5-${version}.zip`
  );
  await fsPromises.rm(artifactZip, { force: true });
  log(`Zipping exported game to ${artifactZip} ...`);
  runSync('zip', ['-qr', artifactZip, '.'], { cwd: exportedBuildDir });
  log(`✅ Artifact saved: ${artifactZip}`);

  log('🎉 Portable CLI HTML5 export smoke test succeeded.');
}

// ---------------------------------------------------------------------------
// Helpers

function parseArgs(argv) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const a of argv) {
    const m = /^--([^=]+)=(.*)$/.exec(a);
    if (m) out[m[1]] = m[2];
    else if (a.startsWith('--')) out[a.slice(2)] = 'true';
  }
  return out;
}

/**
 * Download a URL to a local path, following HTTP redirects.
 * @param {string} url
 * @param {string} outputPath
 * @returns {Promise<void>}
 */
function downloadFile(url, outputPath, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, res => {
      if (
        res.statusCode &&
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        if (redirectsLeft <= 0) {
          reject(new Error(`Too many redirects fetching ${url}`));
          return;
        }
        res.resume();
        downloadFile(res.headers.location, outputPath, redirectsLeft - 1).then(
          resolve,
          reject
        );
        return;
      }
      if (res.statusCode !== 200) {
        reject(
          new Error(`Failed to fetch ${url}: HTTP ${res.statusCode}`)
        );
        res.resume();
        return;
      }
      const out = fs.createWriteStream(outputPath);
      res.pipe(out);
      out.on('finish', () => out.close(err => (err ? reject(err) : resolve())));
      out.on('error', reject);
    });
    req.on('error', reject);
  });
}

/**
 * Parse the `version: x.y.z` field from an electron-builder latest-*.yml.
 * @param {string} yml
 * @returns {string|null}
 */
function parseVersionFromLatestYml(yml) {
  const m = /^version:\s*(\S+)/m.exec(yml);
  return m ? m[1] : null;
}

/**
 * Search the extracted portable build for the Electron executable.
 * On Linux electron-builder names it after the `name` field in package.json
 * ("gdevelop"). We just look for the first executable file with that name.
 * @param {string} root
 * @returns {string|null}
 */
function findExecutable(root) {
  const candidates = ['gdevelop', 'GDevelop'];
  /** @type {string[]} */
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    if (!dir) continue;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      continue;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        stack.push(full);
      } else if (e.isFile() && candidates.includes(e.name)) {
        return full;
      }
    }
  }
  return null;
}

/**
 * Sparse-clone a single example folder from the GDevelop-examples repo to
 * avoid pulling the multi-GB full history.
 * @param {string} repoUrl
 * @param {string} slug
 * @param {string} dest
 */
function cloneExampleSparse(repoUrl, slug, dest) {
  fs.mkdirSync(dest, { recursive: true });
  runSync('git', ['init', '-q'], { cwd: dest });
  runSync('git', ['remote', 'add', 'origin', repoUrl], { cwd: dest });
  runSync('git', ['config', 'core.sparseCheckout', 'true'], { cwd: dest });
  runSync('git', ['sparse-checkout', 'init', '--cone'], { cwd: dest });
  runSync('git', ['sparse-checkout', 'set', `examples/${slug}`], {
    cwd: dest,
  });
  runSync('git', ['fetch', '--depth=1', 'origin', 'master'], { cwd: dest });
  runSync('git', ['checkout', 'FETCH_HEAD'], { cwd: dest });

  // Flatten: move examples/<slug> contents up to <dest>/<slug>.
  const nestedExampleDir = path.join(dest, 'examples', slug);
  const flatExampleDir = path.join(dest, slug);
  if (fs.existsSync(nestedExampleDir) && !fs.existsSync(flatExampleDir)) {
    fs.renameSync(nestedExampleDir, flatExampleDir);
  }
}

/**
 * Run a command and stream its output. Throws on non-zero exit.
 * @param {string} cmd
 * @param {string[]} args
 * @param {{cwd?: string, env?: NodeJS.ProcessEnv}} [options]
 */
function runSync(cmd, args, options = {}) {
  const r = spawnSync(cmd, args, {
    stdio: 'inherit',
    cwd: options.cwd,
    env: options.env || process.env,
  });
  if (r.status !== 0) {
    throw new Error(
      `Command failed (${r.status}): ${cmd} ${args.join(' ')}`
    );
  }
}

/**
 * Run the GDevelop CLI export. Resolves on success, exits the script on
 * failure with the binary's exit code.
 * @param {string} gdevelopBinary
 * @param {string} gameJsonPath
 */
function runCliExport(gdevelopBinary, gameJsonPath) {
  return new Promise((resolve, reject) => {
    // Time-box the export to avoid jobs hanging forever if the binary
    // wedges (e.g. waits for a dialog we did not auto-resolve).
    const TIMEOUT_MS = 10 * 60 * 1000;

    const cliArgs = [
      '--no-sandbox',
      '--disable-update-check',
      '--run-command',
      'EXPORT_HTML5_EXTERNAL',
      gameJsonPath,
    ];
    log(`Spawn: ${gdevelopBinary} ${cliArgs.join(' ')}`);
    const child = spawn(gdevelopBinary, cliArgs, {
      stdio: 'inherit',
      env: {
        ...process.env,
        // Electron sometimes needs a display variable to be unset on
        // headless servers to fall back to its offscreen path.
        ELECTRON_DISABLE_SECURITY_WARNINGS: '1',
      },
    });

    const timer = setTimeout(() => {
      console.error(
        '[portable-cli-test] ❌ CLI export timed out, killing process.'
      );
      child.kill('SIGKILL');
    }, TIMEOUT_MS);

    child.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('exit', (code, signal) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `GDevelop CLI exited with code=${code} signal=${signal || 'none'}`
          )
        );
      }
    });
  });
}

function listDir(dir) {
  try {
    return fs.readdirSync(dir);
  } catch (e) {
    return [];
  }
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${(n / 1024 / 1024).toFixed(1)} MiB`;
}

main().catch(err => {
  console.error('[portable-cli-test] ❌', err && err.stack ? err.stack : err);
  process.exit(1);
});
