var shell = require('shelljs');
var https = require('follow-redirects').https;
var fs = require('fs');

var sourceFile = '../../../Binaries/Output/libGD.js/Release/libGD.js';
if (shell.test('-f', sourceFile)) {
  if (shell.cp(sourceFile, '../public')) {
    shell.echo(
      '✅ Copied libGD.js from Binaries/Output/libGD.js/Release to public folder'
    );
  } else {
    shell.echo(
      '❌ Error while copying libGD.js from Binaries/Output/libGD.js/Release'
    );
  }
} else if (shell.test('-f', '../public/libGD.js')) {
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
    'https://github.com/4ian/GDevelop.js/releases/download/4.0.94/libGD.js',
    function(response) {
      if (response.statusCode !== 200) {
        shell.echo(
          `❌ Can\'t download libGD.js (${response.statusMessage}), please check your internet connection`
        );
        shell.exit(1);
        return;
      }

      response.pipe(file).on('finish', function() {
        shell.echo('✅ libGD.js downloaded and store in public/libGD.js');
      });
    }
  );
}
