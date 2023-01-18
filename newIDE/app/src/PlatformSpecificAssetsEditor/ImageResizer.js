//@flow
import optionalLazyRequire from '../Utils/OptionalLazyRequire';
const lazyRequireJimp = optionalLazyRequire('jimp');

export const isResizeSupported = () => {
  const Jimp = lazyRequireJimp();
  return !!Jimp;
};

export const resizeImage = (
  inputFile: string,
  outputFile: string,
  {
    width,
    height,
    transparentBorderSize,
  }: { width: number, height: number, transparentBorderSize?: number }
): Promise<any> => {
  const Jimp = lazyRequireJimp();
  if (!Jimp) return Promise.resolve(false);

  return Jimp.read(inputFile)
    .then(function(jimpImage) {
      if (transparentBorderSize) {
        // Create a new transparent image at the required size, and put the image
        // in the center of it, according to the border size
        return new Promise((resolve, reject) => {
          new Jimp(width, height, (err, destinationJimpImage) => {
            if (err) reject(err);

            resolve(
              destinationJimpImage
                .composite(
                  jimpImage.contain(
                    width - transparentBorderSize * 2,
                    height - transparentBorderSize * 2
                  ),
                  transparentBorderSize,
                  transparentBorderSize
                )
                .write(outputFile)
            );
          });
        });
      }

      return jimpImage.contain(width, height).write(outputFile);
    })
    .then(() => {
      return true;
    })
    .catch(function(err) {
      console.error(err);
      return false;
    });
};
