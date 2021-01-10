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

// Build GDJS
const output = shell.exec(`node scripts/build.js`, {
  cwd: path.join(gdevelopRootPath, 'GDJS'),
});
if (output.code !== 0) {
  shell.exit(0);
}

// Then copy the Runtime to the IDE
const copyOptions = {
  overwrite: true,
  expand: true,
  dot: true,
  junk: true,
};

shell.echo(
  `ℹ️ Copying GDJS and extensions runtime files (*.js) to ${destinationPaths.join(
    ', '
  )}...`
);
destinationPaths.forEach(destinationPath => {
  if (args.clean) {
    shell.echo(`ℹ️ Cleaning destination first...`);
    shell.rm('-rf', destinationPath);
  }
  shell.mkdir('-p', destinationPath);

  const startTime = Date.now();
  return copy(
    path.join(gdevelopRootPath, 'GDJS', 'Runtime-bundled'),
    destinationPath,
    copyOptions
  )
    .then(function(results) {
      const totalFilesCount = results.length;
      const duration = Date.now() - startTime;
      console.info(
        `✅ Runtime files copy done (${totalFilesCount} file(s) copied in ${duration}ms).`
      );
    })
    .catch(function(error) {
      console.error('❌ Copy failed: ', error);
    });
});
