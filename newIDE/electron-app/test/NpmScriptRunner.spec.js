const assert = require('assert');

const {
  getOpenFolderCommand,
  getNpmScriptCommand,
  launchNpmScriptInTerminal,
  quoteForPosixShell,
} = require('../app/NpmScriptRunner');

const createFakeChild = () => ({
  on: () => {},
  unref: () => {},
});

const testBuildCommandInstallsDependencies = () => {
  assert.strictEqual(
    getNpmScriptCommand({
      npmScript: 'build',
      installDependencies: true,
    }),
    'npm install --no-audit --no-fund && npm run build'
  );
};

const testBuildCommandIgnoresWindowsFolderOpenFailure = () => {
  assert.strictEqual(
    getNpmScriptCommand({
      npmScript: 'build',
      installDependencies: true,
      openFolderAfterSuccess: 'dist',
      platform: 'win32',
    }),
    'npm install --no-audit --no-fund && npm run build && (explorer.exe .\\dist || cmd /c exit 0)'
  );
};

const testBuildCommandIgnoresPosixFolderOpenFailure = () => {
  assert.strictEqual(
    getNpmScriptCommand({
      npmScript: 'build',
      installDependencies: true,
      openFolderAfterSuccess: 'dist',
      platform: 'linux',
    }),
    "npm install --no-audit --no-fund && npm run build && (xdg-open './dist' || true)"
  );
};

const testOpenFolderCommandUsesHostFileManager = () => {
  assert.strictEqual(getOpenFolderCommand('dist', 'darwin'), "open './dist'");
  assert.strictEqual(
    getOpenFolderCommand('dist', 'linux'),
    "xdg-open './dist'"
  );
};

const testInvalidScriptNameIsRejected = () => {
  assert.throws(
    () =>
      getNpmScriptCommand({
        npmScript: 'build && echo unsafe',
        installDependencies: false,
      }),
    /Invalid npm script name/
  );
};

const testUnsafeOpenFolderIsRejected = () => {
  assert.throws(
    () => getOpenFolderCommand('../outside', 'win32'),
    /Invalid relative folder path/
  );
};

const testPosixPathIsQuoted = () => {
  assert.strictEqual(
    quoteForPosixShell("/tmp/A game's export"),
    "'/tmp/A game'\\''s export'"
  );
};

const testWindowsLaunchUsesWorkingDirectory = () => {
  const calls = [];
  launchNpmScriptInTerminal(
    {
      projectPath: 'C:\\Games & Tools\\My game',
      npmScript: 'build',
      keepTerminalOpen: false,
      installDependencies: true,
      openFolderAfterSuccess: 'dist',
    },
    {
      platform: 'win32',
      spawn: (command, args, options) => {
        calls.push({ command, args, options });
        return createFakeChild();
      },
    }
  );

  assert.deepStrictEqual(calls, [
    {
      command: 'cmd.exe',
      args: [
        '/c',
        'start',
        '',
        'cmd.exe',
        '/c',
        'npm install --no-audit --no-fund && npm run build && (explorer.exe .\\dist || cmd /c exit 0) || (echo. & echo Command failed! & pause)',
      ],
      options: {
        cwd: 'C:\\Games & Tools\\My game',
        detached: true,
        stdio: 'ignore',
      },
    },
  ]);
};

const run = () => {
  testBuildCommandInstallsDependencies();
  testBuildCommandIgnoresWindowsFolderOpenFailure();
  testBuildCommandIgnoresPosixFolderOpenFailure();
  testOpenFolderCommandUsesHostFileManager();
  testInvalidScriptNameIsRejected();
  testUnsafeOpenFolderIsRejected();
  testPosixPathIsQuoted();
  testWindowsLaunchUsesWorkingDirectory();
};

run();
