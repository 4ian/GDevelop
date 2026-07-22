// @ts-check
/**
 * End-to-end smoke test for the GDevelop "portable" build + CLI export.
 *
 * What it does:
 *   1. Reads the current GDevelop version from
 *      `newIDE/electron-app/app/package.json` (the source of truth, same
 *      as `make-version-metadata.js`).
 *   2. Gets the matching Linux portable zip, either from a local path
 *      (via --zipPath, e.g. the artifact a build-linux job just produced)
 *      or by downloading it from S3.
 *   3. Extracts it with adm-zip.
 *   4. Sparse-clones an example game from the GDevelop-examples repository
 *      (defaults to "3d-platformer").
 *   5. Runs a CLI command *before packaging* to mutate the project:
 *      `--run-command IMPORT_EXTENSION_AND_SAVE` imports one or more
 *      events-based extensions into the project and saves it back to disk.
 *      This exercises the headless project mutate + save round-trip added in
 *      #8847 (the generic CLI command runner), and proves that a *separate*
 *      later CLI invocation picks the persisted changes up.
 *   6. Runs `--run-command SET_PROJECT_PROPERTIES` to change several game
 *      properties (name, version, orientation, resolution) and save, then
 *      verifies the changes are persisted in the project file.
 *   7. Runs the extracted GDevelop binary in CLI mode with
 *      `--run-command EXPORT_HTML5_EXTERNAL` to package the game to HTML5.
 *   8. Verifies the exported HTML5 game looks valid (e.g. `index.html`
 *      exists) and zips it into the artifacts folder.
 *
 * Usage:
 *   node test-portable-cli-export.js [--branch=master] [--example=3d-platformer]
 *                                    [--zipPath=/path/to/gdevelop-X.Y.Z.zip]
 *                                    [--extension=/path/to/Extension.json]
 *                                    [--no-extension-import]
 *                                    [--no-set-properties]
 *                                    [--workDir=./.portable-cli-test]
 *                                    [--artifactsDir=./portable-cli-artifacts]
 *
 * `--extension` can be repeated to import several extensions. When omitted, a
 * real, dependency-free events-based extension bundled in the repository is
 * used. Pass `--no-extension-import` to skip the extension import step and
 * `--no-set-properties` to skip the project properties step; either way the
 * plain HTML5 export still runs.
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
// If set, use this local zip instead of downloading from S3 (useful when
// running the smoke test right after a build-linux job that already produced
// the portable zip on disk).
const localZipPath = args['zipPath'] ? path.resolve(args['zipPath']) : null;

// Default extension imported before packaging. `EBAsyncAction.json` is a real,
// dependency-free events-based extension (behavior + object + async functions)
// kept valid by the GDevelop.js integration tests, so it is a safe, always
// up-to-date sample to import headlessly. Override with one or more
// `--extension` flags, or disable the step with `--no-extension-import`.
const DEFAULT_EXTENSION_PATH = path.resolve(
  __dirname,
  '../../../GDevelop.js/__tests__/extensions/EBAsyncAction.json'
);
const extensionPaths = args['no-extension-import']
  ? []
  : (Array.isArray(args['extension'])
      ? args['extension']
      : args['extension']
      ? [args['extension']]
      : [DEFAULT_EXTENSION_PATH]
    ).map(extensionPath => path.resolve(extensionPath));

// Deterministic project property changes applied (and saved) via the
// SET_PROJECT_PROPERTIES CLI command before packaging. Each entry is the
// `key=value` pair passed to the command and the corresponding key to check
// afterwards in the saved project's `properties` object. Disable the whole
// step with `--no-set-properties`.
const shouldSetProjectProperties = !args['no-set-properties'];
const projectPropertyChanges = [
  { arg: 'name=CLI smoke test game', savedKey: 'name', expected: 'CLI smoke test game' },
  { arg: 'version=9.9.9', savedKey: 'version', expected: '9.9.9' },
  { arg: 'orientation=portrait', savedKey: 'orientation', expected: 'portrait' },
  { arg: 'resolutionWidth=1280', savedKey: 'windowWidth', expected: 1280 },
  { arg: 'resolutionHeight=720', savedKey: 'windowHeight', expected: 720 },
];

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

  // 1. Get the Linux portable zip — either from a local path passed in via
  //    --zipPath (e.g. when chained after a build-linux job) or by
  //    downloading the latest version from S3.
  let portableZipPath;
  if (localZipPath) {
    if (!fs.existsSync(localZipPath)) {
      fail(`Local --zipPath does not exist: ${localZipPath}`);
    }
    portableZipPath = localZipPath;
    shell.echo(
      `📦 Using local portable zip: ${portableZipPath} (${formatBytes(
        fs.statSync(portableZipPath).size
      )})`
    );
  } else {
    portableZipPath = path.join(workDir, portableZipName);
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
  }

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

  // 5. Before packaging, run a CLI command that mutates the project: import
  //    events-based extension(s) and save the project back to disk. This
  //    exercises the generic CLI command runner (#8847) and the headless
  //    mutate + save round-trip, so the export at step 7 runs against a
  //    project that was modified by an earlier, separate CLI invocation.
  if (extensionPaths.length > 0) {
    for (const extensionPath of extensionPaths) {
      if (!fs.existsSync(extensionPath)) {
        fail(`Extension file to import does not exist: ${extensionPath}`);
      }
    }
    const expectedExtensionNames = extensionPaths.map(readExtensionName);
    const extensionNamesBefore = readProjectExtensionNames(gameJsonPath);
    shell.echo(
      `🧩 Importing ${extensionPaths.length} extension(s) before packaging: ` +
        `${expectedExtensionNames.join(', ')}`
    );
    await runCliCommand(gdevelopBinary, {
      command: 'IMPORT_EXTENSION_AND_SAVE',
      gameJsonPath,
      cmdArgs: extensionPaths,
    });

    // The command saves the project in place — verify the imported extensions
    // are now persisted in the game file (i.e. the save actually happened).
    const extensionNamesAfter = readProjectExtensionNames(gameJsonPath);
    const missing = expectedExtensionNames.filter(
      name => !extensionNamesAfter.includes(name)
    );
    if (missing.length > 0) {
      fail(
        `IMPORT_EXTENSION_AND_SAVE did not persist extension(s) [${missing.join(
          ', '
        )}] into ${gameJsonPath}. ` +
          `Extensions before: [${extensionNamesBefore.join(', ')}], ` +
          `after: [${extensionNamesAfter.join(', ')}].`
      );
    }
    shell.echo(
      `✅ Extension(s) imported and saved into the project: ${expectedExtensionNames.join(
        ', '
      )}`
    );
  } else {
    shell.echo('⏭️  Skipping extension import step (--no-extension-import).');
  }

  // 6. Manipulate the project via CLI: change several game properties (name,
  //    version, orientation, resolution) and save. Another headless mutate +
  //    save round-trip, verified against the re-read project file below.
  if (shouldSetProjectProperties) {
    shell.echo(
      `🛠️  Setting project properties before packaging: ${projectPropertyChanges
        .map(change => change.arg)
        .join(', ')}`
    );
    await runCliCommand(gdevelopBinary, {
      command: 'SET_PROJECT_PROPERTIES',
      gameJsonPath,
      cmdArgs: projectPropertyChanges.map(change => change.arg),
    });

    const savedProperties = readProjectProperties(gameJsonPath);
    const mismatches = projectPropertyChanges.filter(
      change => savedProperties[change.savedKey] !== change.expected
    );
    if (mismatches.length > 0) {
      fail(
        `SET_PROJECT_PROPERTIES did not persist: ${mismatches
          .map(
            change =>
              `${change.savedKey} expected ${JSON.stringify(
                change.expected
              )}, got ${JSON.stringify(savedProperties[change.savedKey])}`
          )
          .join('; ')}.`
      );
    }
    shell.echo('✅ Project properties updated and saved.');
  } else {
    shell.echo('⏭️  Skipping project properties step (--no-set-properties).');
  }

  // 7. Run the GDevelop CLI export to package the (possibly mutated) project.
  shell.echo('🚀 Running GDevelop CLI HTML5 export ...');
  await runCliCommand(gdevelopBinary, {
    command: 'EXPORT_HTML5_EXTERNAL',
    gameJsonPath,
  });

  // 8. Verify the export.
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

  // 9. Zip the exported HTML5 game into the artifacts folder so the CI job
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
 * Run a GDevelop `--run-command` CLI command headlessly. Resolves on success,
 * rejects on non-zero exit. Times out (and SIGKILLs) after `CLI_TIMEOUT_MS`.
 * Each `cmdArgs` entry is forwarded via its own repeated `--cmd-args` flag, as
 * the command runner expects (e.g. one flag per extension path).
 * @param {string} gdevelopBinary
 * @param {{ command: string, gameJsonPath: string, cmdArgs?: string[] }} options
 * @returns {Promise<void>}
 */
