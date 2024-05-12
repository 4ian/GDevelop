import { TileTextureCache } from '../TileTextureCache';
import { TiledTileMap } from '../../load/tiled/TiledFormat';
export declare namespace TiledPixiHelper {
  /**
   * Split an atlas image into Pixi textures.
   *
   * @param tileMap A tile map exported from Tiled.
   * @param levelIndex The level of the tile map to load from.
   * @param atlasTexture The texture containing the whole tile set.
   * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
   * @returns A textures cache.
   */
  function parseAtlas(
    tileMap: TiledTileMap,
    levelIndex: number,
    atlasTexture: PIXI.Texture | null,
    getTexture: (textureName: string) => PIXI.Texture
  ): TileTextureCache | null;
}
//# sourceMappingURL=TiledPixiHelper.d.ts.map
