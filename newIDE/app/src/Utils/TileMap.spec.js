// @flow

import { optimizeTilesGridCoordinates } from './TileMap';

describe('optimizeTilesGridCoordinates', () => {
  test('Selection of 2x1 is expanded on the right', () => {
    const minX = 4;
    const maxX = 7;
    const minY = 12;
    const maxY = 12;
    const result = optimizeTilesGridCoordinates({
      minX,
      maxX,
      minY,
      maxY,
      tileMapTilePatches: [
        {
          tileCoordinates: { x: 4, y: 4 },
          topLeftCorner: { x: minX, y: minY },
          bottomRightCorner: { x: minX, y: minY },
        },
        ...[1, 2, 3].map(deltaX => ({
          tileCoordinates: { x: 4, y: 1 },
          topLeftCorner: { x: minX + deltaX, y: minY },
          bottomRightCorner: { x: minX + deltaX, y: minY },
        })),
      ],
    });
    expect(result).toEqual([
      {
        tileCoordinates: { x: 4, y: 4 },
        topLeftCorner: { x: minX, y: minY },
        bottomRightCorner: { x: minX, y: minY },
      },
      {
        tileCoordinates: { x: 4, y: 1 },
        topLeftCorner: { x: minX + 1, y: minY },
        bottomRightCorner: { x: maxX, y: minY },
      },
    ]);
  });
  test('Selection of 1x1 is expanded on the right', () => {
    const minX = 4;
    const maxX = 7;
    const minY = 12;
    const maxY = 12;
    const result = optimizeTilesGridCoordinates({
      minX,
      maxX,
      minY,
      maxY,
      tileMapTilePatches: [
        {
          tileCoordinates: { x: 4, y: 4 },
          topLeftCorner: { x: minX, y: minY },
          bottomRightCorner: { x: minX, y: minY },
        },
        ...[1, 2, 3].map(deltaX => ({
          tileCoordinates: { x: 4, y: 4 },
          topLeftCorner: { x: minX + deltaX, y: minY },
          bottomRightCorner: { x: minX + deltaX, y: minY },
        })),
      ],
    });
    expect(result).toEqual([
      {
        tileCoordinates: { x: 4, y: 4 },
        topLeftCorner: { x: minX, y: minY },
        bottomRightCorner: { x: maxX, y: maxY },
      },
    ]);
  });
  test('Selection of 1x1 is expanded on the bottom', () => {
    const minX = 4;
    const maxX = 4;
    const minY = 12;
    const maxY = 16;
    const result = optimizeTilesGridCoordinates({
      minX,
      maxX,
      minY,
      maxY,
      tileMapTilePatches: [
        {
          tileCoordinates: { x: 4, y: 4 },
          topLeftCorner: { x: minX, y: minY },
          bottomRightCorner: { x: minX, y: minY },
        },
        ...[1, 2, 3, 4].map(deltaY => ({
          tileCoordinates: { x: 4, y: 4 },
          topLeftCorner: { x: minX, y: minY + deltaY },
          bottomRightCorner: { x: minX, y: minY + deltaY },
        })),
      ],
    });
    expect(result).toEqual([
      {
        tileCoordinates: { x: 4, y: 4 },
        topLeftCorner: { x: minX, y: minY },
        bottomRightCorner: { x: maxX, y: maxY },
      },
    ]);
  });
  test('Selection of 1x1 is expanded on the right and on the bottom', () => {
    const minX = 4;
    const maxX = 7;
    const minY = 12;
    const maxY = 15;
    const result = optimizeTilesGridCoordinates({
      minX,
      maxX,
      minY,
      maxY,
      tileMapTilePatches: [
        {
          tileCoordinates: { x: 4, y: 4 },
          topLeftCorner: { x: minX, y: minY },
          bottomRightCorner: { x: minX, y: minY },
        },
        ...[0, 1, 2, 3]
          .map(deltaX => {
            return [0, 1, 2, 3].map(deltaY =>
              deltaX === 0 && deltaY === 0
                ? null
                : {
                    tileCoordinates: { x: 4, y: 4 },
                    topLeftCorner: { x: minX + deltaX, y: minY + deltaY },
                    bottomRightCorner: { x: minX + deltaX, y: minY + deltaY },
                  }
            );
          })
          .flat()
          .filter(Boolean),
      ],
    });
    expect(result).toEqual([
      {
        tileCoordinates: { x: 4, y: 4 },
        topLeftCorner: { x: minX, y: minY },
        bottomRightCorner: { x: maxX, y: maxY },
      },
    ]);
  });
  test('Selection of 3x2 is expanded on the right and on the bottom', () => {
    const minX = 4;
    const maxX = 7;
    const minY = 12;
    const maxY = 13;
    const topLeftCorner = { x: 4, y: 4 };
    const topMiddleCorner = { x: 5, y: 4 };
    const topRightCorner = { x: 6, y: 4 };
    const bottomLeftCorner = { x: 4, y: 5 };
    const bottomMiddleCorner = { x: 5, y: 5 };
    const bottomRightCorner = { x: 6, y: 5 };
    const result = optimizeTilesGridCoordinates({
      minX,
      maxX,
      minY,
      maxY,
      tileMapTilePatches: [
        // First column
        {
          tileCoordinates: topLeftCorner,
          topLeftCorner: { x: minX, y: minY },
          bottomRightCorner: { x: minX, y: minY },
        },
        {
          tileCoordinates: bottomLeftCorner,
          topLeftCorner: { x: minX, y: minY + 1 },
          bottomRightCorner: { x: minX, y: minY + 1 },
        },
        // Second column
        {
          tileCoordinates: topMiddleCorner,
          topLeftCorner: { x: minX + 1, y: minY },
          bottomRightCorner: { x: minX + 1, y: minY },
        },
        {
          tileCoordinates: bottomMiddleCorner,
          topLeftCorner: { x: minX + 1, y: minY + 1 },
          bottomRightCorner: { x: minX + 1, y: minY + 1 },
        },
        // Third column
        {
          tileCoordinates: topMiddleCorner,
          topLeftCorner: { x: minX + 2, y: minY },
          bottomRightCorner: { x: minX + 2, y: minY },
        },
        {
          tileCoordinates: bottomMiddleCorner,
          topLeftCorner: { x: minX + 2, y: minY + 1 },
          bottomRightCorner: { x: minX + 2, y: minY + 1 },
        },
        // Fourth column
        {
          tileCoordinates: topRightCorner,
          topLeftCorner: { x: minX + 3, y: minY },
          bottomRightCorner: { x: minX + 3, y: minY },
        },
        {
          tileCoordinates: bottomRightCorner,
          topLeftCorner: { x: minX + 3, y: minY + 1 },
          bottomRightCorner: { x: minX + 3, y: minY + 1 },
        },
      ],
    });
    expect(result).toEqual([
      // First column
      {
        tileCoordinates: topLeftCorner,
        topLeftCorner: { x: minX, y: minY },
        bottomRightCorner: { x: minX, y: minY },
      },
      {
        tileCoordinates: bottomLeftCorner,
        topLeftCorner: { x: minX, y: minY + 1 },
        bottomRightCorner: { x: minX, y: minY + 1 },
      },
      // Second and third column first line
      {
        tileCoordinates: topMiddleCorner,
        topLeftCorner: { x: minX + 1, y: minY },
        bottomRightCorner: { x: minX + 2, y: minY },
      },
      // Second and third column second line
      {
        tileCoordinates: bottomMiddleCorner,
        topLeftCorner: { x: minX + 1, y: minY + 1 },
        bottomRightCorner: { x: minX + 2, y: minY + 1 },
      },
      // Fourth column
      {
        tileCoordinates: topRightCorner,
        topLeftCorner: { x: minX + 3, y: minY },
        bottomRightCorner: { x: minX + 3, y: minY },
      },
      {
        tileCoordinates: bottomRightCorner,
        topLeftCorner: { x: minX + 3, y: minY + 1 },
        bottomRightCorner: { x: minX + 3, y: minY + 1 },
      },
    ]);
  });
});
