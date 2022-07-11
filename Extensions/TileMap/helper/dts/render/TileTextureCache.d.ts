import { integer } from '../model/CommonTypes';
import PIXI = GlobalPIXIModule.PIXI;
/**
 * A cache to access the tile images.
 *
 * It's created by {@link PixiTileMapHelper.parseAtlas}
 * and used by {@link PixiTileMapHelper.updatePixiTileMap}.
 */
export declare class TileTextureCache {
  private static readonly flippedHorizontallyFlag;
  private static readonly flippedVerticallyFlag;
  private static readonly flippedDiagonallyFlag;
  private readonly _textures;
  constructor();
  setTexture(
    tileId: integer,
    flippedHorizontally: boolean,
    flippedVertically: boolean,
    flippedDiagonally: boolean,
    texture: PIXI.Texture
  ): void;
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
  ): PIXI.Texture | undefined;
  /**
   * @return the Tiled tile global uniq identifier.
   */
  private _getGlobalId;
}
//# sourceMappingURL=TileTextureCache.d.ts.map
