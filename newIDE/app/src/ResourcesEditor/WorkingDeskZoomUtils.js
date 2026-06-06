// @flow

export const imageZoomMinFactor = 0.25;
export const imageZoomMaxFactor = 4;
const imageZoomStep = 0.25;

type ZoomDirection = 'in' | 'out';

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

const formatZoomPercent = (zoomFactor: number): string =>
  `${Math.round(roundImageZoomFactor(zoomFactor) * 100)}%`;

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
  zoomFactor: number
): {|
  canvas: {|
    width: string,
    height: string,
  |},
  image: {|
    height: string,
    transform: string,
    transformOrigin: 'center center',
  |},
|} => {
  const roundedZoomFactor = roundImageZoomFactor(
    clamp(zoomFactor, imageZoomMinFactor, imageZoomMaxFactor)
  );
  const canvasZoomFactor = Math.max(1, roundedZoomFactor);
  const imageHeightFactor = roundedZoomFactor >= 1 ? 1 / roundedZoomFactor : 1;

  return {
    canvas: {
      width: formatZoomPercent(canvasZoomFactor),
      height: formatZoomPercent(canvasZoomFactor),
    },
    image: {
      height: formatZoomPercent(imageHeightFactor),
      transform: `scale(${roundedZoomFactor})`,
      transformOrigin: 'center center',
    },
  };
};

export const shouldShowWorkingDeskImageZoomToolbar = (
  selectedNode: ?{ +type?: string, +extension?: string, ... }
): boolean =>
  !!selectedNode &&
  selectedNode.type === 'file' &&
  imageFileExtensions.includes((selectedNode.extension || '').toLowerCase());
