const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { makeSimplePromisePool } = require('./utils/SimplePromisePool');

const gdevelopRootPath = path.resolve(__dirname, '../../');
const sourcesRootPath = path.join(gdevelopRootPath, 'Core/GDCore');
const excludedPaths = [
  'Tools/Localization.cpp', // emscripten code which can't be linted
  'Serialization/Serializer.cpp', // Diagnostic that can't be ignored in rapidjson.
];

async function findClangTidy() {
  const tryClangTidy = (clangTidyCommandName) =>
    new Promise((resolve, reject) => {
      const process = spawn(clangTidyCommandName, ['--version'], {
        stdio: 'inherit',
      });

      process.on('error', (error) => {
        resolve(false);
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });

  const hasClangTidy19 = await tryClangTidy('clang-tidy-19');
  if (hasClangTidy19) {
    return 'clang-tidy-19';
  }

  const hasClangTidy = await tryClangTidy('clang-tidy');
  if (hasClangTidy) {
    return 'clang-tidy';
  }

  return null;
}

function runClangTidy(commandName, filePath) {
  return new Promise((resolve, reject) => {
    const process = spawn(
      commandName,
      [
        filePath,
        `-p=${gdevelopRootPath}/Binaries/embuild/compile_commands.json`,
        `-header-filter=".*"`,
        `--allow-no-checks`,
        `--quiet`,
      ],
      { stdio: 'inherit' }
    );

    process.on('error', (error) => {
      reject({ hasErrors: false });
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve({ hasErrors: false });
      } else {
        resolve({ hasErrors: true });
      }
    });
  });
}

// Function to find all files in directory recursively excluding specified paths
function findFiles(directoryPath) {
  let results = [];
  const list = fs.readdirSync(directoryPath);

  list.forEach((file) => {
    const filePath = path.resolve(directoryPath, file);
    const relativePath = path.relative(sourcesRootPath, filePath);

    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory() && !excludedPaths.includes(relativePath)) {
      results = results.concat(findFiles(filePath));
    } else {
      if (
        path.extname(filePath) === '.inl' ||
        path.basename(filePath) === '.gitignore' ||
        excludedPaths.includes(relativePath)
      ) {
        // Ignore .inl files
      } else {
        results.push(filePath);
      }
    }
  });

  return results;
}

// Main function to run clang-tidy
async function main() {
  console.log('Checking if clang-tidy is installed and works:');
  const clangTidyCommand = await findClangTidy();
  if (!clangTidyCommand) {
    console.error(`❌ clang-tidy is not installed or not working.`);
    process.exit(1);
  }

  const filesToCheck = findFiles(sourcesRootPath);

  // Run clang-tidy on each file.
  const filesWithErrors = [];
  let fileIndex = 0;
  await makeSimplePromisePool(
    filesToCheck.map((filePath) => async () => {
      const { hasErrors } = await runClangTidy(clangTidyCommand, filePath);
      if (hasErrors) {
        filesWithErrors.push(filePath);
      }
      fileIndex++;
      if (fileIndex % 10 === 0) {
        console.log(
          `ℹ️ Checked ${fileIndex} out of ${filesToCheck.length} files.`
        );
      }
    }),
    30
  );

  if (filesWithErrors.length > 0) {
    console.error(`❌ clang-tidy found errors in the following files:`);
    for (let filePath of filesWithErrors) {
      console.error(`  - ${filePath}`);
    }
    process.exit(1);
  } else {
    console.log(`✅ All files passed clang-tidy checks.`);
  }
}

main();
