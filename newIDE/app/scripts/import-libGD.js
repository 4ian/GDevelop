var shell = require('shelljs');
var https = require('follow-redirects').https;
var fs = require('fs');

var sourceFile = '../../../Binaries/Output/libGD.js/Release/libGD.js';
var destinationTestDirectory = '../node_modules/libGD.js-for-tests-only';
var alreadyHasLibGdJs =
  shell.test('-f', '../public/libGD.js') &&
  shell.test('-f', destinationTestDirectory + '/index.js');

if (shell.mkdir('-p', destinationTestDirectory).stderr) {
  shell.echo('❌ Error while creating node_modules folder for libGD.js');
}

if (shell.test('-f', sourceFile)) {
  // Copy the file built locally
  if (
    !shell.cp(sourceFile, '../public').stderr &&
    !shell.cp(sourceFile, destinationTestDirectory + '/index.js').stderr
  ) {
    shell.echo(
      '✅ Copied libGD.js from Binaries/Output/libGD.js/Release to public and node_modules folder'
    );
  } else {
    shell.echo(
      '❌ Error while copying libGD.js from Binaries/Output/libGD.js/Release'
    );
  }
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

      resolve(downloadLibGdJs(
        `https://s3.amazonaws.com/gdevelop-gdevelop.js/${branch}/commit/${hash}/libGD.js`
      ));
    });

  // Try to download libGD.js from the latest version built for master branch.
  const downloadMasterLatestLibGdJs = () => {
    shell.echo(`ℹ️ Trying to download libGD.js from master, latest build.`);

    return downloadLibGdJs(
      `https://s3.amazonaws.com/gdevelop-gdevelop.js/master/latest/libGD.js`
    );
  };

  const downloadLibGdJs = url =>
    new Promise((resolve, reject) => {
      var request = https.get(url, function(response) {
        if (response.statusCode === 403) {
          shell.echo(`⚠️ Can't download libGD.js (can't find url: ${url}).`);
          shell.echo(
            `ℹ️ Maybe libGD.js was not automatically built yet, try again in a few minutes.`
          );

          reject();
          return;
        }
        if (response.statusCode !== 200) {
          shell.echo(
            `⚠️ Can't download libGD.js (${
              response.statusMessage
            }) (url=${url}), try again later.`
          );
          reject();
          return;
        }

        resolve(response);
      });
      request.on('error', function(err) {
        shell.echo(
          `⚠️ Can't download libGD.js (error: ${
            err.message
          }) (url=${url}), please check your internet connection.`
        );
        reject();
        return;
      });
    });

  const onLibGdJsDownloaded = response => {
    var file = fs.createWriteStream('../public/libGD.js');
    response.pipe(file).on('finish', function() {
      shell.echo('✅ libGD.js downloaded and stored in public/libGD.js');

      if (
        !shell.cp('../public/libGD.js', destinationTestDirectory + '/index.js')
          .stderr
      ) {
        shell.echo('✅ Copied libGD.js to node_modules folder');
      } else {
        shell.echo('❌ Error while copying libGD.js to node_modules folder');
      }
    });
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
