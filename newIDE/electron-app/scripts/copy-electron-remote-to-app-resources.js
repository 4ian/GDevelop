/**
 * This script will copy `@electron/remote` module to the app Resources folder,
 * so that it can be used in previews of games run in the editor.
 *
 * This can be removed on dependency on `@electron/remote` is removed.
 */

const shell = require('shelljs');
const path = require('path');

const sourcePath = path.join(__dirname, '../app/node_modules/@electron/remote');
const destinationPath = path.join(
  __dirname,
  '../../app/resources/preview_node_modules',
  '@electron'
);
shell.mkdir('-p', destinationPath);
if (!shell.cp('-R', sourcePath, destinationPath).stderr) {
  shell.echo(`✅ Copied @electron/remote to ${destinationPath}.`);
} else {
  shell.echo(`❌ Error while copying @electron/remote to ${destinationPath}.`);
}
