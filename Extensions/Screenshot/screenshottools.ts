namespace gdjs {
  export namespace screenshot {
    const logger = new gdjs.Logger('Screenshot');

    /**
     * Save a screenshot of the game.
     * @param instanceContainer The container
     * @param savePath The path where to save the screenshot
     */
    export const takeScreenshot = function (
      instanceContainer: gdjs.RuntimeInstanceContainer,
      savePath: string
    ) {
      const fs = typeof require !== 'undefined' ? require('fs') : null;
      if (fs) {
        const canvas = instanceContainer.getGame().getRenderer().getCanvas();
        if (canvas) {
          const content = canvas
            .toDataURL('image/png')
            .replace('data:image/png;base64,', '');
          if (savePath.toLowerCase().indexOf('.png') == -1) {
            savePath += '.png';
          }
          fs.writeFile(savePath, content, 'base64', (err) => {
            if (err) {
              logger.error(
                'Unable to save the screenshot at path: ' + savePath
              );
            }
          });
        } else {
          logger.error(
            'Screenshot are not supported on rendering engines without canvas.'
          );
        }
      }
    };
  }
}
