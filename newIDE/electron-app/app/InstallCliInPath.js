const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const CLI_SYMLINK_NAME = 'gdevelop';
const UNIX_BIN_DIR = '/usr/local/bin';

const shellQuote = value => `'${value.replace(/'/g, `'\\''`)}'`;

const installCliInPathOnWindows = appExecPath => {
  const installDir = path.dirname(appExecPath);
  const escapedDir = installDir.replace(/'/g, `''`);
  // [Environment]::SetEnvironmentVariable rewrites Path as REG_SZ, corrupting REG_EXPAND_SZ
  // entries like "%USERPROFILE%\bin"; write the raw registry value to keep its type, and
  // broadcast WM_SETTINGCHANGE manually since a direct registry write doesn't.
  const psCommand = [
    `$dir = '${escapedDir}'`,
    `$envKey = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey('Environment', $true)`,
    `if (-not $envKey) { $envKey = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey('Environment') }`,
    `$path = [string]$envKey.GetValue('Path', '', [Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)`,
    `$parts = @($path -split ';' | Where-Object { $_ -ne '' })`,
    `if ($parts -notcontains $dir) { $envKey.SetValue('Path', (($parts + $dir) -join ';'), [Microsoft.Win32.RegistryValueKind]::ExpandString) }`,
    `$envKey.Close()`,
    `Add-Type -Namespace GDevelopCli -Name NativeMethods -MemberDefinition '[DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)] public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam, uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);'`,
    `$HWND_BROADCAST = [IntPtr]0xffff`,
    `$WM_SETTINGCHANGE = 0x1A`,
    `$SMTO_ABORTIFHUNG = 0x2`,
    `$broadcastTimeoutMs = 5000`,
    `$broadcastResult = [UIntPtr]::Zero`,
    `[GDevelopCli.NativeMethods]::SendMessageTimeout($HWND_BROADCAST, $WM_SETTINGCHANGE, [UIntPtr]::Zero, 'Environment', $SMTO_ABORTIFHUNG, $broadcastTimeoutMs, [ref]$broadcastResult) | Out-Null`,
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

// osascript reports a dismissed admin prompt as error -128 ("User canceled").
// pkexec exits 126 (dialog dismissed) or 127 (not authorized) when the user declines.
const isElevationCancelled = error =>
  process.platform === 'darwin'
    ? /-128|user canceled/i.test(error.message)
    : error.code === 126 || error.code === 127;

const elevateUnixSymlink = (appExecPath, symlinkPath) => {
  const shellCommand = `mkdir -p ${shellQuote(
    UNIX_BIN_DIR
  )} && ln -sf ${shellQuote(appExecPath)} ${shellQuote(symlinkPath)}`;
  const manualCommand = `sudo mkdir -p "${UNIX_BIN_DIR}" && sudo ln -sf "${appExecPath}" "${symlinkPath}"`;

  return new Promise(resolve => {
    const onDone = error => {
      if (error) {
        if (isElevationCancelled(error)) {
          resolve({
            status: 'error',
            message: 'GDevelop CLI installation was cancelled.',
          });
          return;
        }
        resolve({
          status: 'error',
          message: `Could not create "${symlinkPath}". Run manually: ${manualCommand}`,
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
