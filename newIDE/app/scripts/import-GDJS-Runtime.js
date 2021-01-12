const shell = require('shelljs');
const path = require('path');
const copy = require('recursive-copy');
const args = require('minimist')(process.argv.slice(2));

const gdevelopRootPath = path.join(__dirname, '..', '..', '..');
const destinationPaths = [
  path.join(__dirname, '..', 'resources', 'GDJS'),
  path.join(__dirname, '..', 'node_modules', 'GDJS-for-web-app-only'),
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
  `ℹ️ Copying GDJS and extensions runtime built files and sources to ${destinationPaths.join(
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
  // TODO: Investigate the use of a smart & faster sync
  // that only copy files with changed content.
  return Promise.all([
    // Copy the built files
    copy(
      path.join(gdevelopRootPath, 'GDJS', 'Runtime-bundled'),
      path.join(destinationPath, 'Runtime'),
      copyOptions
    ),
    // Copy the GDJS runtime and extension sources (useful for autocompletions
    // in the IDE).
    copy(
      path.join(gdevelopRootPath, 'GDJS', 'Runtime'),
      path.join(destinationPath, 'Runtime-sources'),
      copyOptions
    ),
    copy(
      path.join(gdevelopRootPath, 'Extensions'),
      path.join(destinationPath, 'Runtime-sources', 'Extensions'),
      { ...copyOptions, filter: ['**/*.js', '**/*.ts'] }
    ),
  ])
    .then(function([bundledResults, unbundledResults, unbundledExtensionsResults]) {
      const totalFilesCount = bundledResults.length + unbundledResults.length + unbundledExtensionsResults.length;
      const duration = Date.now() - startTime;
      console.info(
        `✅ Runtime files copy done (${totalFilesCount} file(s) copied in ${duration}ms).`
      );
    })
    .catch(function(error) {
      console.error('❌ Copy failed: ', error);
    });
});
