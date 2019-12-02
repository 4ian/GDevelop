var shell = require('shelljs');
var path = require('path');
var isWin = /^win/.test(process.platform);

var destFolder = path.join(__dirname, '..', 'resources', 'GDJS', 'Runtime');
var destFolder2 = path.join(__dirname, '..', 'node_modules', 'GDJS-for-web-app-only', 'Runtime');
var gdjsScriptsFolder = path.join(__dirname, '../../../GDJS/scripts');

if (isWin) {
  shell.exec('CopyRuntimeToGD.bat ' + "\"" + destFolder + "\"", {
    cwd: gdjsScriptsFolder,
  });
  shell.exec('CopyRuntimeToGD.bat ' + "\"" + destFolder2 + "\"", {
    cwd: gdjsScriptsFolder,
  });
} else {
  shell.rm('-rf', destFolder);
  shell.rm('-rf', destFolder2);
  shell.exec('./CopyRuntimeToGD.sh ' + destFolder, {
    cwd: gdjsScriptsFolder,
  });
  shell.exec('./CopyRuntimeToGD.sh ' + destFolder2, {
    cwd: gdjsScriptsFolder,
  });
}
