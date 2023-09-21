import { integer } from '../model/CommonTypes';
/**
 * A cache to access the tile images.
 *
 * It's created by {@link PixiTileMapHelper.parseAtlas}
 * and used by {@link PixiTileMapHelper.updatePixiTileMap}.
 */
export declare class TileTextureCache {
  private readonly _levelBackgroundTextures;
  private readonly _textures;
  constructor();
  setTexture(tileId: integer, texture: PIXI.Texture): void;
  /**
   * Return the texture to use for the tile with the specified id.
   *
   * @param tileId The tile identifier
   * @returns The texture for the given tile identifier.
   */
  getTexture(tileId: integer): PIXI.Texture | undefined;
  getLevelBackgroundTexture(name: string): PIXI.Texture | undefined;
  setLevelBackgroundTexture(name: string, texture: PIXI.Texture): void;
}
//# sourceMappingURL=TileTextureCache.d.ts.map
