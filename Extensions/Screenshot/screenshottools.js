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
gdjs.screenshot.takeScreenshot = function (runtimeScene, savePath) {
  //const electron = gdjs.RuntimeGamePixiRenderer.getElectron();
  const electron = runtimeScene.getGame().getRenderer().getElectron();
  let canvas = null;
  let content = null;
  let fileSystem = null;

  if (electron) {
    fileSystem = electron.remote.require("fs");
    //canvas = runtimeScene._renderer._pixiRenderer.view;
    canvas = runtimeScene.getGame().getRenderer().getCanvas();
    if (canvas) {
      content = canvas.toDataURL('image/png').replace('data:image/png;base64,', '');
      fileSystem.writeFile(savePath, content, 'base64', (err) => {
        if (err) {
          console.error("Unable to save the screenshot at path: " + savePath);
        }
      });
    } else {
      console.error("Screenshot are not supported on rendering engines without canvas.")
    }

  }
}
