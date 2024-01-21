var shell = require('shelljs');
var path = require('path');
var args = require('minimist')(process.argv.slice(2));

if (!shell.test('-f', './node_modules/.bin/electron-builder')) {
  shell.echo('⚠️ Please run npm install in electron-app folder');
  shell.exit(1);
}

if (!args['skip-app-build']) {
  const { code } = shell.exec('npm run app-build');
  if (code !== 0) {
    shell.echo(`❌ App build failed with code ${code}.`);
    shell.exit(code);
  }
}

const electronBuilder = path.join('node_modules', '.bin', 'electron-builder');
let electronBuilderArguments = process.argv
  .slice(2)
  .filter(arg => arg !== '--skip-app-build');
shell.exec(
  [
    electronBuilder,
    '--config=electron-builder-config.js',
    electronBuilderArguments.join(' '),
  ].join(' '),
  code => {
    if (code !== 0) {
      shell.echo(`❌ Electron build failed with code ${code}.`);
    }
    shell.exit(code);
  }
);
