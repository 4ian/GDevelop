const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const workboxBuild = require('workbox-build');
const buildPath = '../build';
const VersionMetadata = require('../src/Version/VersionMetadata');

/**
 * Remove files created by create-react-app default service worker.
 */
const cleanBuildFiles = () => {
  const listBuildFiles = () =>
    new Promise((resolve, reject) => {
      fs.readdir(buildPath, (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(files);
      });
    });

  return listBuildFiles().then(files => {
    files
      .filter(filename => filename.indexOf('precache-manifest.') === 0)
      .forEach(filename => {
        fs.unlinkSync(path.join(buildPath, filename));
      });
  });
};

const replaceInFile = (file, searchText, replacedText) => {
  if (shell.sed('-i', searchText, replacedText, file).code !== 0) {
    return false;
  }

  // Ensure the replaced text can be found in the file:
  return !!shell.grep(replacedText, file).stdout.trim();
};

/**
 * Create the service worker with workbox.
 */
const buildSW = () => {
  return workboxBuild
    .injectManifest({
      swSrc: 'service-worker-template/service-worker-template.js',
      swDest: '../build/service-worker.js',
      globDirectory: buildPath,
      globPatterns: [
        // Application:
        '!(libGD)*.{js,css,html,png}', // Root files.
        'static/css/*.css',
        'static/media/*',
        'static/js/locales-*.js', // Locales.
        'static/js/!local-app*.js', // Exclude electron app.
        // ...But not libGD.js/wasm (there are cached with their URL
        // query string that depends on the VersionMetadata, see below).

        // Resources:
        '{JsPlatform,CppPlatform,res}/**/*.png',

        // External libs:

        // Zip.js
        'external/zip.js/WebContent/{deflate,inflate,z-worker,zip}.js', // Zip.js
        'external/zip.js/WebContent/zlib-asm/codecs.js', // zlib-asm codec for Zip.js
        'external/zlib-asm/zlib.js', // zlib-asm

        // Monaco Editor (for JavaScript)
        'external/monaco-editor-min/vs/loader.js',
        'external/monaco-editor-min/vs/base/worker/workerMain.js',
        'external/monaco-editor-min/vs/basic-languages/javascript/javascript.js',
        'external/monaco-editor-min/vs/language/typescript/tsMode.js',
        'external/monaco-editor-min/vs/language/typescript/tsWorker.js',
        // 'external/monaco-editor-min/vs/editor/editor.main.js', // Seems useless?
        // 'external/monaco-editor-min/vs/editor/editor.main.css',
      ],

      // Increase the limit to 10mb:
      maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
    })
    .then(({ count, size, warnings }) => {
      if (
        !replaceInFile(
          '../build/service-worker.js',
          'VersionMetadata = {}',
          'VersionMetadata = ' + JSON.stringify(VersionMetadata)
        )
      ) {
        console.error(
          'Error while trying to replace version metadata in build/service-worker.js.'
        );
        shell.exit(1);
      }

      // Optionally, log any warnings and details.
      warnings.forEach(warning => {
        console.log(`⚠️ workbox warning: ${warning}`);
      });
      console.log(
        `ℹ️ ${count} files will be precached, totaling ${size /
          1000 /
          1000} MB.`
      );
    });
};

cleanBuildFiles().then(() => buildSW());
