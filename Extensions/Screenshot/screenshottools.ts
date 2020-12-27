namespace gdjs {
  /**
   * @memberof gdjs
   * @class screenshot
   * @static
   */
  gdjs.screenshot = {};

  /**
   * Save a screenshot of the game.
   * @param savepath The path where to save the screenshot
   */
  gdjs.screenshot.takeScreenshot = function (runtimeScene, savePath) {
    const electron = runtimeScene.getGame().getRenderer().getElectron();
    if (electron) {
      const fileSystem = electron.remote.require('fs');
      const canvas = runtimeScene.getGame().getRenderer().getCanvas();
      if (canvas) {
        const content = canvas
          .toDataURL('image/png')
          .replace('data:image/png;base64,', '');
        if (savePath.toLowerCase().indexOf('.png') == -1) {
          savePath += '.png';
        }
        fileSystem.writeFile(savePath, content, 'base64', (err) => {
          if (err) {
            console.error('Unable to save the screenshot at path: ' + savePath);
          }
        });
      } else {
        console.error(
          'Screenshot are not supported on rendering engines without canvas.'
        );
      }
    }
  };
}
