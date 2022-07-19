import { integer } from "../model/CommonTypes";
import type { Texture } from "GDJS/Runtime/pixi-renderers/pixi";

/**
 * A cache to access the tile images.
 *
 * It's created by {@link PixiTileMapHelper.parseAtlas}
 * and used by {@link PixiTileMapHelper.updatePixiTileMap}.
 */
export class TileTextureCache {
  private static readonly flippedHorizontallyFlag = 0x80000000;
  private static readonly flippedVerticallyFlag = 0x40000000;
  private static readonly flippedDiagonallyFlag = 0x20000000;

  private readonly _textures: Map<integer, Texture>;

  constructor() {
    this._textures = new Map<integer, Texture>();
  }

  setTexture(
    tileId: integer,
    flippedHorizontally: boolean,
    flippedVertically: boolean,
    flippedDiagonally: boolean,
    texture: Texture
  ): void {
    let globalTileUid = this._getGlobalId(
      tileId,
      flippedHorizontally,
      flippedVertically,
      flippedDiagonally
    );
    this._textures.set(globalTileUid, texture);
  }

  /**
   * Return the texture to use for the tile with the specified uid, which can contains
   * information about rotation in bits 32, 31 and 30
   * (see https://doc.mapeditor.org/en/stable/reference/tmx-map-format/).
   *
   * @param tileId The tile identifier
   * @param flippedHorizontally true if the tile is flipped horizontally.
   * @param flippedVertically true if the tile is flipped vertically.
   * @param flippedDiagonally true if the tile is flipped diagonally.
   * @returns The texture for the given tile identifier and orientation.
   */
  findTileTexture(
    tileId: integer,
    flippedHorizontally: boolean,
    flippedVertically: boolean,
    flippedDiagonally: boolean
  ): Texture | undefined {
    let globalTileUid = this._getGlobalId(
      tileId,
      flippedHorizontally,
      flippedVertically,
      flippedDiagonally
    );

    if (this._textures.has(globalTileUid)) {
      return this._textures.get(globalTileUid);
    }
    // If the texture is not in the cache, it's potentially because its ID
    // is a flipped/rotated version of another ID.
    const unflippedTexture = this._textures.get(tileId);
    // If the tile still can't be found in the cache, it means the ID we got
    // is invalid.
    if (!unflippedTexture) return undefined;

    // Clone the unflipped texture and save it in the cache
    const frame = unflippedTexture.frame.clone();
    const orig = unflippedTexture.orig.clone();
    if (flippedDiagonally) {
      const width = orig.width;
      orig.width = orig.height;
      orig.height = width;
    }
    const trim = orig.clone();

    // Get the rotation "D8" number.
    // See https://pixijs.io/examples/#/textures/texture-rotate.js
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

    const flippedTexture = new PIXI.Texture(
      unflippedTexture.baseTexture,
      frame,
      orig,
      trim,
      rotate
    );
    this._textures.set(globalTileUid, flippedTexture);
    return flippedTexture;
  }

  /**
   * @return the Tiled tile global uniq identifier.
   */
  private _getGlobalId(
    tileId: integer,
    flippedHorizontally: boolean,
    flippedVertically: boolean,
    flippedDiagonally: boolean
  ): integer {
    let globalTileUid = tileId;
    if (flippedHorizontally) {
      globalTileUid |= TileTextureCache.flippedHorizontallyFlag;
    }
    if (flippedVertically) {
      globalTileUid |= TileTextureCache.flippedVerticallyFlag;
    }
    if (flippedDiagonally) {
      globalTileUid |= TileTextureCache.flippedDiagonallyFlag;
    }
    return globalTileUid;
  }
}
