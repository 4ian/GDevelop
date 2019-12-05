/**
 * This script will extract a zipped file of a prebuilt external extension to GD that we don't want added to git history
 * The zip file contains the raw, unchanged sources, which will be extracted into a folder
 * The zip should be kept in a folder somewhere within the project
 */
var shell = require('shelljs');
// var https = require('follow-redirects').https;
var fs = require('fs');
var unzipper = require('unzipper');
var process = require('process');
var path = require('path');
// const { hashElement } = require('folder-hash');

const editor = process.argv[2];
const relativeExtractPath = process.argv[3]; //'../../electron-app/app/extensions/'
// const gitRelease = process.argv[3];
// const expectedFolderHash = process.argv[4];
// const gitUrl = 'https://github.com/4ian/GDevelop';
const basePath = path.join(relativeExtractPath, editor);
const zipFilePath = basePath + '.zip';

var file = fs.createWriteStream(zipFilePath);
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
      // shell.rm(zipFilePath);
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
