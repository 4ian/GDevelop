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

  const downloadLibGdJs = gitRef =>
    new Promise((resolve, reject) => {
      shell.echo(`ℹ️ Trying to download libGD.js for ${gitRef}.`);

      var hashShellString = shell.exec(`git rev-parse ${gitRef}`, {
        silent: true,
      });
      if (hashShellString.stderr || hashShellString.code) {
        shell.echo(
          `❌ Can't find the hash of the associated commit. Are you using git to work on GDevelop?`
        );
        shell.echo(`ℹ️ Full error is: ${hashShellString.stderr}`);
        shell.exit(1);
        return;
      }
      var hash = (hashShellString.stdout || 'unknown-hash').trim();

      var request = https.get(
        `https://s3.amazonaws.com/gdevelop-gdevelop.js/${hash}/libGD.js`,
        function(response) {
          if (response.statusCode === 403) {
            shell.echo(`⚠️ Can't download libGD.js (can't find hash=${hash}).`);
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
              }) (hash=${hash}), try again later.`
            );
            reject();
            return;
          }

          resolve(response);
        }
      );
      request.on('error', function(err) {
        shell.echo(
          `⚠️ Can't download libGD.js (error: ${
            err.message
          }) (hash=${hash}), please check your internet connection.`
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
  // if not found.
  downloadLibGdJs('HEAD').then(onLibGdJsDownloaded, () =>
    downloadLibGdJs('HEAD~1').then(onLibGdJsDownloaded, () =>
      downloadLibGdJs('HEAD~2').then(onLibGdJsDownloaded, () =>
        downloadLibGdJs('HEAD~3').then(onLibGdJsDownloaded, () =>
          downloadLibGdJs('master').then(onLibGdJsDownloaded, () => {
            if (alreadyHasLibGdJs) {
              shell.echo(
                `ℹ️ Can't download any version of libGD.js, assuming you can go ahead with the existing one.`
              );
              shell.exit(1);
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
