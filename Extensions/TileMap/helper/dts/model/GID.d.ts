import { integer } from './CommonTypes';
export declare const FLIPPED_HORIZONTALLY_FLAG = 2147483648;
export declare const FLIPPED_VERTICALLY_FLAG = 1073741824;
export declare const FLIPPED_DIAGONALLY_FLAG = 536870912;
/**
 * Tile identifiers making to access flipping flags.
 */
export declare namespace FlippingHelper {
  const tileIdMask: number;
  function getTileId(tileId: integer): integer;
  function setFlippedHorizontally(
    tileId: integer,
    flippedHorizontally: boolean
  ): integer;
  function setFlippedVertically(
    tileId: integer,
    flippedVertically: boolean
  ): integer;
  function setFlippedDiagonally(
    tileId: integer,
    flippedDiagonally: boolean
  ): integer;
  function isFlippedHorizontally(tileId: integer): boolean;
  function isFlippedVertically(tileId: integer): boolean;
  function isFlippedDiagonally(tileId: integer): boolean;
}
/**
 * Return the texture to use for the tile with the specified uid, which can contains
 * information about rotation in bits 32, 31 and 30
 * (see https://doc.mapeditor.org/en/stable/reference/tmx-map-format/).
 *
 * @param flippedHorizontally true if the tile is flipped horizontally.
 * @param flippedVertically true if the tile is flipped vertically.
 * @param flippedDiagonally true if the tile is flipped diagonally.
 * @returns the rotation "D8" number used by Pixi.
 * @see https://pixijs.io/examples/#/textures/texture-rotate.js
 */
export declare function getPixiRotate(tileGID: integer): number;
export declare function getTileGID(
  tileId: integer,
  flippedHorizontally: boolean,
  flippedVertically: boolean,
  flippedDiagonally: boolean
): integer;
//# sourceMappingURL=GID.d.ts.map
