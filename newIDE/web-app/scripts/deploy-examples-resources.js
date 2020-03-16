const shell = require('shelljs');
const path = require('path');

// The path containing examples
const gdjsFolder = path.join(__dirname, '../../app/resources/examples');

// The S3 bucket containing examples
const destination = `s3://resources.gdevelop-app.com/examples`;

// Note: what we upload is the complete directory of examples, including the assets and the project files.
// Project files are not tailored to be opened with the web-app. Instead the web-app uses the project files
// embedded inside the app (see `newIDE/app/scripts/update-fixtures-from-resources-examples.js` script).
// In the future, we might make the web-app able to load directly these project files, and avoid the
// need to embed them.

shell.echo('ℹ️ Uploading newIDE/app/resources/examples to resources.gdevelop-app.com/examples...');
const output = shell.exec(
  `aws s3 sync ${gdjsFolder} ${destination} --acl public-read`
);
if (output.code !== 0) {
  shell.echo(
    '❌ Unable to upload newIDE/app/resources/examples to resources.gdevelop-app.com/examples. Error is:'
  );
  shell.echo(output.stdout);
  shell.echo(output.stderr);
  shell.exit(output.code);
}

shell.echo('✅ Upload finished');
