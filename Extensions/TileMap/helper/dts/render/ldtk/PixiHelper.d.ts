import { TileTextureCache } from '../TextureCache';
import { LDtkTileMap } from '../../types/LDtk';
import PIXI = GlobalPIXIModule.PIXI;
type Texture = PIXI.BaseTexture<PIXI.Resource>;
type TextureLoader = (textureName: string) => PIXI.BaseTexture<PIXI.Resource>;
export declare namespace PixiLDtkHelper {
  /**
   * Split an atlas image into Pixi textures.
   *
   * @param tileMap A tile map exported from LDtk.
   * @param levelIndex The level of the tile map to load from.
   * @param atlasTexture The texture containing the whole tile set.
   * @param getTexture A getter to load a texture.
   * @returns A textures cache.
   */
  function parseAtlas(
    tileMap: LDtkTileMap,
    levelIndex: number,
    atlasTexture: Texture | null,
    getTexture: TextureLoader
  ): TileTextureCache | null;
}
export {};
//# sourceMappingURL=PixiHelper.d.ts.map
