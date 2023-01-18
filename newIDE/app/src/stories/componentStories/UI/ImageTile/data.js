// @flow
import { type ImageTileComponent } from '../../../../UI/ImageTileGrid';

export const itemsWithJustImage: Array<ImageTileComponent> = Array(10)
  .fill(0)
  .map((_, index) => ({
    onClick: () => {},
    imageUrl:
      'https://resources.gdevelop-app.com/examples/platformer/preview.png',
  }));

export const itemsWithTitleAndDescription: Array<ImageTileComponent> = Array(10)
  .fill(0)
  .map((_, index) => ({
    title:
      'Item ' +
      (index % 2 === 0 ? ' with a very very very very very long title ' : '') +
      index,
    description:
      'This is a description for the item ' +
      (index % 3 === 0
        ? ' and it explains very well what this item is about'
        : '') +
      index,
    onClick: () => {},
    imageUrl:
      'https://resources.gdevelop-app.com/examples/platformer/preview.png',
  }));

export const itemsWithOverlay: Array<ImageTileComponent> = Array(10)
  .fill(0)
  .map((_, index) => ({
    onClick: () => {},
    imageUrl:
      'https://resources.gdevelop-app.com/examples/platformer/preview.png',
    overlayText: 'Overlay ' + index,
  }));