function runCliCommand(gdevelopBinary, { command, gameJsonPath, cmdArgs = [] }) {
  return new Promise((resolve, reject) => {
    const cliArgs = [
      '--no-sandbox',
      '--disable-update-check',
      '--run-command',
      command,
      gameJsonPath,
      ...cmdArgs.reduce(
        (flags, value) => flags.concat(['--cmd-args', value]),
        /** @type {string[]} */ ([])
      ),
    ];
    shell.echo(`▶ ${gdevelopBinary} ${cliArgs.join(' ')}`);
    const child = spawn(gdevelopBinary, cliArgs, { stdio: 'inherit' });

    const timer = setTimeout(() => {
      shell.echo(`❌ CLI command "${command}" timed out, killing process.`);
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
            `GDevelop CLI command "${command}" exited with code=${code} signal=${signal ||
              'none'}`
          )
        );
    });
  });
}

/**
 * Read the `name` of a serialized events-based extension file.
 * @param {string} extensionPath
 * @returns {string}
 */
function readExtensionName(extensionPath) {
  const extension = JSON.parse(fs.readFileSync(extensionPath, 'utf8'));
  if (!extension || typeof extension.name !== 'string' || !extension.name) {
    fail(`Extension file has no "name" field: ${extensionPath}`);
  }
  return extension.name;
}

/**
 * Read the names of the events-based extensions currently in a project file.
 * @param {string} gameJsonPath
 * @returns {string[]}
 */
function readProjectExtensionNames(gameJsonPath) {
  const project = JSON.parse(fs.readFileSync(gameJsonPath, 'utf8'));
  const extensions = project.eventsFunctionsExtensions;
  if (!Array.isArray(extensions)) return [];
  return extensions.map(extension => extension && extension.name).filter(Boolean);
}

/**
 * Read the public `properties` object of a project file (name, version,
 * windowWidth, ...).
 * @param {string} gameJsonPath
 * @returns {{ [key: string]: any }}
 */
function readProjectProperties(gameJsonPath) {
  const project = JSON.parse(fs.readFileSync(gameJsonPath, 'utf8'));
  return project.properties || {};
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KiB`;
  return `${(n / 1024 / 1024).toFixed(1)} MiB`;
}
