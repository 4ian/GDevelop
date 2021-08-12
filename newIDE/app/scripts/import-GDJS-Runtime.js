/*
 * This builds GDJS game engine ("Runtime") and the extensions so that it can
 * be used by the editor (either by the "electron-app" or the "web-app").
 */

const shell = require('shelljs');
const path = require('path');
const copy = require('recursive-copy');
const args = require('minimist')(process.argv.slice(2));

const gdevelopRootPath = path.join(__dirname, '..', '..', '..');
const destinationPaths = [
  path.join(__dirname, '..', 'resources', 'GDJS'),
  path.join(__dirname, '..', 'node_modules', 'GDJS-for-web-app-only'),
];

// Clean the paths where GDJS Runtime (and extensions) will be copied/bundled.
if (!args['skip-clean']) {
  destinationPaths.forEach(destinationPath => {
    shell.echo(`ℹ️ Cleaning destination first...`);
    shell.rm('-rf', destinationPath);
    shell.mkdir('-p', destinationPath);
  });
}

// Build GDJS runtime (and extensions).
destinationPaths.forEach(destinationPath => {
  const outPath = path.join(destinationPath, 'Runtime');
  const output = shell.exec(`node scripts/build.js --out ${outPath}`, {
    cwd: path.join(gdevelopRootPath, 'GDJS'),
  });
  if (output.code !== 0) {
    shell.exit(0);
  }
});

// Copy the GDJS runtime and extension sources (used for autocompletions
// in the IDE). This is optional as this takes a lot of time that would add
// up whenever any change is made.
if (!args['skip-sources']) {
  shell.echo(
    `ℹ️ Copying GDJS and extensions runtime sources to ${destinationPaths.join(
      ', '
    )}...`
  );
  destinationPaths.forEach(destinationPath => {
    const copyOptions = {
      overwrite: true,
      expand: true,
      dot: true,
      junk: true,
    };

    const startTime = Date.now();

    // TODO: Investigate the use of a smart & faster sync
    // that only copy files with changed content.
    return Promise.all([
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
      .then(function([unbundledResults, unbundledExtensionsResults]) {
        const totalFilesCount =
          unbundledResults.length + unbundledExtensionsResults.length;
        const duration = Date.now() - startTime;
        console.info(
          `✅ Runtime source files copy done (${totalFilesCount} file(s) copied in ${duration}ms).`
        );
      })
      .catch(function(error) {
        console.error('❌ Copy failed: ', error);
      });
  });
}
