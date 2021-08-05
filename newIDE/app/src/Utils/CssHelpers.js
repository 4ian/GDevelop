// @flow
let pixelatedImageRenderingValue: ?string = null;
export const getPixelatedImageRendering = (): string => {
  if (pixelatedImageRenderingValue) return pixelatedImageRenderingValue;

  return (pixelatedImageRenderingValue = CSS.supports(
    'image-rendering: crisp-edges'
  )
    ? 'crisp-edges'
    : 'pixelated');
};
