var shell = require('shelljs');
var https = require('follow-redirects').https;
var fs = require('fs');

var sourceFile = '../../../Binaries/Output/libGD.js/Release/libGD.js';
var destinationTestDirectory = '../node_modules/libGD.js-for-tests-only';

if (!shell.mkdir(destinationTestDirectory)) {
  shell.echo('❌ Error while creating node_modules folder for libGD.js');
}

if (shell.test('-f', sourceFile)) {
  if (
    shell.cp(sourceFile, '../public') &&
    shell.cp(sourceFile, destinationTestDirectory + '/index.js')
  ) {
    shell.echo(
      '✅ Copied libGD.js from Binaries/Output/libGD.js/Release to public and node_modules folder'
    );
  } else {
    shell.echo(
      '❌ Error while copying libGD.js from Binaries/Output/libGD.js/Release'
    );
  }
} else if (
  shell.test('-f', '../public/libGD.js') &&
  shell.test('-f', destinationTestDirectory + '/index.js')
) {
  //Nothing to do

  shell.echo(
    '✅ libGD.js already existing in public folder - skipping download'
  );
} else {
  shell.echo(
    '🌐 Unable to find libGD.js, downloading it from github.com/4ian/GDevelop.js (be patient)...'
  );

  var file = fs.createWriteStream('../public/libGD.js');
  https.get(
    'https://github.com/4ian/GDevelop.js/releases/download/4.0.96/libGD.js',
    function(response) {
      if (response.statusCode !== 200) {
        shell.echo(
          `❌ Can't download libGD.js (${response.statusMessage}), please check your internet connection`
        );
        shell.exit(1);
        return;
      }

      response.pipe(file).on('finish', function() {
        shell.echo('✅ libGD.js downloaded and stored in public/libGD.js');

        if (
          shell.cp('../public/libGD.js', destinationTestDirectory + '/index.js')
        ) {
          shell.echo('✅ Copied libGD.js to node_modules folder');
        } else {
          shell.echo('❌ Error while copying libGD.js to node_modules folder');
        }
      });
    }
  );
}
