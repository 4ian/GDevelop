export function getUniqueId(tileSetId: number, tileId: number): number {
  // return tileId;
  
  // Crude bit shifting (for speed)
  let uniqueId = tileSetId << 16;
  uniqueId += tileId;
  return uniqueId;
  
  // Cantor Pairing
  // return (0.5 * (tileSetId + tileId) * (tileSetId + tileId + 1)) + tileId;
}