// @flow

export const imageZoomMinFactor = 0.25;
export const imageZoomMaxFactor = 4;
const imageZoomStep = 0.25;
const imageZoomCanvasPadding = 32;

type ZoomDirection = 'in' | 'out';
export type WorkingDeskImageSize = {| width: number, height: number |};

const imageFileExtensions = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.bmp',
  '.svg',
];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const roundImageZoomFactor = (zoomFactor: number): number =>
  Math.round(zoomFactor * 100) / 100;

export const getNextImageZoomFactor = (
  currentZoomFactor: number,
  direction: ZoomDirection
): number =>
  roundImageZoomFactor(
    clamp(
      currentZoomFactor + (direction === 'in' ? imageZoomStep : -imageZoomStep),
      imageZoomMinFactor,
      imageZoomMaxFactor
    )
  );

export const formatImageZoomFactor = (zoomFactor: number): string =>
  `${Math.round(zoomFactor * 100)}%`;

export const getWorkingDeskImageZoomStyles = (
  zoomFactor: number,
  imageSize: ?WorkingDeskImageSize
): {|
  canvas: {|
    width: string,
    height: string,
  |},
  image: {|
    width: string,
    height: string,
  |},
|} => {
  const roundedZoomFactor = roundImageZoomFactor(
    clamp(zoomFactor, imageZoomMinFactor, imageZoomMaxFactor)
  );

  if (!imageSize || imageSize.width <= 0 || imageSize.height <= 0) {
    return {
      canvas: {
        width: '100%',
        height: '100%',
      },
      image: {
        width: 'auto',
        height: 'auto',
      },
    };
  }

  const imageWidth = Math.max(1, Math.round(imageSize.width * roundedZoomFactor));
  const imageHeight = Math.max(
    1,
    Math.round(imageSize.height * roundedZoomFactor)
  );

  return {
    canvas: {
      width: `${imageWidth + imageZoomCanvasPadding}px`,
      height: `${imageHeight + imageZoomCanvasPadding}px`,
    },
    image: {
      width: `${imageWidth}px`,
      height: `${imageHeight}px`,
    },
  };
};

export const shouldShowWorkingDeskImageZoomToolbar = (
  selectedNode: ?{ +type?: string, +extension?: string, ... }
): boolean =>
  !!selectedNode &&
  selectedNode.type === 'file' &&
  imageFileExtensions.includes((selectedNode.extension || '').toLowerCase());
