// @flow

const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new Error(
          'The SVG could not be drawn: it is probably not valid XML (check that every tag is closed and that attribute values are quoted).'
        )
      );
    image.src = url;
  });

/**
 * Draws an SVG into a PNG of the given size, with a transparent background.
 * The SVG is drawn as an image: the browser runs no script and loads no file
 * from it.
 */
export const rasterizeSvgToPng = async (
  svg: string,
  width: number,
  height: number
): Promise<Blob> => {
  const svgUrl = URL.createObjectURL(
    new Blob([svg], { type: 'image/svg+xml' })
  );
  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No 2D canvas to draw the SVG.');
    context.drawImage(image, 0, 0, width, height);
    return await new Promise((resolve, reject) =>
      canvas.toBlob(
        blob =>
          blob
            ? resolve(blob)
            : reject(new Error('The drawn SVG could not be made a PNG.')),
        'image/png'
      )
    );
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
};
