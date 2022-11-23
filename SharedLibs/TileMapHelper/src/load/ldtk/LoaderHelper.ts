const PIXI_ROTATES = [0, 12, 8, 4];

export function getLDtkTileId(tileSetId: number, tileId: number): number {
  // Crude bit shifting (for speed)
  let uniqueId = tileSetId << 16;
  uniqueId += tileId;
  return uniqueId;

  // Cantor Pairing
  // return (0.5 * (tileSetId + tileId) * (tileSetId + tileId + 1)) + tileId;
}

export function getPixiRotateFromLDtk(flip: number): number {
  return PIXI_ROTATES[flip];
}
