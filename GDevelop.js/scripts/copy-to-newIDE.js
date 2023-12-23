const shell = require('shelljs');
const path = require('path');

const sourcePath = path.join(__dirname, '../../Binaries/embuild/GDevelop.js');
const destinationPath = path.join(__dirname, '../../newIDE/app/public');
const destinationTestPath = path.join(
  __dirname,
  '../../newIDE/app/node_modules/libGD.js-for-tests-only'
);

const copyLibGdJsFile = (filePath) => {
  if (
    !shell.cp(filePath, destinationPath).stderr &&
    !shell.cp(filePath, destinationTestPath).stderr
  ) {
    shell.echo(
      `✅ Copied ${path.basename(filePath)} from Binaries/embuild/GDevelop.js to public and node_modules folders of newIDE/app.`
    );
  } else {
    shell.echo(
      `❌ Error while copying ${path.basename(filePath)} from Binaries/embuild/GDevelop.js to public and node_modules folders of newIDE/app.`
    );
  }
};

if (shell.mkdir('-p', destinationTestPath).stderr) {
  shell.echo(
    `❌ Can't create ${destinationTestPath}. Have you the proper rights?`
  );
}

if (!shell.test('-f', path.join(sourcePath, 'libGD.js'))) {
  shell.echo('❌ You must compile GDevelop.js first');
  shell.exit(1);
}

// Copy the files built locally
const sourceJsFile = path.join(sourcePath, 'libGD.js');
const sourceWasmFile = path.join(sourcePath, 'libGD.wasm');

// Copy the wasm or memory file.
if (shell.test('-f', sourceWasmFile)) {
  copyLibGdJsFile(sourceWasmFile);
} else {
  shell.echo(
    `❌ libGD.wasm should exist in ${sourcePath}.`
  );
  shell.exit(1);
}

// Copy the JS file.
if (
  !shell.cp(sourceJsFile, destinationPath).stderr &&
  !shell.cp(sourceJsFile, path.join(destinationTestPath, 'index.js')).stderr
) {
  shell.echo(
    '✅ Copied libGD.js from Binaries/embuild/GDevelop.js to public and node_modules folders of newIDE/app.'
  );
} else {
  shell.echo(
    '❌ Error while copying libGD.js from Binaries/embuild/GDevelop.js to public and node_modules folders of newIDE/app'
  );
  shell.exit(1);
}
