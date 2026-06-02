// @noflow
const fs = require('fs');
const path = require('path');

describe('Electron main process source policies', () => {
  it('does not read BrowserWindow.webContents after the window is closed', () => {
    const source = fs.readFileSync(
      path.join(__dirname, '../../electron-app/app/main.js'),
      'utf8'
    );
    const createWindowStart = source.indexOf('function createNewWindow');
    const closedHandlerStart = source.indexOf("newWindow.on('closed'", createWindowStart);
    const nextHandlerStart = source.indexOf(
      "newWindow.webContents.on('will-navigate'",
      closedHandlerStart
    );
    const beforeClosedHandler = source.slice(
      createWindowStart,
      closedHandlerStart
    );
    const closedHandler = source.slice(closedHandlerStart, nextHandlerStart);

    expect(beforeClosedHandler).toContain(
      'const windowWebContents = newWindow.webContents;'
    );
    expect(closedHandler).not.toContain('newWindow.webContents');
    expect(closedHandler).toContain('clearPendingMcpRendererRequestsFor(windowWebContents)');
  });
});
