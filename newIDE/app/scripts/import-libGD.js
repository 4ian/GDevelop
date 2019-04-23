var shell = require('shelljs');
var https = require('follow-redirects').https;
var fs = require('fs');

var sourceFile = '../../../Binaries/Output/libGD.js/Release/libGD.js';
var destinationTestDirectory = '../node_modules/libGD.js-for-tests-only';
var alreadyHasLibGdJs = shell.test('-f', '../public/libGD.js') && shell.test('-f', destinationTestDirectory + '/index.js');

if (shell.mkdir('-p', destinationTestDirectory).stderr) {
  shell.echo('❌ Error while creating node_modules folder for libGD.js');
}

if (shell.test('-f', sourceFile)) {
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
  shell.echo(
    '🌐 Downloading pre-built libGD.js from https://s3.amazonaws.com/gdevelop-gdevelop.js (be patient)...'
  );

  var hashShellString = shell.exec('git rev-parse HEAD', {silent: true});
  if (hashShellString.stderr || hashShellString.code) {
    shell.echo(
      `❌ Can't find the hash of the current commit. Are you using git to work on GDevelop?`
    );
    shell.echo(
      `ℹ️ Full error is: ${hashShellString.stderr}`
    );
    shell.exit(1);
    return;
  }
  var hash = (hashShellString.stdout || 'unknown-hash').trim();

  var file = fs.createWriteStream('../public/libGD.js');
  https.get(
    `https://s3.amazonaws.com/gdevelop-gdevelop.js/${hash}/libGD.js`,
    function(response) {
      if (response.statusCode === 403) {
        if (alreadyHasLibGdJs) {
          shell.echo(
            `ℹ️ Can't download libGD.js (forbidden access for hash=${hash}).`
          );
          shell.echo(
            `ℹ️ As you have already a version of libGD.js, assuming you can go ahead with the existing one (this is normal if you're working on the editor only and made some commits).`
          );

          shell.exit(0);
          return;
        }

        shell.echo(
          `❌ Can't download libGD.js (forbidden access for hash=${hash}).`
        );
        shell.echo(
          `ℹ️ Maybe libGD.js was not automatically built yet, try again in a few minutes.`
        );

        shell.exit(1);
        return;
      }
      if (response.statusCode !== 200) {
        shell.echo(
          `❌ Can't download libGD.js (${
            response.statusMessage
          }), please check your internet connection`
        );
        shell.exit(1);
        return;
      }

      response.pipe(file).on('finish', function() {
        shell.echo('✅ libGD.js downloaded and stored in public/libGD.js');

        if (
          !shell.cp(
            '../public/libGD.js',
            destinationTestDirectory + '/index.js'
          ).stderr
        ) {
          shell.echo('✅ Copied libGD.js to node_modules folder');
        } else {
          shell.echo('❌ Error while copying libGD.js to node_modules folder');
        }
      });
    }
  );
}
