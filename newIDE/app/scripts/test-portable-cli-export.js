// @ts-check
/**
 * End-to-end smoke test for the GDevelop "portable" build + CLI export.
 *
 * What it does:
 *   1. Reads the current GDevelop version from
 *      `newIDE/electron-app/app/package.json` (the source of truth, same
 *      as `make-version-metadata.js`).
 *   2. Downloads the matching Linux portable zip (built on master by the
 *      CircleCI build-linux job and uploaded to S3).
 *   3. Extracts it with adm-zip.
 *   4. Sparse-clones an example game from the GDevelop-examples repository
 *      (defaults to "3d-platformer").
 *   5. Runs the extracted GDevelop binary in CLI mode with
 *      `--run-command EXPORT_HTML5_EXTERNAL` to export the game to HTML5.
 *   6. Verifies the exported HTML5 game looks valid (e.g. `index.html`
 *      exists). The exported folder can then be saved as a CI artifact.
 *
 * Usage:
 *   node test-portable-cli-export.js [--branch=master] [--example=3d-platformer]
 *                                    [--workDir=./.portable-cli-test]
 *                                    [--artifactsDir=./portable-cli-artifacts]
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const shell = require('shelljs');
const AdmZip = require('adm-zip');
const args = require('minimist')(process.argv.slice(2));
const { downloadLocalFile } = require('./lib/DownloadLocalFile');
const { retryIfFailed } = require('./lib/RetryIfFailed');

const electronAppPackageJson = require('../../electron-app/app/package.json');

const branch = args['branch'] || 'master';
const exampleSlug = args['example'] || '3d-platformer';
const workDir = path.resolve(args['workDir'] || './.portable-cli-test');
const artifactsDir = path.resolve(
  args['artifactsDir'] || './portable-cli-artifacts'
);

const version = electronAppPackageJson.version;
const pathToArtifacts = `https://gdevelop-releases.s3.amazonaws.com/${branch}/latest`;
const portableZipName = `gdevelop-${version}.zip`;
const portableZipUrl = `${pathToArtifacts}/${portableZipName}`;

const EXAMPLES_REPO = 'https://github.com/GDevelopApp/GDevelop-examples.git';
const EXAMPLES_BRANCH = 'main';
const CLI_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * @param {string} msg
 * @returns {never}
 */
const fail = msg => {
  throw new Error(msg);
};

