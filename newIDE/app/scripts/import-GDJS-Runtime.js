var shell = require('shelljs');
var path = require('path');
var isWin = /^win/.test(process.platform);

var destFolder = path.join(process.cwd(), '..', 'resources', 'GDJS', 'Runtime');
var gdjsScriptsFolder = '../../../GDJS/scripts';

if (isWin) {
  shell.exec('CopyRuntimeToGD.bat ' + destFolder, {
    cwd: gdjsScriptsFolder,
  });
} else {
  shell.exec('./CopyRuntimeToGD.sh ' + destFolder, {
    cwd: gdjsScriptsFolder,
  });
}
