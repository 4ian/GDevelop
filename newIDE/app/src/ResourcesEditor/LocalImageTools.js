// @flow

import { rgbStringAndAlphaToRGBColor } from '../Utils/ColorTransformer';

export type LocalImageOperation =
  | 'crop'
  | 'expand-canvas'
  | 'split-spritesheet';
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
export type LocalImageSplitTile = {|
  x: number,
  y: number,
  width: number,
  height: number,
|};

export const maxLocalImageSplitTiles = 999;

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

export const isValidLocalImageSplit = ({
  sourceSize,
  rows,
  columns,
}: {|
  sourceSize: LocalImageSize,
  rows: number,
  columns: number,
|}): boolean => {
  const sourceWidth = getSourceWidth(sourceSize);
  const sourceHeight = getSourceHeight(sourceSize);
  const rowCount = toPixelInteger(rows);
  const columnCount = toPixelInteger(columns);

  return (
    rowCount > 0 &&
    columnCount > 0 &&
    rowCount <= sourceHeight &&
    columnCount <= sourceWidth &&
    rowCount * columnCount <= maxLocalImageSplitTiles
  );
};

export const getLocalImageSplitTiles = ({
  sourceSize,
  rows,
  columns,
}: {|
  sourceSize: LocalImageSize,
  rows: number,
  columns: number,
|}): Array<LocalImageSplitTile> => {
  if (!isValidLocalImageSplit({ sourceSize, rows, columns })) {
    throw new Error('Choose rows and columns that generate 1 to 999 images.');
  }

  const sourceWidth = getSourceWidth(sourceSize);
  const sourceHeight = getSourceHeight(sourceSize);
  const rowCount = toPixelInteger(rows);
  const columnCount = toPixelInteger(columns);
  const tiles: Array<LocalImageSplitTile> = [];

  for (let row = 0; row < rowCount; row++) {
    const top = Math.floor((row * sourceHeight) / rowCount);
    const bottom = Math.floor(((row + 1) * sourceHeight) / rowCount);
    for (let column = 0; column < columnCount; column++) {
      const left = Math.floor((column * sourceWidth) / columnCount);
      const right = Math.floor(((column + 1) * sourceWidth) / columnCount);
      tiles.push({
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
      });
    }
  }

  return tiles;
};

const getLocalImageSourceBaseName = (sourceName: string): string => {
  const sourceFileName = sourceName.replace(/^.*[\\/]/, '');
  const sourceBaseName = sourceFileName.replace(/\.[^/.]+$/, '');
  const safeBaseName = sourceBaseName
    .split('')
    .map(character => (character.charCodeAt(0) < 32 ? '_' : character))
    .join('')
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/[. ]+$/, '');
  return safeBaseName || 'image';
};

export const getLocalImageSplitOutputFolderName = (
  sourceName: string
): string => getLocalImageSourceBaseName(sourceName);

export const getLocalImageSplitFileName = (number: number): string => {
  const normalizedNumber = toPixelInteger(number);
  if (normalizedNumber < 1 || normalizedNumber > maxLocalImageSplitTiles) {
    throw new Error('Spritesheet image number must be between 1 and 999.');
  }
  return `${String(normalizedNumber).padStart(3, '0')}.png`;
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
  const sourceBaseName = getLocalImageSourceBaseName(sourceName);
  if (operation === 'crop') return `${sourceBaseName}-crop`;
  if (operation === 'split-spritesheet') return sourceBaseName;
  return `${sourceBaseName}-expand-${expandDirection || 'right'}`;
};

export const shouldDisableLocalImageApplyButton = ({
  imageAttachment,
  isProcessing,
  sourceSize,
  operation,
  crop,
  expandAmount,
  splitRows = 0,
  splitColumns = 0,
}: {|
  imageAttachment: ?LocalImageAttachment,
  isProcessing: boolean,
  sourceSize: ?LocalImageSize,
  operation: LocalImageOperation,
  crop: LocalImageCrop,
  expandAmount: number,
  splitRows?: number,
  splitColumns?: number,
|}): boolean => {
  if (!imageAttachment || isProcessing || !sourceSize) return true;
  if (operation === 'crop') {
    return !isValidLocalImageCrop(
      normalizeLocalImageCrop({ sourceSize, crop })
    );
  }
  if (operation === 'split-spritesheet') {
    return !isValidLocalImageSplit({
      sourceSize,
      rows: splitRows,
      columns: splitColumns,
    });
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

  if (operation !== 'expand-canvas') {
    throw new Error('This image operation creates more than one image.');
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

export const drawLocalImageSplitTileToCanvas = ({
  canvas,
  image,
  tile,
}: {|
  canvas: any,
  image: any,
  tile: LocalImageSplitTile,
|}) => {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create an image canvas.');
  if (tile.width <= 0 || tile.height <= 0) {
    throw new Error('Unable to create an empty spritesheet image.');
  }

  canvas.width = tile.width;
  canvas.height = tile.height;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(
    image,
    tile.x,
    tile.y,
    tile.width,
    tile.height,
    0,
    0,
    tile.width,
    tile.height
  );
};
