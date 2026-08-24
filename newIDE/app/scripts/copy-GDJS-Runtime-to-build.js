/*
 * This copies the built GDJS game engine ("Runtime") into the app build folder,
 * so that deployed development builds (e.g. editor-dev) can serve it from
 * their own origin instead of localhost:5002 (which would trigger the browser
 * "Local Network Access" permission prompt and fail for anyone not running
 * a local server).
 */

const shell = require('shelljs');
const path = require('path');

const sourcePath = path.join(__dirname, '..', 'resources', 'GDJS', 'Runtime');
const destinationPath = path.join(__dirname, '..', 'build', 'GDJS');

if (!shell.test('-d', sourcePath)) {
  shell.echo(
    `❌ GDJS Runtime not found at ${sourcePath}. Run \`import-GDJS-Runtime.js\` first.`
  );
  shell.exit(1);
}

if (!shell.test('-d', path.join(__dirname, '..', 'build'))) {
  shell.echo(
    `❌ Build folder not found. Run this script after the app is built.`
  );
  shell.exit(1);
}

shell.mkdir('-p', destinationPath);
if (shell.cp('-r', sourcePath, destinationPath).code !== 0) {
  shell.echo(`❌ Error while copying GDJS Runtime to ${destinationPath}.`);
  shell.exit(1);
}

shell.echo(`✅ GDJS Runtime copied to ${path.join(destinationPath, 'Runtime')}.`);
