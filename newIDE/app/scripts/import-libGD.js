const shell = require('shelljs');
const { downloadLocalFile } = require('./lib/DownloadLocalFile');
const path = require('path');

const sourceDirectory = '../../../Binaries/embuild/GDevelop.js';
const destinationTestDirectory = '../node_modules/libGD.js-for-tests-only';
const alreadyHasLibGdJs =
  shell.test('-f', '../public/libGD.js') &&
  shell.test('-f', '../public/libGD.wasm') &&
  shell.test('-f', destinationTestDirectory + '/index.js') &&
  shell.test('-f', destinationTestDirectory + '/libGD.wasm');

if (shell.mkdir('-p', destinationTestDirectory).stderr) {
  shell.echo('❌ Error while creating node_modules folder for libGD.js');
}

if (shell.test('-f', path.join(sourceDirectory, 'libGD.js'))) {
  shell.echo(
    'ℹ️  Copying libGD.js and associated files built locally to newIDE...'
  );
  const copyToNewIDEScriptPath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'GDevelop.js',
    'scripts',
    'copy-to-newIDE.js'
  );
  shell.exec(`node ${copyToNewIDEScriptPath}`);
} else {
  // Download a pre-built version otherwise
  shell.echo(
    '🌐 Downloading pre-built libGD.js from https://s3.amazonaws.com/gdevelop-gdevelop.js (be patient)...'
  );

  // Try to download libGD.js from a specific commit on the current branch
  const downloadCommitLibGdJs = gitRef =>
    new Promise((resolve, reject) => {
      shell.echo(`ℹ️ Trying to download libGD.js for ${gitRef}.`);

      var hashShellString = shell.exec(`git rev-parse "${gitRef}"`, {
        silent: true,
      });
      var branchShellString = shell.exec(
        `git rev-parse --abbrev-ref "${gitRef}"`,
        {
          silent: true,
        }
      );
      if (
        hashShellString.stderr ||
        hashShellString.code ||
        branchShellString.stderr ||
        branchShellString.code
      ) {
        shell.echo(
          `⚠️ Can't find the hash or branch of the associated commit.`
        );
        reject();
        return;
      }
      var hash = (hashShellString.stdout || 'unknown-hash').trim();
      var branch = (branchShellString.stdout || 'unknown-branch').trim();

      resolve(
        downloadLibGdJs(
          `https://s3.amazonaws.com/gdevelop-gdevelop.js/${branch}/commit/${hash}`
        )
      );
    });

  // Try to download libGD.js from the latest version built for master branch.
  const downloadMasterLatestLibGdJs = () => {
    shell.echo(`ℹ️ Trying to download libGD.js from master, latest build.`);

    return downloadLibGdJs(
      `https://s3.amazonaws.com/gdevelop-gdevelop.js/master/latest`
    );
  };

  const downloadLibGdJs = baseUrl =>
    Promise.all([
      downloadLocalFile(baseUrl + '/libGD.js', '../public/libGD.js'),
      downloadLocalFile(baseUrl + '/libGD.wasm', '../public/libGD.wasm'),
    ]).then(
      responses => {},
      error => {
        if (error.statusCode === 403) {
          shell.echo(
            `ℹ️ Maybe libGD.js was not automatically built yet, try again in a few minutes.`
          );
          throw error;
        }
        if (error.statusCode === 0) {
          shell.echo(
            `⚠️ Can't download libGD.js (error: ${
              error.statusMessage
            }) (baseUrl=${baseUrl}), please check your internet connection.`
          );
          throw error;
        }

        shell.echo(
          `⚠️ Can't download libGD.js (${
            error.statusMessage
          }) (baseUrl=${baseUrl}), try again later.`
        );
        throw error;
      }
    );

  const onLibGdJsDownloaded = response => {
    shell.echo('✅ libGD.js downloaded and stored in public/libGD.js');

    if (
      !shell.cp('../public/libGD.js', destinationTestDirectory + '/index.js')
        .stderr &&
      !shell.cp(
        '../public/libGD.wasm',
        destinationTestDirectory + '/libGD.wasm'
      ).stderr
    ) {
      shell.echo('✅ Copied libGD.js to node_modules folder');
    } else {
      shell.echo('❌ Error while copying libGD.js to node_modules folder');
    }
  };

  // Try to download the latest libGD.js, fallback to previous or master ones
  // if not found (including different parents, for handling of merge commits).
  downloadCommitLibGdJs('HEAD').then(onLibGdJsDownloaded, () =>
    downloadCommitLibGdJs('HEAD~1').then(onLibGdJsDownloaded, () =>
      downloadCommitLibGdJs('HEAD~2').then(onLibGdJsDownloaded, () =>
        downloadCommitLibGdJs('HEAD~3').then(onLibGdJsDownloaded, () =>
          downloadMasterLatestLibGdJs().then(onLibGdJsDownloaded, () => {
            if (alreadyHasLibGdJs) {
              shell.echo(
                `ℹ️ Can't download any version of libGD.js, assuming you can go ahead with the existing one.`
              );
              shell.exit(0);
              return;
            } else {
              shell.echo(
                `❌ Can't download any version of libGD.js, please check your internet connection.`
              );
              shell.exit(1);
              return;
            }
          })
        )
      )
    )
  );
}
