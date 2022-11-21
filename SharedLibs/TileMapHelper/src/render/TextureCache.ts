import { integer } from "../model/CommonTypes";

import PIXI = GlobalPIXIModule.PIXI;

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

  private readonly _textures: Map<integer, PIXI.Texture>;

  constructor() {
    this._textures = new Map<integer, PIXI.Texture>();
  }

  setTexture(
    tileId: integer,
    flippedHorizontally: boolean,
    flippedVertically: boolean,
    flippedDiagonally: boolean,
    texture: PIXI.Texture
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
   * Return the texture to use for the tile with the specified id.
   *
   * @param tileId The tile identifier
   * @returns The texture for the given tile identifier.
   */
  findTileTexture(tileId: integer): PIXI.Texture | undefined {
    return this._textures.get(tileId);
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
  getPixiRotate(
    flippedHorizontally: boolean,
    flippedVertically: boolean,
    flippedDiagonally: boolean
  ): number {
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
