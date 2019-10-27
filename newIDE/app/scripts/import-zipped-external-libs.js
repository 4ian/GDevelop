/**
 * This script extracts the external libraries in external-libs inside
 * public/external. It's up to the IDE to load them appropriately.
 */
var shell = require('shelljs');
var fs = require('fs');
var unzipper = require('unzipper');
var path = require('path');

const externalLibsFolder = path.join(__dirname, 'external-libs');

const getAllExternalLibFiles = () =>
  new Promise((resolve, reject) => {
    fs.readdir(externalLibsFolder, (error, externalLibs) => {
      if (error) {
        return reject(error);
      }

      return resolve(
        externalLibs
          .filter(name => name !== '.DS_Store')
          .filter(name => name !== '.')
          .filter(name => name !== '..')
      );
    });
  });

getAllExternalLibFiles().then(externalLibFiles => {
  externalLibFiles.forEach(externalLibFile => {
    try {
      fs.createReadStream(path.join(externalLibsFolder, externalLibFile))
        .pipe(
          unzipper.Extract({
            path: path.join('../public/external/'),
          })
        )
        .on('close', function() {
          shell.echo(
            '✅ Extracted ' + externalLibFile + ' to public/external/ folder'
          );
        });
    } catch (e) {
      shell.echo(
        '❌ Error while extracting ' +
          externalLibFile +
          ' to public/external/ folder',
        e.message
      );
    }
  });
});
