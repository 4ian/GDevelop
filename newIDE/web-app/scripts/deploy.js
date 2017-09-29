var shell = require('shelljs');
var path = require('path');
var args = require('minimist')(process.argv.slice(2));
const ghpages = require('gh-pages');

if (!shell.test('-f', './node_modules/shelljs/shell.js')) {
  shell.echo('⚠️ Please run npm install in web-app folder');
  shell.exit(1);
}

if (!args['skip-app-build']) {
  shell.exec('npm run build:app');
}

shell.rm('-rf', 'dist');
shell.mkdir('-p', 'dist');
shell.cp('-r', '../app/build/*', 'dist');
shell.rm('dist/static/js/*.map');

if (!args['skip-deploy']) {
  shell.echo('🚄 Uploading the built app to gh-pages...');
  ghpages.publish('dist', {}, (err) => {
    if (err) {
      shell.echo('❌ Finished with error:');
      shell.echo(err);
      return;
    }

    shell.echo('✅ Upload finished');
  })
}
