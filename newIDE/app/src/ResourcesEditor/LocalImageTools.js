// @flow

import { rgbStringAndAlphaToRGBColor } from '../Utils/ColorTransformer';

export type LocalImageOperation = 'crop' | 'expand-canvas';
export type LocalImageExpandDirection = 'left' | 'right' | 'top' | 'bottom';
export type LocalImageSize = {| width: number, height: number |};
export type LocalImageAttachment = {|
  absolutePath: string,
  name: string,
  extension: string,
|};
export type LocalImageCrop = {|
  x: number,
  y: number,
  width: number,
  height: number,
|};
export type LocalImageExpandGeometry = {|
  width: number,
  height: number,
  sourceX: number,
  sourceY: number,
|};
export type LocalImageExpandFill = {|
  color: string,
  alpha: number,
|};

const defaultLocalImageExpandFill = {
  color: '0;0;0',
  alpha: 0,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const toPixelInteger = (value: number): number =>
  Number.isFinite(value) ? Math.floor(value) : 0;

const getSourceWidth = (sourceSize: LocalImageSize): number =>
  Math.max(0, toPixelInteger(sourceSize.width));

const getSourceHeight = (sourceSize: LocalImageSize): number =>
  Math.max(0, toPixelInteger(sourceSize.height));

export const normalizeLocalImageCrop = ({
  sourceSize,
  crop,
}: {|
  sourceSize: LocalImageSize,
  crop: LocalImageCrop,
|}): LocalImageCrop => {
  const sourceWidth = getSourceWidth(sourceSize);
  const sourceHeight = getSourceHeight(sourceSize);
  const left = clamp(toPixelInteger(crop.x), 0, sourceWidth);
  const top = clamp(toPixelInteger(crop.y), 0, sourceHeight);
  const right = clamp(toPixelInteger(crop.x + crop.width), left, sourceWidth);
  const bottom = clamp(toPixelInteger(crop.y + crop.height), top, sourceHeight);

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

export const isValidLocalImageCrop = (crop: LocalImageCrop): boolean =>
  crop.width > 0 && crop.height > 0;

export const getExpandedCanvasGeometry = ({
  sourceSize,
  direction,
  amount,
}: {|
  sourceSize: LocalImageSize,
  direction: LocalImageExpandDirection,
  amount: number,
|}): LocalImageExpandGeometry => {
  const sourceWidth = getSourceWidth(sourceSize);
  const sourceHeight = getSourceHeight(sourceSize);
  const expansionAmount = Math.max(0, toPixelInteger(amount));

  return {
    width:
      direction === 'left' || direction === 'right'
        ? sourceWidth + expansionAmount
        : sourceWidth,
    height:
      direction === 'top' || direction === 'bottom'
        ? sourceHeight + expansionAmount
        : sourceHeight,
    sourceX: direction === 'left' ? expansionAmount : 0,
    sourceY: direction === 'top' ? expansionAmount : 0,
  };
};

export const getLocalImageOutputBaseName = ({
  sourceName,
  operation,
  expandDirection,
}: {|
  sourceName: string,
  operation: LocalImageOperation,
  expandDirection?: LocalImageExpandDirection,
|}): string => {
  const sourceBaseName = sourceName.replace(/\.[^/.]+$/, '') || 'image';
  if (operation === 'crop') return `${sourceBaseName}-crop`;
  return `${sourceBaseName}-expand-${expandDirection || 'right'}`;
};

export const shouldDisableLocalImageApplyButton = ({
  imageAttachment,
  isProcessing,
  sourceSize,
  operation,
  crop,
  expandAmount,
}: {|
  imageAttachment: ?LocalImageAttachment,
  isProcessing: boolean,
  sourceSize: ?LocalImageSize,
  operation: LocalImageOperation,
  crop: LocalImageCrop,
  expandAmount: number,
|}): boolean => {
  if (!imageAttachment || isProcessing || !sourceSize) return true;
  if (operation === 'crop') {
    return !isValidLocalImageCrop(
      normalizeLocalImageCrop({ sourceSize, crop })
    );
  }
  return toPixelInteger(expandAmount) <= 0;
};

const getCanvasFillStyle = ({ color, alpha }: LocalImageExpandFill): string => {
  const rgbColor = rgbStringAndAlphaToRGBColor(color, alpha);
  if (!rgbColor) {
    throw new Error('Enter a fill color as R;G;B, like 100;200;180.');
  }
  const alphaValue = rgbColor.a;
  const normalizedAlpha =
    typeof alphaValue === 'number' && Number.isFinite(alphaValue)
      ? alphaValue
      : 0;

  return `rgba(${clamp(toPixelInteger(rgbColor.r), 0, 255)}, ${clamp(
    toPixelInteger(rgbColor.g),
    0,
    255
  )}, ${clamp(toPixelInteger(rgbColor.b), 0, 255)}, ${clamp(
    normalizedAlpha,
    0,
    1
  )})`;
};

export const drawLocalImageOperationToCanvas = ({
  canvas,
  image,
  sourceSize,
  operation,
  crop,
  expandDirection,
  expandAmount,
  expandFill,
}: {|
  canvas: any,
  image: any,
  sourceSize: LocalImageSize,
  operation: LocalImageOperation,
  crop: LocalImageCrop,
  expandDirection: LocalImageExpandDirection,
  expandAmount: number,
  expandFill?: LocalImageExpandFill,
|}) => {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create an image canvas.');

  if (operation === 'crop') {
    const normalizedCrop = normalizeLocalImageCrop({ sourceSize, crop });
    if (!isValidLocalImageCrop(normalizedCrop)) {
      throw new Error('Choose a crop area inside the image.');
    }

    canvas.width = normalizedCrop.width;
    canvas.height = normalizedCrop.height;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      image,
      normalizedCrop.x,
      normalizedCrop.y,
      normalizedCrop.width,
      normalizedCrop.height,
      0,
      0,
      normalizedCrop.width,
      normalizedCrop.height
    );
    return;
  }

  const geometry = getExpandedCanvasGeometry({
    sourceSize,
    direction: expandDirection,
    amount: expandAmount,
  });
  canvas.width = geometry.width;
  canvas.height = geometry.height;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = getCanvasFillStyle(
    expandFill || defaultLocalImageExpandFill
  );
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, geometry.sourceX, geometry.sourceY);
};
