const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const CLI_SYMLINK_NAME = 'gdevelop';
const UNIX_BIN_DIR = '/usr/local/bin';

const shellQuote = value => `'${value.replace(/'/g, `'\\''`)}'`;

const installCliInPathOnWindows = appExecPath => {
  const installDir = path.dirname(appExecPath);
  const escapedDir = installDir.replace(/'/g, `''`);
  // 'User' scope broadcasts WM_SETTINGCHANGE, so new terminals pick up the change.
  const psCommand = [
    `$dir = '${escapedDir}'`,
    `$path = [Environment]::GetEnvironmentVariable('Path', 'User')`,
    `$parts = @($path -split ';' | Where-Object { $_ -ne '' })`,
    `if ($parts -notcontains $dir) { [Environment]::SetEnvironmentVariable('Path', (($parts + $dir) -join ';'), 'User') }`,
  ].join('; ');

  return new Promise(resolve => {
    child_process.execFile(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psCommand],
      error => {
        if (error) {
          resolve({
            status: 'error',
            message: `Failed to update PATH: ${error.message}`,
          });
          return;
        }
        resolve({
          status: 'success',
          message: `GDevelop added to PATH. Open a new terminal to use the CLI.`,
        });
      }
    );
  });
};

const elevateUnixSymlink = (appExecPath, symlinkPath) => {
  const shellCommand = `mkdir -p ${shellQuote(
    UNIX_BIN_DIR
  )} && ln -sf ${shellQuote(appExecPath)} ${shellQuote(symlinkPath)}`;

  return new Promise(resolve => {
    const onDone = error => {
      if (error) {
        resolve({
          status: 'error',
          message: `Could not create "${symlinkPath}". Run manually: sudo ln -sf "${appExecPath}" "${symlinkPath}"`,
        });
        return;
      }
      resolve({
        status: 'success',
        message: `GDevelop CLI available as "${CLI_SYMLINK_NAME}".`,
      });
    };

    if (process.platform === 'darwin') {
      const appleScript = `do shell script ${JSON.stringify(
        shellCommand
      )} with administrator privileges`;
      child_process.execFile('osascript', ['-e', appleScript], onDone);
    } else {
      child_process.execFile('pkexec', ['sh', '-c', shellCommand], onDone);
    }
  });
};

const installCliInPathOnUnix = appExecPath => {
  const symlinkPath = path.join(UNIX_BIN_DIR, CLI_SYMLINK_NAME);

  return new Promise(resolve => {
    try {
      fs.mkdirSync(UNIX_BIN_DIR, { recursive: true });
      fs.rmSync(symlinkPath, { force: true });
      fs.symlinkSync(appExecPath, symlinkPath);
      resolve({
        status: 'success',
        message: `GDevelop CLI available as "${CLI_SYMLINK_NAME}".`,
      });
    } catch (error) {
      if (error.code === 'EACCES' || error.code === 'EPERM') {
        // /usr/local/bin is not writable: retry with elevation.
        elevateUnixSymlink(appExecPath, symlinkPath).then(resolve);
        return;
      }
      resolve({
        status: 'error',
        message: `Could not create "${symlinkPath}": ${error.message}`,
      });
    }
  });
};

/**
 * Register the GDevelop binary in the system PATH so the CLI works anywhere.
 * @returns {Promise<{status: 'success' | 'error', message: string}>}
 */
const installCliInPath = appExecPath => {
  if (process.platform === 'win32') {
    return installCliInPathOnWindows(appExecPath);
  }
  return installCliInPathOnUnix(appExecPath);
};

module.exports = { installCliInPath };
