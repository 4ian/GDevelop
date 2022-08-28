const shell = require('shelljs');
const path = require('path');

let versionMetadata = null;
try {
  versionMetadata = require('../../app/src/Version/VersionMetadata');
} catch (e) {
  shell.echo(
    '❌ Unable to find VersionMetadata.js in newIDE/app/src/Version - have you run npm install?'
  );
  shell.exit(1);
}

// The path containing GDJS Runtime *and* extensions
const gdjsFolder = path.join(__dirname, '../../app/resources/GDJS');
const destination = `s3://resources.gdevelop-app.com/GDJS-${versionMetadata.version}`;

shell.echo('ℹ️ Uploading GDJS Runtime (with extensions) to resources.gdevelop-app.com...');
const output = shell.exec(
  `aws s3 sync ${gdjsFolder} ${destination} --acl public-read`
);
if (output.code !== 0) {
  shell.echo(
    '❌ Unable to upload GDJS Runtime (with extensions) to resources.gdevelop-app.com. Error is:'
  );
  shell.echo(output.stdout);
  shell.echo(output.stderr);
  shell.exit(output.code);
}

shell.echo('✅ Upload finished');
