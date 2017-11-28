var shell = require('shelljs');
var path = require('path');
var args = require('minimist')(process.argv.slice(2));
var isWin = /^win/.test(process.platform);
var isDarwin = /^darwin/.test(process.platform);

var gdRootDir = '../..';
var gdBinariesOutputDir = gdRootDir + '/Binaries/Output';

if (!shell.test('-f', './node_modules/.bin/build')) {
  shell.echo('⚠️ Please run npm install in electron-app folder');
  shell.exit(1);
}

if (!args['skip-app-build']) {
  shell.exec('npm run build:app');
}

var packageFlag = args['skip-packaging'] ? '' : '--dir';

shell.rm('-rf', 'app/www');
shell.mkdir('-p', 'app/www');
shell.cp('-r', '../app/build/*', 'app/www');

if (isDarwin) {
  shell.exec(path.join('node_modules', '.bin', 'build') + ' --mac ${packageFlag}');
  shell.mkdir('-p', gdBinariesOutputDir + '/Release_Darwin/newIDE');
  shell.rm('-rf', gdBinariesOutputDir + '/Release_Darwin/newIDE/GDevelop 5.app');
  shell.cp(
    '-rf',
    './dist/mac/GDevelop 5.app',
    gdBinariesOutputDir + '/Release_Darwin/newIDE'
  );
}

shell.exec(path.join('node_modules', '.bin', 'build') + ' --win --ia32 ${packageFlag}');
shell.mkdir('-p', gdBinariesOutputDir + '/Release_Windows/newIDE');
shell.cp(
  '-r',
  './dist/win-ia32-unpacked/*',
  gdBinariesOutputDir + '/Release_Windows/newIDE'
);

if (!isWin) {
  shell.exec(path.join('node_modules', '.bin', 'build') + ' --linux tar.gz');
  shell.mkdir('-p', gdBinariesOutputDir + '/Release_Linux/newIDE');
  shell.cp('-r', './dist/linux-unpacked/*', gdBinariesOutputDir + '/Release_Linux/newIDE');
}
