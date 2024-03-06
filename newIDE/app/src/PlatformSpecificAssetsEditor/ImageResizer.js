//@flow
import optionalRequire from '../Utils/OptionalRequire';

const fs = optionalRequire('fs-extra');

export const getImageFromPath = (path: string): Promise<HTMLImageElement> => {
  const imageElement = document.createElement('img');

  const file = fs.readFileSync(path, { encoding: 'base64' });

  return new Promise<HTMLImageElement>((resolve, reject) => {
    imageElement.addEventListener('error', (event: Event) => {
      reject(event);
    });
    imageElement.addEventListener('load', () => {
      resolve(imageElement);
    });
    imageElement.src = `data:image/png;base64,${file}`;
  });
};

export const resizeImage = (
  image: HTMLImageElement,
  outputFile: string,
  {
    width,
    height,
    transparentBorderSize = 0,
  }: {| width: number, height: number, transparentBorderSize?: number |}
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = width;
    canvasElement.height = height;
    const ctx = canvasElement.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      transparentBorderSize,
      transparentBorderSize,
      width - 2 * transparentBorderSize,
      height - 2 * transparentBorderSize
    );

    canvasElement.toBlob(blob => {
      blob.arrayBuffer().then(buffer => {
        fs.writeFileSync(outputFile, Buffer.from(buffer));
        resolve(true);
      });
    }, 'image/png');
  });
};
