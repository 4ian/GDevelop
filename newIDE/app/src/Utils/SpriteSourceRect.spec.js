// @flow
import { createSpriteSheetSourceRects } from './SpriteSourceRect';

describe('SpriteSourceRect', () => {
  it('can create source rectangles from a sprite sheet grid', () => {
    expect(
      createSpriteSheetSourceRects({
        sheetWidth: 256,
        sheetHeight: 128,
        columns: 4,
        rows: 2,
        frameCount: 6,
      })
    ).toEqual([
      { x: 0, y: 0, width: 64, height: 64 },
      { x: 64, y: 0, width: 64, height: 64 },
      { x: 128, y: 0, width: 64, height: 64 },
      { x: 192, y: 0, width: 64, height: 64 },
      { x: 0, y: 64, width: 64, height: 64 },
      { x: 64, y: 64, width: 64, height: 64 },
    ]);
  });

  it('does not create more source rectangles than the grid contains', () => {
    expect(
      createSpriteSheetSourceRects({
        sheetWidth: 96,
        sheetHeight: 32,
        columns: 3,
        rows: 1,
        frameCount: 10,
      })
    ).toEqual([
      { x: 0, y: 0, width: 32, height: 32 },
      { x: 32, y: 0, width: 32, height: 32 },
      { x: 64, y: 0, width: 32, height: 32 },
    ]);
  });
});
