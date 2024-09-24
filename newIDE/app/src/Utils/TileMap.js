// @flow
import { AffineTransformation } from './AffineTransformation';
import { type TileMapTileSelection } from '../InstancesEditor/TileSetVisualizer';

export type TileMapTilePatch = {|
  tileCoordinates?: {| x: number, y: number |},
  erase?: boolean,
  topLeftCorner: {| x: number, y: number |},
  bottomRightCorner: {| x: number, y: number |},
|};

export type TileSet = {|
  rowCount: number,
  columnCount: number,
  tileSize: number,
  atlasImage: string,
|};

const areSameCoordinates = (
  tileA: {| x: number, y: number |},
  tileB: {| x: number, y: number |}
): boolean => tileA.x === tileB.x && tileA.y === tileB.y;

/**
 * This method gathers tiles into a big rectangle when possible.
 * Hypothesis taken on the input list:
 * - The list contains only tiles of size 1
 * - The list is a flattened view of the grid in order to have the following grid:
 *   A, C, E, G
 *   B, D, F, H
 *   given as:
 *   [A, B, C, D, E, F, G, H]
 *
 * Note: This method won't handle perfectly nested rectangles. For instance, this layout:
 *   A D D D D D D D D D D D E
 *   B J J J J J J J J J J J G
 *   B J J J K K K K K J J J G
 *   B J J J K K K K K J J J G
 *   B J J J K K K K K J J J G
 *   B J J J J J J J J J J J G
 *   C F F F F F F F F F F F H
 * might result in something like:
 *   A ╾ ─ ─ ─ ─ D ─ ─ ─ ─ ╼ E
 *   ╿ J ╾ ─ ─ ─ J ─ ─ ─ ─ ╼ ╿
 *   │ ┌ ─ ┐ ┌ ─ ─ ─ ┐ ┌ ─ ┐ │
 *   B │ J │ │   K   │ │ J │ G
 *   │ │   │ └ ─ ─ ─ ┘ └ ─ ┘ │
 *   ╽ └ ─ ┘ ╾ ─ ─ J ─ ─ ─ ╼ ╽
 *   C ╾ ─ ─ ─ ─ F ─ ─ ─ ─ ╼ H
 */
export const optimizeTilesGridCoordinates = ({
  tileMapTilePatches,
  minX,
  minY,
  maxX,
  maxY,
}: {|
  tileMapTilePatches: TileMapTilePatch[],
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
|}): TileMapTilePatch[] => {
  const newTileMapTilePatches = [];

  while (tileMapTilePatches[0]) {
    const referencePatch = tileMapTilePatches[0];
    if (!referencePatch || !referencePatch.tileCoordinates) break;
    const referencePatchTileCoordinates = referencePatch.tileCoordinates;
    if (!referencePatchTileCoordinates) break;
    const patchesWithSameTile = tileMapTilePatches
      .slice(1)
      .filter(
        patch =>
          patch.tileCoordinates &&
          areSameCoordinates(
            referencePatchTileCoordinates,
            patch.tileCoordinates
          )
      );
    let expandRight = 0;
    let expandBottom = 0;
    const patchesOnRight = patchesWithSameTile.filter(
      patch =>
        patch.topLeftCorner.x > referencePatch.topLeftCorner.x &&
        patch.topLeftCorner.y === referencePatch.topLeftCorner.y &&
        areSameCoordinates(patch.topLeftCorner, patch.bottomRightCorner)
    );
    const patchesOnRightX = patchesOnRight.map(patch => patch.topLeftCorner.x);
    for (
      let deltaX = 1;
      deltaX <= maxX - referencePatch.topLeftCorner.x;
      deltaX++
    ) {
      if (patchesOnRightX.includes(deltaX + referencePatch.topLeftCorner.x))
        expandRight = deltaX;
      else break;
    }
    const patchesOnBottom = patchesWithSameTile.filter(
      patch =>
        patch.topLeftCorner.x === referencePatch.topLeftCorner.x &&
        patch.topLeftCorner.y > referencePatch.topLeftCorner.y &&
        areSameCoordinates(patch.topLeftCorner, patch.bottomRightCorner)
    );
    const patchesOnBottomY = patchesOnBottom.map(
      patch => patch.topLeftCorner.y
    );
    for (
      let deltaY = 1;
      deltaY <= maxY - referencePatch.topLeftCorner.y;
      deltaY++
    ) {
      if (patchesOnBottomY.includes(deltaY + referencePatch.topLeftCorner.y))
        expandBottom = deltaY;
      else break;
    }
    if (expandRight === 0 && expandBottom === 0) {
      newTileMapTilePatches.push(tileMapTilePatches.shift());
      continue;
    }

    let isWholeRectangleOfSameTile = true;
    const patchIndices = [];
    for (let deltaX = 0; deltaX <= expandRight; deltaX++) {
      for (let deltaY = 0; deltaY <= expandBottom; deltaY++) {
        if (deltaX === 0 && deltaY === 0) {
          patchIndices.push(0);
          continue;
        }

        const patchIndex = tileMapTilePatches.findIndex(
          patch =>
            patch.topLeftCorner.x === deltaX + referencePatch.topLeftCorner.x &&
            patch.topLeftCorner.y === deltaY + referencePatch.topLeftCorner.y &&
            patch.tileCoordinates &&
            areSameCoordinates(
              referencePatchTileCoordinates,
              patch.tileCoordinates
            )
        );
        if (patchIndex === -1) {
          isWholeRectangleOfSameTile = false;
          break;
        } else {
          patchIndices.push(patchIndex);
        }
      }
      if (!isWholeRectangleOfSameTile) break;
    }
    if (!isWholeRectangleOfSameTile) {
      newTileMapTilePatches.push(tileMapTilePatches.shift());
    } else {
      newTileMapTilePatches.push({
        tileCoordinates: referencePatchTileCoordinates,
        topLeftCorner: referencePatch.topLeftCorner,
        bottomRightCorner: {
          x: referencePatch.topLeftCorner.x + expandRight,
          y: referencePatch.topLeftCorner.y + expandBottom,
        },
      });
      patchIndices.sort((a, b) => (a > b ? -1 : 1));
      patchIndices.forEach(index => tileMapTilePatches.splice(index, 1));
    }
  }
  return newTileMapTilePatches;
};

