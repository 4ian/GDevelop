//@flow
import optionalRequire from '../Utils/OptionalRequire';

const fs = optionalRequire('fs-extra');

export const getImageFromPath = (
  path: string,
  imageElementId: string
): Promise<HTMLImageElement> => {
  const imageElement = document.getElementById(imageElementId);
  if (!imageElement || !(imageElement instanceof HTMLImageElement))
    return Promise.reject(new Error('Hidden image element not found'));

  const file = fs.readFileSync(path, { encoding: 'base64' });

  return new Promise<HTMLImageElement>((resolve, reject) => {
    imageElement.addEventListener('error', (event: Event) => {
      console.error(event);
      reject(event);
    });
    imageElement.addEventListener('load', () => {
      resolve(imageElement);
    });
    console.log(path);
    imageElement.src = `data:image/png;base64,${file}`;
  });
};

export const resizeImage = (
  image: HTMLImageElement,
  outputFile: string,
  {
    width,
    height,
    transparentBorderSize,
  }: {| width: number, height: number, transparentBorderSize?: number |},
  canvasElementId: string
): Promise<boolean> => {
  const canvasElement = document.getElementById(canvasElementId);
  if (!canvasElement || !(canvasElement instanceof HTMLCanvasElement))
    return Promise.resolve(false);
  return new Promise((resolve, reject) => {
    canvasElement.width = width;
    canvasElement.height = height;
    const ctx = canvasElement.getContext('2d');

    ctx.drawImage(image, 0, 0, width, height);

    canvasElement.toBlob(blob => {
      blob.arrayBuffer().then(buffer => {
        fs.writeFileSync(outputFile, Buffer.from(buffer));
        ctx.clearRect(0, 0, width, height);
        resolve(true);
      });
    }, 'image/png');
  });
};
