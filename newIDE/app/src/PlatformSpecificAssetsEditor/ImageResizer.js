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
  { width, height }: { width: number, height: number }
): Promise<any> => {
  const Jimp = lazyRequireJimp();
  if (!Jimp) return Promise.resolve(false);

  return Jimp.read(inputFile)
    .then(function (jimpImage) {
      return jimpImage.contain(width, height).write(outputFile);
    })
    .then(() => {
      return true;
    })
    .catch(function (err) {
      console.error(err);
      return false;
    });
};
