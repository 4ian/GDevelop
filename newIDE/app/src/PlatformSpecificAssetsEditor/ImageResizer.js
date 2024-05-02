//@flow

export const resizeImage = (
  imageAsBlobDataUrl: string,
  {
    width,
    height,
    transparentBorderSize = 0,
  }: {| width: number, height: number, transparentBorderSize?: number |}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvasElement = document.createElement('canvas');
    canvasElement.width = width;
    canvasElement.height = height;
    const ctx = canvasElement.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const image = new Image();
    image.addEventListener('load', () => {
      try {
        ctx.drawImage(
          image,
          transparentBorderSize,
          transparentBorderSize,
          width - 2 * transparentBorderSize,
          height - 2 * transparentBorderSize
        );

        canvasElement.toBlob(blob => {
          resolve(URL.createObjectURL(blob));
        }, 'image/png');
      } catch (error) {
        reject('An error occurred while generating an icon');
      }
    });
    image.addEventListener('error', (e: Event) => {
      reject('An error occurred while loading the input image');
    });
    image.src = imageAsBlobDataUrl;
  });
};
