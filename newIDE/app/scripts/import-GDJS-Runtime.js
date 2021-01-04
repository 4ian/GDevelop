const shell = require('shelljs');
const path = require('path');
const copy = require('recursive-copy');
const args = require('minimist')(process.argv.slice(2));

const gdevelopRootPath = path.join(__dirname, '..', '..', '..');
const destinationPaths = [
  path.join(__dirname, '..', 'resources', 'GDJS', 'Runtime'),
  path.join(
    __dirname,
    '..',
    'node_modules',
    'GDJS-for-web-app-only',
    'Runtime'
  ),
];

const copyOptions = {
  overwrite: true,
  expand: true,
  dot: true,
  junk: true,
};

destinationPaths.forEach(destinationPath => {
  shell.echo(
    `ℹ️ Copying GDJS and extensions runtime files (*.js) to "${destinationPath}"...`
  );

  if (args.clean) {
    shell.echo(`ℹ️ Cleaning destination first...`);
    shell.rm('-rf', destinationPath);
  }
  shell.mkdir('-p', destinationPath);

  copy(
    path.join(gdevelopRootPath, 'GDJS', 'Runtime'),
    destinationPath,
    copyOptions
  )
    .then(function(results) {
      console.info(
        `✅ GDJS and extensions runtime copy succeeded (${
          results.length
        } file(s) copied`
      );
    })
    .catch(function(error) {
      console.error('❌ Copy failed: ' + error);
    });

  copy(
    path.join(gdevelopRootPath, 'Extensions'),
    path.join(destinationPath, 'Extensions'),
    {
      ...copyOptions,
      filter: ['**/*.js'],
    }
  )
    .then(function(results) {
      console.info(
        `✅ GDJS and extensions runtime copy succeeded (${
          results.length
        } file(s) copied`
      );
    })
    .catch(function(error) {
      console.error('❌ Copy failed: ' + error);
    });
});
