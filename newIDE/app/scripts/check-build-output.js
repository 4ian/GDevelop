// @ts-check
const fs = require('fs');
const path = require('path');

const buildPath = path.join(__dirname, '..', 'build');

/**
 * Verify that the build folder contains the files expected for a working
 * app. This is important because the build can, in some cases, "succeed"
 * while producing an empty or unusable build folder. For example, an error
 * in a web worker file (compiled by `worker-loader` in a child compilation)
 * is not reported as an error of the whole compilation - see
 * `Resource3DPreview.worker.js`.
 */
const checkBuildOutput = () => {
  const errors = [];

  /** @param {string} directory @param {RegExp} pattern */
  const checkFileExists = (directory, pattern) => {
    const directoryPath = path.join(buildPath, directory);
    const files = fs.existsSync(directoryPath)
      ? fs.readdirSync(directoryPath)
      : [];
    if (!files.some(file => pattern.test(file))) {
      errors.push(
        `Expected a file matching ${pattern} in "build/${directory}".`
      );
    }
  };

  checkFileExists('', /^index\.html$/);
  checkFileExists('static/js', /^main\..*\.js$/);
  checkFileExists('static/css', /^main\..*\.css$/);
  // Workers are compiled separately by worker-loader: check they were
  // properly built too.
  checkFileExists('', /^Resource3DPreview\.worker\..*\.worker\.js$/);
  checkFileExists('', /^BackgroundSerializer\.worker\..*\.worker\.js$/);

  if (errors.length > 0) {
    console.error(
      '❌ The build folder is incomplete - the build silently failed:'
    );
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }

  console.log('✅ Build folder content looks complete.');
};

checkBuildOutput();