export const isSelectionASingleTileRectangle = (
  tileMapTileSelection: TileMapTileSelection
): boolean => {
  return (
    tileMapTileSelection.kind === 'rectangle' &&
    tileMapTileSelection.coordinates.length === 2 &&
    tileMapTileSelection.coordinates[0].x ===
      tileMapTileSelection.coordinates[1].x &&
    tileMapTileSelection.coordinates[0].y ===
      tileMapTileSelection.coordinates[1].y
  );
};

/**
 * When flipping is activated, the tile texture should be flipped but
 * the tiles should be flipped as well in the selection
 * (the left tiles should be replaced by the right tiles if the horizontal flip
 * is activated).
 */
const getTileCorrespondingToFlippingInstructions = ({
  tileMapTileSelection,
  tileCoordinates,
}: {|
  tileMapTileSelection: TileMapTileSelection,
  tileCoordinates: {| x: number, y: number |},
|}): {| x: number, y: number |} => {
  if (tileMapTileSelection.kind === 'rectangle') {
    const selectionTopLeftCorner = tileMapTileSelection.coordinates[0];
    const selectionBottomRightCorner = tileMapTileSelection.coordinates[1];
    const selectionWidth =
      selectionBottomRightCorner.x - selectionTopLeftCorner.x + 1;
    const selectionHeight =
      selectionBottomRightCorner.y - selectionTopLeftCorner.y + 1;
    const deltaX = tileCoordinates.x - selectionTopLeftCorner.x;
    const deltaY = tileCoordinates.y - selectionTopLeftCorner.y;
    const newX =
      selectionTopLeftCorner.x +
      (tileMapTileSelection.flipHorizontally
        ? selectionWidth - deltaX - 1
        : deltaX);
    const newY =
      selectionTopLeftCorner.y +
      (tileMapTileSelection.flipVertically
        ? selectionHeight - deltaY - 1
        : deltaY);
    return { x: newX, y: newY };
  }
  return tileCoordinates;
};

/**
 * Returns the list of tiles corresponding to the user selection.
 * This method maps tiles from the tileset selection to a grid position on the
 * tilemap corresponding to the user selection. This operation is done coordinate
 * coordinate (on the tilemap) and is then optimized to gather rectangles of same tile
 * to speed up consequential operations.
 */
