const { spawnSync, execSync } = require('child_process');
const { downloadLocalFile } = require('./lib/DownloadLocalFile');
const path = require('path');
const fs = require('fs');

const sourceDirectory = '../../../Binaries/embuild/GDevelop.js';
const destinationTestDirectory = '../node_modules/libGD.js-for-tests-only';

const fileExists = filePath => fs.existsSync(filePath);
const ensureDir = dirPath => fs.mkdirSync(dirPath, { recursive: true });
const copyFile = (from, to) => fs.copyFileSync(from, to);

const alreadyHasLibGdJs =
  fileExists('../public/libGD.js') &&
  fileExists('../public/libGD.wasm') &&
  fileExists(destinationTestDirectory + '/index.js') &&
  fileExists(destinationTestDirectory + '/libGD.wasm');

try {
  ensureDir(destinationTestDirectory);
} catch (error) {
  console.error('Error while creating node_modules folder for libGD.js');
}

const runNodeScript = scriptPath => {
  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: 'inherit',
  });
  return result.status === 0;
};

const getGitOutput = command => {
  try {
    return execSync(command, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (error) {
    return null;
  }
};

const getBranchFromGitRef = gitRef => {
  let branch = getGitOutput(`git rev-parse --abbrev-ref "${gitRef}"`);
  if (branch === null) return null;

  if (branch === 'HEAD') {
    if (process.env.SEMAPHORE_GIT_BRANCH) {
      branch = process.env.SEMAPHORE_GIT_BRANCH;
    } else if (process.env.APPVEYOR_PULL_REQUEST_HEAD_REPO_BRANCH) {
      branch = process.env.APPVEYOR_PULL_REQUEST_HEAD_REPO_BRANCH;
    } else if (process.env.APPVEYOR_REPO_BRANCH) {
      branch = process.env.APPVEYOR_REPO_BRANCH;
    }
  }

  if (branch === 'HEAD') {
    branch = '';
  }

  if (!branch) {
    console.warn(
      "Warning: Can't find the branch of the associated commit - if you're in detached HEAD, you need to be on a branch instead."
    );
    return 'unknown-branch';
  }

  return branch;
};

const MIN_LIBGD_JS_SIZE_BYTES = 1024 * 1024;
const MIN_LIBGD_WASM_SIZE_BYTES = 1024 * 1024;

const validateDownloadedLibGdJs = baseUrl => {
  const libGdJsPath = path.join(__dirname, '..', 'public', 'libGD.js');
  const libGdWasmPath = path.join(__dirname, '..', 'public', 'libGD.wasm');

  if (!fileExists(libGdJsPath) || !fileExists(libGdWasmPath)) {
    console.warn(
      `Warning: Downloaded libGD.js is incomplete (baseUrl=${baseUrl}), trying another source.`
    );
    throw new Error('Incomplete libGD.js download');
  }

  const libGdJsSize = fs.statSync(libGdJsPath).size;
  const libGdWasmSize = fs.statSync(libGdWasmPath).size;
  if (
    libGdJsSize < MIN_LIBGD_JS_SIZE_BYTES ||
    libGdWasmSize < MIN_LIBGD_WASM_SIZE_BYTES
  ) {
    console.warn(
      `Warning: Downloaded libGD.js assets are unexpectedly small (baseUrl=${baseUrl}), trying another source.`
    );
    throw new Error('Incomplete libGD.js download (unexpected file size)');
  }

  const syntaxCheckResult = spawnSync(process.execPath, ['--check', libGdJsPath], {
    stdio: 'ignore',
  });
  if (syntaxCheckResult.status !== 0) {
    console.warn(
      `Warning: Downloaded libGD.js is not valid JavaScript (baseUrl=${baseUrl}), trying another source.`
    );
    throw new Error('Invalid libGD.js JavaScript syntax');
  }
};

const downloadLibGdJs = baseUrl =>
  Promise.all([
    downloadLocalFile(baseUrl + '/libGD.js', '../public/libGD.js'),
    downloadLocalFile(baseUrl + '/libGD.wasm', '../public/libGD.wasm'),
  ]).then(
    responses => {
      validateDownloadedLibGdJs(baseUrl);
      return responses;
    },
    error => {
      if (error.statusCode === 403) {
        console.info(
          'Maybe libGD.js was not automatically built yet, try again in a few minutes.'
        );
        throw error;
      }
      if (error.statusCode === 0) {
        console.warn(
          `Warning: Can't download libGD.js (error: ${error.statusMessage}) (baseUrl=${baseUrl}), please check your internet connection.`
        );
        throw error;
      }

      console.warn(
        `Warning: Can't download libGD.js (${error.statusMessage}) (baseUrl=${baseUrl}), try again later.`
      );
      throw error;
    }
  );

const wait = milliseconds =>
  new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });

