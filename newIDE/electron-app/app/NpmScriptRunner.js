const childProcess = require('child_process');

const NPM_SCRIPT_COMMAND_FAILED_MESSAGE = 'Command failed!';
const SAFE_NPM_SCRIPT_NAME_PATTERN = /^[a-zA-Z0-9_:-]+$/;
const SAFE_RELATIVE_FOLDER_PATTERN = /^[a-zA-Z0-9._/-]+$/;

const quoteForPosixShell = value => `'${String(value).replace(/'/g, "'\\''")}'`;

const getOpenFolderCommand = (relativeFolderPath, platform) => {
  if (
    !SAFE_RELATIVE_FOLDER_PATTERN.test(relativeFolderPath) ||
    relativeFolderPath.split('/').includes('..')
  ) {
    throw new Error(`Invalid relative folder path: "${relativeFolderPath}"`);
  }

  const normalizedRelativeFolderPath = `./${relativeFolderPath}`;
  if (platform === 'win32') {
    return `explorer.exe ${normalizedRelativeFolderPath.replace(/\//g, '\\')}`;
  }
  if (platform === 'darwin') {
    return `open ${quoteForPosixShell(normalizedRelativeFolderPath)}`;
  }
  return `xdg-open ${quoteForPosixShell(normalizedRelativeFolderPath)}`;
};

const getNpmScriptCommand = ({
  npmScript,
  installDependencies,
  openFolderAfterSuccess,
  platform = process.platform,
}) => {
  if (!SAFE_NPM_SCRIPT_NAME_PATTERN.test(npmScript)) {
    throw new Error(`Invalid npm script name: "${npmScript}"`);
  }

  const runScriptCommand = `npm run ${npmScript}`;
  const npmCommand = installDependencies
    ? `npm install --no-audit --no-fund && ${runScriptCommand}`
    : runScriptCommand;
  if (!openFolderAfterSuccess) {
    return npmCommand;
  }

  const openFolderCommand = getOpenFolderCommand(
    openFolderAfterSuccess,
    platform
  );
  // Opening the output folder is best effort. In particular, Explorer can
  // return a failure status after handing the request to an existing process.
  const ignoreOpenFolderFailureCommand =
    platform === 'win32' ? 'cmd /c exit 0' : 'true';
  return `${npmCommand} && (${openFolderCommand} || ${ignoreOpenFolderFailureCommand})`;
};

const launchNpmScriptInTerminal = (
  {
    projectPath,
    npmScript,
    keepTerminalOpen,
    installDependencies,
    openFolderAfterSuccess,
  },
  {
    platform = process.platform,
    spawn = childProcess.spawn,
    onError = () => {},
  } = {}
) => {
  if (!projectPath || typeof projectPath !== 'string') {
    throw new Error('A project path is required to run an npm script.');
  }

  const npmCommand = getNpmScriptCommand({
    npmScript,
    installDependencies: !!installDependencies,
    openFolderAfterSuccess,
    platform,
  });
  const keepOpen = !!keepTerminalOpen;

  if (platform === 'win32') {
    const innerCommand = keepOpen
      ? npmCommand
      : `${npmCommand} || (echo. & echo ${NPM_SCRIPT_COMMAND_FAILED_MESSAGE} & pause)`;
    const cmdCloseFlag = keepOpen ? '/k' : '/c';
    const child = spawn(
      'cmd.exe',
      ['/c', 'start', '', 'cmd.exe', cmdCloseFlag, innerCommand],
      {
        cwd: projectPath,
        detached: true,
        stdio: 'ignore',
      }
    );
    child.on('error', onError);
    child.unref();
    return;
  }

  const quotedProjectPath = quoteForPosixShell(projectPath);
  if (platform === 'darwin') {
    const shellCommand = keepOpen
      ? `cd ${quotedProjectPath} && ${npmCommand}`
      : `cd ${quotedProjectPath} && ${npmCommand} && exit || echo "${NPM_SCRIPT_COMMAND_FAILED_MESSAGE}"`;
    const escapedShellCommand = shellCommand
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');
    const child = spawn(
      'osascript',
      [
        '-e',
        `tell application "Terminal" to do script "${escapedShellCommand}"`,
      ],
      {
        detached: true,
        stdio: 'ignore',
      }
    );
    child.on('error', onError);
    child.unref();
    return;
  }

  const bashCommand = keepOpen
    ? `cd ${quotedProjectPath} && ${npmCommand}; exec bash`
    : `cd ${quotedProjectPath} && ${npmCommand} || { echo "${NPM_SCRIPT_COMMAND_FAILED_MESSAGE}"; exec bash; }`;
  const terminals = [
    {
      cmd: 'x-terminal-emulator',
      args: ['-e', 'bash', '-c', bashCommand],
    },
    { cmd: 'gnome-terminal', args: ['--', 'bash', '-c', bashCommand] },
    { cmd: 'konsole', args: ['-e', 'bash', '-c', bashCommand] },
    { cmd: 'xterm', args: ['-e', 'bash', '-c', bashCommand] },
  ];

  const tryTerminal = index => {
    if (index >= terminals.length) {
      onError(new Error('No terminal emulator found'));
      return;
    }
    const terminal = terminals[index];
    const child = spawn(terminal.cmd, terminal.args, {
      detached: true,
      stdio: 'ignore',
    });
    child.on('error', () => tryTerminal(index + 1));
    child.unref();
  };

  tryTerminal(0);
};

module.exports = {
  getOpenFolderCommand,
  getNpmScriptCommand,
  launchNpmScriptInTerminal,
  quoteForPosixShell,
};