export const getTilesGridCoordinatesFromPointerSceneCoordinates = ({
  tileMapTileSelection,
  coordinates,
  tileSize,
  sceneToTileMapTransformation,
}: {|
  tileMapTileSelection: TileMapTileSelection,
  coordinates: Array<{| x: number, y: number |}>,
  tileSize: number,
  sceneToTileMapTransformation: AffineTransformation,
|}): TileMapTilePatch[] => {
  if (coordinates.length === 0) return [];

  if (coordinates.length === 1) {
    // One coordinate corresponds to the pointer over the canvas.
    const coordinatesInTileMapGrid = [0, 0];
    sceneToTileMapTransformation.transform(
      [coordinates[0].x, coordinates[0].y],
      coordinatesInTileMapGrid
    );
    const x = Math.floor(coordinatesInTileMapGrid[0] / tileSize);
    const y = Math.floor(coordinatesInTileMapGrid[1] / tileSize);
    let tileCoordinates;
    if (tileMapTileSelection.kind === 'rectangle') {
      const topLeftCorner = tileMapTileSelection.coordinates[0];
      tileCoordinates = getTileCorrespondingToFlippingInstructions({
        tileMapTileSelection,
        tileCoordinates: topLeftCorner,
      });
    }
    return [
      {
        erase: tileMapTileSelection.kind === 'erase',
        tileCoordinates,
        topLeftCorner: { x, y },
        bottomRightCorner: { x, y },
      },
    ];
  }

  const tilesCoordinatesInTileMapGrid: TileMapTilePatch[] = [];

  if (coordinates.length === 2) {
    const firstPointCoordinatesInTileMap = [0, 0];
    sceneToTileMapTransformation.transform(
      [coordinates[0].x, coordinates[0].y],
      firstPointCoordinatesInTileMap
    );
    const secondPointCoordinatesInTileMap = [0, 0];
    sceneToTileMapTransformation.transform(
      [coordinates[1].x, coordinates[1].y],
      secondPointCoordinatesInTileMap
    );
    const topLeftCornerCoordinatesInTileMap = [
      Math.min(
        firstPointCoordinatesInTileMap[0],
        secondPointCoordinatesInTileMap[0]
      ),
      Math.min(
        firstPointCoordinatesInTileMap[1],
        secondPointCoordinatesInTileMap[1]
      ),
    ];
    const bottomRightCornerCoordinatesInTileMap = [
      Math.max(
        firstPointCoordinatesInTileMap[0],
        secondPointCoordinatesInTileMap[0]
      ),
      Math.max(
        firstPointCoordinatesInTileMap[1],
        secondPointCoordinatesInTileMap[1]
      ),
    ];
    const topLeftCornerCoordinatesInTileMapGrid = [
      Math.floor(topLeftCornerCoordinatesInTileMap[0] / tileSize),
      Math.floor(topLeftCornerCoordinatesInTileMap[1] / tileSize),
    ];
    const bottomRightCornerCoordinatesInTileMapGrid = [
      Math.floor(bottomRightCornerCoordinatesInTileMap[0] / tileSize),
      Math.floor(bottomRightCornerCoordinatesInTileMap[1] / tileSize),
    ];
    if (tileMapTileSelection.kind === 'erase') {
      tilesCoordinatesInTileMapGrid.push({
        erase: true,
        topLeftCorner: {
          x: topLeftCornerCoordinatesInTileMapGrid[0],
          y: topLeftCornerCoordinatesInTileMapGrid[1],
        },
        bottomRightCorner: {
          x: bottomRightCornerCoordinatesInTileMapGrid[0],
          y: bottomRightCornerCoordinatesInTileMapGrid[1],
        },
      });
      return tilesCoordinatesInTileMapGrid;
    }
    if (tileMapTileSelection.kind === 'rectangle') {
      const selectionTopLeftCorner = tileMapTileSelection.coordinates[0];
      const selectionBottomRightCorner = tileMapTileSelection.coordinates[1];
      const selectionWidth =
        selectionBottomRightCorner.x - selectionTopLeftCorner.x + 1;
      const selectionHeight =
        selectionBottomRightCorner.y - selectionTopLeftCorner.y + 1;

      if (isSelectionASingleTileRectangle(tileMapTileSelection)) {
        tilesCoordinatesInTileMapGrid.push({
          tileCoordinates: getTileCorrespondingToFlippingInstructions({
            tileMapTileSelection,
            tileCoordinates: selectionTopLeftCorner,
          }),
          topLeftCorner: {
            x: topLeftCornerCoordinatesInTileMapGrid[0],
            y: topLeftCornerCoordinatesInTileMapGrid[1],
          },
          bottomRightCorner: {
            x: bottomRightCornerCoordinatesInTileMapGrid[0],
            y: bottomRightCornerCoordinatesInTileMapGrid[1],
          },
        });
        return tilesCoordinatesInTileMapGrid;
      }

      for (
        let x = topLeftCornerCoordinatesInTileMapGrid[0];
        x <= bottomRightCornerCoordinatesInTileMapGrid[0];
        x++
      ) {
        for (
          let y = topLeftCornerCoordinatesInTileMapGrid[1];
          y <= bottomRightCornerCoordinatesInTileMapGrid[1];
          y++
        ) {
          const deltaX = x - topLeftCornerCoordinatesInTileMapGrid[0];
          const deltaY = y - topLeftCornerCoordinatesInTileMapGrid[1];
          const invertedDeltaX =
            bottomRightCornerCoordinatesInTileMapGrid[0] - x;
          const invertedDeltaY =
            bottomRightCornerCoordinatesInTileMapGrid[1] - y;
          if (deltaX === 0 && deltaY === 0) {
            tilesCoordinatesInTileMapGrid.push({
              tileCoordinates: getTileCorrespondingToFlippingInstructions({
                tileMapTileSelection,
                tileCoordinates: selectionTopLeftCorner,
              }),
              topLeftCorner: { x, y },
              bottomRightCorner: { x, y },
            });
            continue;
          }
          if (invertedDeltaX === 0 && invertedDeltaY === 0) {
            tilesCoordinatesInTileMapGrid.push({
              tileCoordinates: getTileCorrespondingToFlippingInstructions({
                tileMapTileSelection,
                tileCoordinates: selectionBottomRightCorner,
              }),
              topLeftCorner: { x, y },
              bottomRightCorner: { x, y },
            });
            continue;
          }

          let tileX, tileY;
          if (deltaX === 0 || selectionWidth === 1) {
            tileX = selectionTopLeftCorner.x;
          } else if (invertedDeltaX === 0 || selectionWidth === 2) {
            tileX = selectionBottomRightCorner.x;
          } else {
            tileX =
              ((deltaX - 1) % (selectionWidth - 2)) +
              1 +
              selectionTopLeftCorner.x;
          }
          if (deltaY === 0 || selectionHeight === 1) {
            tileY = selectionTopLeftCorner.y;
          } else if (invertedDeltaY === 0 || selectionHeight === 2) {
            tileY = selectionBottomRightCorner.y;
          } else {
            tileY =
              ((deltaY - 1) % (selectionHeight - 2)) +
              1 +
              selectionTopLeftCorner.y;
          }

          tilesCoordinatesInTileMapGrid.push({
            tileCoordinates: getTileCorrespondingToFlippingInstructions({
              tileMapTileSelection,
              tileCoordinates: { x: tileX, y: tileY },
            }),
            topLeftCorner: { x, y },
            bottomRightCorner: { x, y },
          });
        }
      }
      if (selectionWidth >= 4 && selectionHeight >= 4) {
        // In this case, each cell in the grid will contain a tile that is different
        // from all the adjacent ones, so there is no need to optimize the list.
        return tilesCoordinatesInTileMapGrid;
      }
      return optimizeTilesGridCoordinates({
        tileMapTilePatches: tilesCoordinatesInTileMapGrid,
        minX: topLeftCornerCoordinatesInTileMapGrid[0],
        minY: topLeftCornerCoordinatesInTileMapGrid[1],
        maxX: bottomRightCornerCoordinatesInTileMapGrid[0],
        maxY: bottomRightCornerCoordinatesInTileMapGrid[1],
      });
    }
  }
  return [];
};

export const getTileSet = (object: gdObject): TileSet => {
  const objectConfigurationProperties = object
    .getConfiguration()
    .getProperties();
  const columnCount = parseFloat(
    objectConfigurationProperties.get('columnCount').getValue()
  );
  const rowCount = parseFloat(
    objectConfigurationProperties.get('rowCount').getValue()
  );
  const tileSize = parseFloat(
    objectConfigurationProperties.get('tileSize').getValue()
  );
  const atlasImage = objectConfigurationProperties.get('atlasImage').getValue();
  return { rowCount, columnCount, tileSize, atlasImage };
};

export const isTileSetBadlyConfigured = ({
  rowCount,
  columnCount,
  tileSize,
  atlasImage,
}: TileSet) => {
  return (
    !Number.isInteger(columnCount) ||
    columnCount <= 0 ||
    !Number.isInteger(rowCount) ||
    rowCount <= 0
  );
};
