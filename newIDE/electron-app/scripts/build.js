var shell = require('shelljs');
var args = require('minimist')(process.argv.slice(2));

if (!shell.which('npx')) {
  shell.echo('⚠️ npx is not available. Please install Node.js/npm.');
  shell.exit(1);
}

if (!args['skip-app-build']) {
  const { code } = shell.exec('npm run app-build');
  if (code !== 0) {
    shell.echo(`❌ App build failed with code ${code}.`);
    shell.exit(code);
  }
}

let electronBuilderArguments = process.argv
  .slice(2)
  .filter(arg => arg !== '--skip-app-build');
shell.exec(
  [
    'npx electron-builder',
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
