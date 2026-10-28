const { execFileSync } = require('child_process');

// Electron 45's clipboard.readText/writeText return Promises, which sendSync
// cannot clone. The OS clipboard tools are synchronous.
const maxBuffer = 64 * 1024 * 1024;

const readSystemClipboardText = () => {
  try {
    if (process.platform === 'darwin') {
      return execFileSync('pbpaste', { encoding: 'utf8', maxBuffer });
    }
    if (process.platform === 'win32') {
      return execFileSync(
        'powershell.exe',
        [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::Out.Write((Get-Clipboard -Raw))',
        ],
        { encoding: 'utf8', windowsHide: true, maxBuffer }
      );
    }
    try {
      return execFileSync(
        'wl-paste',
        ['--no-newline', '--type', 'text/plain'],
        { encoding: 'utf8', maxBuffer }
      );
    } catch (error) {
      return execFileSync('xclip', ['-selection', 'clipboard', '-o'], {
        encoding: 'utf8',
        maxBuffer,
      });
    }
  } catch (error) {
    return '';
  }
};

const writeSystemClipboardText = text => {
  const value = typeof text === 'string' ? text : '';
  if (process.platform === 'darwin') {
    execFileSync('pbcopy', { input: value, encoding: 'utf8', maxBuffer });
    return;
  }
  if (process.platform === 'win32') {
    execFileSync('clip', {
      input: value,
      encoding: 'utf8',
      windowsHide: true,
      maxBuffer,
    });
    return;
  }
  try {
    execFileSync('wl-copy', { input: value, encoding: 'utf8', maxBuffer });
  } catch (error) {
    execFileSync('xclip', ['-selection', 'clipboard'], {
      input: value,
      encoding: 'utf8',
      maxBuffer,
    });
  }
};

module.exports = {
  readSystemClipboardText,
  writeSystemClipboardText,
};
