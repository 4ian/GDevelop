/**
 * This script will download and extract a zipped version of a prebuilt external html5 editor
 * The zip file contains the raw, unchanged editor sources, which will be extracted into a folder
 * The zip should be uploaded with one of the git releases (use gitRelease variable for version where you released it)
 */
var shell = require('shelljs');
var https = require('follow-redirects').https;
var fs = require('fs');
var unzipper = require('unzipper');
var process = require('process')

const editor = process.argv[2];
const gitRelease = process.argv[3];
const gitUrl = 'https://github.com/4ian/GDevelop';
const basePath = '../public/external/' + editor + '/' + editor + '-editor';
const zipFilePath = basePath + '.zip';

if (shell.test('-d', basePath)) {
  //Nothing to do
  shell.echo(
    '✅ ' + editor + '-editor already existing in public/external/' + editor + ' folder - skipping download'
  );
} else {
  shell.echo(
    '🌐 Unable to find ' + editor + '-editor, downloading it from ' + gitUrl + ' (be patient)...'
  );

  var file = fs.createWriteStream(zipFilePath);
  https.get(
    gitUrl + '/releases/download/v' + gitRelease + '/' + editor + '-editor.zip',
    function (response) {
      if (response.statusCode !== 200) {
        shell.echo(
          `❌ Can't download ` + editor + `-editor.zip (${response.statusMessage}), please check your internet connection`
        );
        shell.exit(1);
        return;
      }

      response.pipe(file).on('finish', function () {
        shell.echo(
          '📂 Extracting ' + editor + '-editor.zip to public/external/' + editor + ' folder'
        );

        try {
          fs
            .createReadStream(zipFilePath)
            .pipe(unzipper.Extract({
              path: '../public/external/' + editor
            }))
            .on('close', function () {
              shell.echo(
                '✅ Extracted ' + editor + '-editor.zip to public/external/' + editor + ' folder'
              );
              shell.rm(zipFilePath);
              if (
                !shell.test('-d', basePath)
              ) {
                shell.echo(
                  "❌ Can't verify that " + editor + "-editor exists. Was the " + editor + "-editor.zip file malformed?"
                );
              }
            });
        } catch (e) {
          shell.echo(
            '❌ Error while extracting ' + editor + '-editor.zip to public/external/' + editor + ' folder:',
            e.message
          );
        }
      });
    }
  );
}