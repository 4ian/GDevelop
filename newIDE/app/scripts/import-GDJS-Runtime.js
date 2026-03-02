/*
 * This builds GDJS game engine ("Runtime") and the extensions so that it can
 * be used by the editor (either by the "electron-app" or the "web-app").
 */

const shell = require('shelljs');
const path = require('path');
const copy = require('recursive-copy');
const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');

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

    const typesDestinationPath = path.join(destinationPath, 'Runtime-sources', 'types');
    const pixiDestinationPath = path.join(typesDestinationPath, 'pixi');
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
      copy(
        path.join(gdevelopRootPath, 'GDJS', 'node_modules', '@types', 'three'),
        path.join(typesDestinationPath, 'three'),
        { ...copyOptions, filter: ['*.d.ts'] }
      ),
      copy(
        path.join(gdevelopRootPath, 'GDJS', 'node_modules', '@types', 'three', 'src'),
        path.join(typesDestinationPath, 'three', 'src'),
        { ...copyOptions, filter: ['**/*.d.ts'] }
      ),
      copy(
        path.join(gdevelopRootPath, 'GDJS', 'node_modules', '@pixi'),
        pixiDestinationPath,
        { ...copyOptions, filter: ['**/*.d.ts'] }
      ),
    ])
      .then(function([unbundledResults, unbundledExtensionsResults]) {
        // Replace import of packages by import of relative folders.
        shell.sed(
          '-i',
          'from \'@pixi((/\\w+)+)',
          'from \'../..$1/lib',
          pixiDestinationPath + '/*/lib/*.d.ts'
        );
        fs.writeFileSync(path.join(pixiDestinationPath, 'index.d.ts'), `
  import './mixin-cache-as-bitmap/lib';
  import './mixin-get-child-by-name/lib';
  import './mixin-get-global-position/lib';
  export * from './accessibility/lib';
  export * from './app/lib';
  export * from './assets/lib';
  export * from './color/lib';
  export * from './compressed-textures/lib';
  export * from './constant/lib';
  export * from './core';
  export * from './display/lib';
  export * from './events/lib';
  export * from './extensions/lib';
  export * from './extract/lib';
  export * from './filter-alpha/lib';
  export * from './filter-blur/lib';
  export * from './filter-color-matrix/lib';
  export * from './filter-displacement/lib';
  export * from './filter-fxaa/lib';
  export * from './filter-noise/lib';
  export * from './graphics/lib';
  export * from './math/lib';
  export * from './mesh/lib';
  export * from './mesh-extras/lib';
  export * from './particle-container/lib';
  export * from './prepare/lib';
  export * from './runner/lib';
  export * from './settings/lib';
  export * from './sprite/lib';
  export * from './sprite-animated/lib';
  export * from './sprite-tiling/lib';
  export * from './spritesheet/lib';
  export * from './text/lib';
  export * from './text-bitmap/lib';
  export * from './text-html/lib';
  export * from './ticker/lib';
  export * from './utils/lib';
  
  export as namespace PIXI;
      `);
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
