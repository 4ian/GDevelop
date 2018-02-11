//@flow
import optionalRequire from '../Utils/OptionalRequire';
const Jimp = optionalRequire('jimp');

export const resizeImage = (
  inputFile: string,
  outputFile: string,
  { width, height }: { width: number, height: number }
): Promise<any> => {
  if (!Jimp) return Promise.resolve(false);

  return Jimp.read(inputFile)
    .then(function(jimpImage) {
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
