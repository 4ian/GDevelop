var shell = require('shelljs');

var sourceFile = '../../../Binaries/Output/libGD.js/Release/libGD.js';
if (shell.test('-f', sourceFile)) {
  shell.cp(sourceFile, '../public');
} else {
  shell.echo(
    'Unable to find libGD.js, make sure that libGD.js is compiled in Binaries/Output/libGD.js/Release'
  );
}
