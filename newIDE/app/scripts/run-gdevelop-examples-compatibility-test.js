const { spawnSync } = require('child_process');

const reactAppRewiredCli = require.resolve('react-app-rewired/bin/index.js');
const result = spawnSync(
  process.execPath,
  [
    reactAppRewiredCli,
    'test',
    '--env=node',
    '--runInBand',
    '--watch=false',
    '--silent',
    'src/ProjectsStorage/LocalFileStorageProvider/GDevelopExamplesCompatibility.spec.js',
    ...process.argv.slice(2),
  ],
  {
    cwd: require('path').resolve(__dirname, '..'),
    env: {
      ...process.env,
      CI: 'true',
      RUN_GDEVELOP_EXAMPLES_COMPATIBILITY: '1',
    },
    stdio: 'inherit',
  }
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
