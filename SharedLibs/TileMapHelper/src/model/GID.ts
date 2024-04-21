import { integer } from "./CommonTypes";

export const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
export const FLIPPED_VERTICALLY_FLAG = 0x40000000;
export const FLIPPED_DIAGONALLY_FLAG = 0x20000000;

/**
 * Tile identifiers making to access flipping flags.
 */
export namespace FlippingHelper {
  export const tileIdMask = ~(
    FLIPPED_HORIZONTALLY_FLAG |
    FLIPPED_VERTICALLY_FLAG |
    FLIPPED_DIAGONALLY_FLAG
  );

  export function getTileId(tileId: integer): integer {
    return tileId & FlippingHelper.tileIdMask;
  }

  export function setFlippedHorizontally(
    tileId: integer,
    flippedHorizontally: boolean
  ): integer {
    tileId &= ~FLIPPED_HORIZONTALLY_FLAG;
    if (flippedHorizontally) {
      tileId |= FLIPPED_HORIZONTALLY_FLAG;
    }
    return tileId;
  }

  export function setFlippedVertically(
    tileId: integer,
    flippedVertically: boolean
  ): integer {
    tileId &= ~FLIPPED_VERTICALLY_FLAG;
    if (flippedVertically) {
      tileId |= FLIPPED_VERTICALLY_FLAG;
    }
    return tileId;
  }

  export function setFlippedDiagonally(
    tileId: integer,
    flippedDiagonally: boolean
  ): integer {
    tileId &= ~FLIPPED_DIAGONALLY_FLAG;
    if (flippedDiagonally) {
      tileId |= FLIPPED_DIAGONALLY_FLAG;
    }
    return tileId;
  }

  export function isFlippedHorizontally(tileId: integer): boolean {
    return (tileId & FLIPPED_HORIZONTALLY_FLAG) !== 0;
  }

  export function isFlippedVertically(tileId: integer): boolean {
    return (tileId & FLIPPED_VERTICALLY_FLAG) !== 0;
  }

  export function isFlippedDiagonally(tileId: integer): boolean {
    return (tileId & FLIPPED_DIAGONALLY_FLAG) !== 0;
  }
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
export function getPixiRotate(tileGID: integer) {
  const flippedDiagonally = FlippingHelper.isFlippedDiagonally(tileGID);
  const flippedHorizontally = FlippingHelper.isFlippedHorizontally(tileGID);
  const flippedVertically = FlippingHelper.isFlippedVertically(tileGID);

  let rotate = 0;
  if (flippedDiagonally) {
    rotate = 10;
    if (!flippedHorizontally && flippedVertically) {
      rotate = 2;
    } else if (flippedHorizontally && !flippedVertically) {
      rotate = 6;
    } else if (flippedHorizontally && flippedVertically) {
      rotate = 14;
    }
  } else {
    rotate = 0;
    if (!flippedHorizontally && flippedVertically) {
      rotate = 8;
    } else if (flippedHorizontally && !flippedVertically) {
      rotate = 12;
    } else if (flippedHorizontally && flippedVertically) {
      rotate = 4;
    }
  }
  return rotate;
}

export function getTileGID(
  tileId: integer,
  flippedHorizontally: boolean,
  flippedVertically: boolean,
  flippedDiagonally: boolean
): integer {
  let tileGID = tileId;
  if (flippedHorizontally) {
    tileGID |= FLIPPED_HORIZONTALLY_FLAG;
  }
  if (flippedVertically) {
    tileGID |= FLIPPED_VERTICALLY_FLAG;
  }
  if (flippedDiagonally) {
    tileGID |= FLIPPED_DIAGONALLY_FLAG;
  }
  return tileGID;
}
