import { TileTextureCache } from "../../render/TextureCache";
import { LDtkTileMap } from "./Format";
import PIXI = GlobalPIXIModule.PIXI;

export namespace PixiLDtkHelper {
  /**
   * Split an atlas image into Pixi textures.
   *
   * @param tiledMap A tile map exported from Tiled.
   * @param atlasTexture The texture containing the whole tile set.
   * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
   * @returns A textures cache.
   */
  export function parseAtlas(
    tiledMap: LDtkTileMap,
    atlasTexture: PIXI.BaseTexture<PIXI.Resource> | null,
    getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>
  ): TileTextureCache | null {
    return null;
  }
}