const downloadLibGdJsWithRetries = (baseUrl, maxAttempts = 3) => {
  let attempt = 1;
  const download = () =>
    downloadLibGdJs(baseUrl).catch(error => {
      if (attempt >= maxAttempts) {
        throw error;
      }
      attempt += 1;
      console.warn(
        `Warning: Retrying libGD.js download from ${baseUrl} (attempt ${attempt}/${maxAttempts}).`
      );
      return wait(attempt * 1000).then(download);
    });
  return download();
};

const downloadCommitLibGdJs = gitRef =>
  new Promise((resolve, reject) => {
    console.info(`Trying to download libGD.js for ${gitRef}.`);

    const hash = getGitOutput(`git rev-parse "${gitRef}"`);
    const branch = getBranchFromGitRef(gitRef);
    if (!hash || !branch) {
      console.warn("Warning: Can't find the hash or branch of the associated commit.");
      reject();
      return;
    }

    resolve(
      downloadLibGdJsWithRetries(
        `https://s3.amazonaws.com/gdevelop-gdevelop.js/${branch}/commit/${hash}`
      )
    );
  });

const downloadBranchLatestLibGdJs = branchName => {
  console.info(`Trying to download libGD.js from ${branchName}, latest build.`);
  return downloadLibGdJsWithRetries(
    `https://s3.amazonaws.com/gdevelop-gdevelop.js/${branchName}/latest`
  );
};

const onLibGdJsDownloaded = () => {
  console.info('libGD.js downloaded and stored in public/libGD.js');

  try {
    copyFile('../public/libGD.js', destinationTestDirectory + '/index.js');
    copyFile('../public/libGD.wasm', destinationTestDirectory + '/libGD.wasm');
    console.info('Copied libGD.js to node_modules folder');
  } catch (error) {
    console.error('Error while copying libGD.js to node_modules folder');
  }
};

if (fileExists(path.join(sourceDirectory, 'libGD.js'))) {
  console.info('Copying libGD.js and associated files built locally to newIDE...');
  const copyToNewIDEScriptPath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'GDevelop.js',
    'scripts',
    'copy-to-newIDE.js'
  );
  if (!runNodeScript(copyToNewIDEScriptPath)) {
    process.exit(1);
  }
} else {
  // Download a pre-built version otherwise
  console.info(
    'Downloading pre-built libGD.js from https://s3.amazonaws.com/gdevelop-gdevelop.js (be patient)...'
  );

  const branch = getBranchFromGitRef('HEAD');

  // Try to download the latest libGD.js, fallback to previous or master ones
  // if not found (including different parents, for handling of merge commits).
  downloadCommitLibGdJs('HEAD').then(onLibGdJsDownloaded, () => {
    // Force the exact version of GDevelop.js to be downloaded for AppVeyor - because
    // this means we build the app and we don't want to risk mismatch (Core C++ not up to date
    // with the IDE JavaScript).
    if (process.env.APPVEYOR || process.env.REQUIRES_EXACT_LIBGD_JS_VERSION) {
      console.error(
        "Can't download the exact required version of libGD.js - check it was built by CircleCI before running this CI."
      );
      console.info(
        'See the pipeline on https://app.circleci.com/pipelines/github/4ian/GDevelop.'
      );
      process.exit(1);
    }

    downloadCommitLibGdJs('HEAD~1').then(onLibGdJsDownloaded, () =>
      downloadCommitLibGdJs('HEAD~2').then(onLibGdJsDownloaded, () =>
        downloadCommitLibGdJs('HEAD~3').then(onLibGdJsDownloaded, () =>
          downloadBranchLatestLibGdJs(branch).then(onLibGdJsDownloaded, () =>
            downloadBranchLatestLibGdJs('master').then(onLibGdJsDownloaded, () => {
              if (alreadyHasLibGdJs) {
                console.info(
                  "Can't download any version of libGD.js, assuming you can go ahead with the existing one."
                );
                process.exit(0);
                return;
              } else {
                console.error(
                  "Can't download any version of libGD.js, please check your internet connection."
                );
                process.exit(1);
                return;
              }
            })
          )
        )
      )
    );
  });
}
