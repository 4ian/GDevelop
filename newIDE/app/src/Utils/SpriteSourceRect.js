// @flow
export type SpriteSourceRect = {|
  x: number,
  y: number,
  width: number,
  height: number,
|};

export type SpriteSheetLayout = {|
  columns: number,
  rows: number,
  frameCount: number,
  sheetWidth: number,
  sheetHeight: number,
|};

export const getSourceRectFromSprite = (
  sprite: ?gdSprite
): ?SpriteSourceRect => {
  if (
    !sprite ||
    typeof sprite.hasCustomSourceRect !== 'function' ||
    !sprite.hasCustomSourceRect()
  ) {
    return null;
  }

  return {
    x: sprite.getSourceRectX(),
    y: sprite.getSourceRectY(),
    width: sprite.getSourceRectWidth(),
    height: sprite.getSourceRectHeight(),
  };
};

export const setSpriteSourceRect = (
  sprite: gdSprite,
  sourceRect: ?SpriteSourceRect
) => {
  if (!sourceRect) {
    if (typeof sprite.clearCustomSourceRect === 'function') {
      sprite.clearCustomSourceRect();
    }
    return;
  }

  if (typeof sprite.setCustomSourceRect !== 'function') {
    console.warn(
      'Sprite source rectangles are not supported by this libGD.js build.'
    );
    return;
  }

  sprite.setCustomSourceRect(
    sourceRect.x,
    sourceRect.y,
    sourceRect.width,
    sourceRect.height
  );
};

export const copySpriteSourceRect = (
  sourceSprite: gdSprite,
  destinationSprite: gdSprite
) => {
  setSpriteSourceRect(destinationSprite, getSourceRectFromSprite(sourceSprite));
};

export const createSpriteSheetSourceRects = ({
  columns,
  rows,
  frameCount,
  sheetWidth,
  sheetHeight,
}: SpriteSheetLayout): Array<SpriteSourceRect> => {
  const frameWidth = sheetWidth / columns;
  const frameHeight = sheetHeight / rows;
  const sourceRects = [];
  const maxFrameCount = Math.min(frameCount, columns * rows);

  for (let frameIndex = 0; frameIndex < maxFrameCount; frameIndex++) {
    const column = frameIndex % columns;
    const row = Math.floor(frameIndex / columns);
    sourceRects.push({
      x: column * frameWidth,
      y: row * frameHeight,
      width: frameWidth,
      height: frameHeight,
    });
  }

  return sourceRects;
};

export const loadImageSize = (
  imageResourceSource: string
): Promise<[number, number]> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve([
        image.naturalWidth || image.width,
        image.naturalHeight || image.height,
      ]);
    };
    image.onerror = reject;
    image.src = imageResourceSource;
  });
