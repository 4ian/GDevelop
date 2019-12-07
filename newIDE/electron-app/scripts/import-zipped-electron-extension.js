/**
 * This script will extract a zipped file of a prebuilt external extension to GD that we don't want added to git history
 * The zip file contains the raw, unchanged sources, which will be extracted into a folder
 * The zip should be kept in a folder somewhere within the project
 */
var shell = require('shelljs');
var fs = require('fs');
var unzipper = require('unzipper');
var process = require('process');
var path = require('path');

const fileName = process.argv[2];
const relativeExtractPath = process.argv[3];
const basePath = path.join(relativeExtractPath, fileName);
const zipFilePath = basePath + '.zip';

try {
  fs.createReadStream(zipFilePath)
    .pipe(
      unzipper.Extract({
        path: relativeExtractPath,
      })
    )
    .on('close', function() {
      shell.echo(
        '✅ Extracted ' +
          zipFilePath +
          ' to ' +
          basePath +
          ' folder'
      );
    });
} catch (e) {
  shell.echo(
    '❌ Error while extracting ' +
      zipFilePath +
      ' to ' +
      basePath +
      ' folder:',
    e.message
  );
}