(async () => {
  shell.echo(`ℹ️ GDevelop version (from electron-app/app/package.json): ${version}`);
  shell.echo(`ℹ️ Branch: ${branch} — example: ${exampleSlug}`);
  shell.echo(`ℹ️ Work dir:      ${workDir}`);
  shell.echo(`ℹ️ Artifacts dir: ${artifactsDir}`);

  shell.mkdir('-p', workDir);
  shell.mkdir('-p', artifactsDir);

  // 1. Download the Linux portable zip.
  const portableZipPath = path.join(workDir, portableZipName);
  shell.echo(`🌐 Downloading ${portableZipUrl} ...`);
  await retryIfFailed(
    { times: 3, backoff: { initialDelay: 2000, factor: 2 } },
    () => downloadLocalFile(portableZipUrl, portableZipPath)
  );
  shell.echo(
    `✅ Downloaded ${portableZipName} (${formatBytes(
      fs.statSync(portableZipPath).size
    )})`
  );

  // 2. Extract the portable zip.
  const extractedDir = path.join(workDir, `gdevelop-${version}`);
  shell.rm('-rf', extractedDir);
  shell.mkdir('-p', extractedDir);
  shell.echo(`📂 Extracting portable zip to ${extractedDir} ...`);
  new AdmZip(portableZipPath).extractAllTo(extractedDir, /*overwrite=*/ true);

  // 3. Locate the GDevelop executable inside the extracted dir.
  const gdevelopBinary = findExecutable(extractedDir);
  if (!gdevelopBinary) {
    fail(
      `Could not find a GDevelop executable inside ${extractedDir}. ` +
        `Contents: ${shell.ls(extractedDir).join(', ')}`
    );
  }
  shell.echo(`✅ Found GDevelop binary: ${gdevelopBinary}`);
  shell.chmod('+x', gdevelopBinary);

  // 4. Fetch the example game from GDevelop-examples (sparse clone — the
  //    full repo is large so we only check out the one example folder).
  const exampleParentDir = path.join(workDir, 'example');
  shell.rm('-rf', exampleParentDir);
  shell.mkdir('-p', exampleParentDir);
  shell.echo(`🌐 Sparse-cloning ${exampleSlug} from GDevelop-examples ...`);
  cloneExampleSparse(EXAMPLES_REPO, EXAMPLES_BRANCH, exampleSlug, exampleParentDir);
  const exampleDir = path.join(exampleParentDir, 'examples', exampleSlug);
  const gameJsonPath = path.join(exampleDir, `${exampleSlug}.json`);
  if (!fs.existsSync(gameJsonPath)) {
    fail(
      `Example game project not found at ${gameJsonPath} after sparse clone.`
    );
  }
  shell.echo(`✅ Example game project: ${gameJsonPath}`);

  // 5. Run the GDevelop CLI export.
  shell.echo('🚀 Running GDevelop CLI HTML5 export ...');
  await runCliExport(gdevelopBinary, gameJsonPath);

  // 6. Verify the export.
  const exportedBuildDir = path.join(exampleDir, 'build');
  const exportedIndex = path.join(exportedBuildDir, 'index.html');
  if (!fs.existsSync(exportedIndex)) {
    fail(
      `Export did not produce an index.html at ${exportedIndex}. ` +
        `Build dir contents: ${
          fs.existsSync(exportedBuildDir)
            ? shell.ls(exportedBuildDir).join(', ')
            : '(missing)'
        }`
    );
  }
  const indexSize = fs.statSync(exportedIndex).size;
  if (indexSize < 200) {
    fail(`Exported index.html is suspiciously small (${indexSize} bytes).`);
  }
  shell.echo(`✅ index.html exported (${formatBytes(indexSize)})`);

  // 7. Zip the exported HTML5 game into the artifacts folder so the CI job
  //    can surface a single downloadable archive via store_artifacts.
  const artifactZipPath = path.join(
    artifactsDir,
    `${exampleSlug}-html5-${version}.zip`
  );
  shell.rm('-f', artifactZipPath);
  const outZip = new AdmZip();
  outZip.addLocalFolder(exportedBuildDir);
  outZip.writeZip(artifactZipPath);
  shell.echo(
    `✅ Exported game zipped to ${artifactZipPath} (${formatBytes(
      fs.statSync(artifactZipPath).size
    )})`
  );

  shell.echo('🎉 Portable CLI HTML5 export smoke test succeeded.');
})().catch(err => {
  shell.echo(`❌ ${err && err.stack ? err.stack : err}`);
  shell.exit(1);
});

// ---------------------------------------------------------------------------
// Helpers

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
 * @param {string} repoBranch
 * @param {string} slug
 * @param {string} dest
 */
function cloneExampleSparse(repoUrl, repoBranch, slug, dest) {
  const sh = cmd => {
    const r = shell.exec(cmd, { cwd: dest, silent: false });
    if (r.code !== 0) {
      throw new Error(`Command failed (${r.code}): ${cmd}`);
    }
  };
  sh('git init -q');
  sh(`git remote add origin ${repoUrl}`);
  sh('git config core.sparseCheckout true');
  sh('git sparse-checkout init --cone');
  sh(`git sparse-checkout set examples/${slug}`);
  sh(`git fetch --depth=1 origin ${repoBranch}`);
  sh('git checkout FETCH_HEAD');
}

/**
 * Run the GDevelop CLI export. Resolves on success, rejects on non-zero
 * exit. Times out (and SIGKILLs) after `CLI_TIMEOUT_MS`.
 * @param {string} gdevelopBinary
 * @param {string} gameJsonPath
 * @returns {Promise<void>}
 */
function runCliExport(gdevelopBinary, gameJsonPath) {
  return new Promise((resolve, reject) => {
    const cliArgs = [
      '--no-sandbox',
      '--disable-update-check',
      '--run-command',
      'EXPORT_HTML5_EXTERNAL',
      gameJsonPath,
    ];
    shell.echo(`▶ ${gdevelopBinary} ${cliArgs.join(' ')}`);
    const child = spawn(gdevelopBinary, cliArgs, { stdio: 'inherit' });

    const timer = setTimeout(() => {
      shell.echo('❌ CLI export timed out, killing process.');
      child.kill('SIGKILL');
    }, CLI_TIMEOUT_MS);

    child.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('exit', (code, signal) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `GDevelop CLI exited with code=${code} signal=${signal || 'none'}`
          )
        );
    });
  });
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${(n / 1024 / 1024).toFixed(1)} MiB`;
}
