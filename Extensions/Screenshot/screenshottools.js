/**
 * @memberof gdjs
 * @class screenshot
 * @static
 * @private
 */

gdjs.screenshot = {}

/**
 * Save a screenshot of the game.
 * @param {string} savepath The path where to save the screenshot
 */
gdjs.screenshot.takeScreenshot = function (savePath, runtimeScene) {
  let electron = gdjs.RuntimeGamePixiRenderer.getElectron();
  let canvas = null;
  let content = null;
  let fileSystem = null;

  if (electron) {
    fileSystem = electron.remote.require("fs");
    canvas = runtimeScene._renderer._pixiRenderer.view;
    content = canvas.toDataURL('image/png').replace('data:image/png;base64,', '');

    fileSystem.writeFileSync(savePath, content, 'base64');
  }
}
