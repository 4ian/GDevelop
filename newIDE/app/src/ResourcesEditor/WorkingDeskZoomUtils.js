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

export const getNextImageZoomFactor = (
  currentZoomFactor: number,
  direction: ZoomDirection
): number =>
  roundImageZoomFactor(
    clamp(
      currentZoomFactor +
        (direction === 'in' ? imageZoomStep : -imageZoomStep),
      imageZoomMinFactor,
      imageZoomMaxFactor
    )
  );

export const formatImageZoomFactor = (zoomFactor: number): string =>
  `${Math.round(zoomFactor * 100)}%`;

export const shouldShowWorkingDeskImageZoomToolbar = (
  selectedNode: ?{ +type?: string, +extension?: string, ... }
): boolean =>
  !!selectedNode &&
  selectedNode.type === 'file' &&
  imageFileExtensions.includes((selectedNode.extension || '').toLowerCase());
