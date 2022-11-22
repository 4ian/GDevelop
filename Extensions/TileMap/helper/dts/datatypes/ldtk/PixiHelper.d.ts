import { TileTextureCache } from "../../render/TextureCache";
import { LDtkTileMap } from "./Format";
import PIXI = GlobalPIXIModule.PIXI;
type Texture = PIXI.BaseTexture<PIXI.Resource>;
type TextureLoader = (textureName: string) => PIXI.BaseTexture<PIXI.Resource>;
export declare namespace PixiLDtkHelper {
    /**
     * Split an atlas image into Pixi textures.
     *
     * @param tileMap A tile map exported from Tiled.
     * @param atlasTexture The texture containing the whole tile set.
     * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
     * @returns A textures cache.
     */
    function parseAtlas(tileMap: LDtkTileMap, atlasTexture: Texture | null, getTexture: TextureLoader): TileTextureCache | null;
}
export {};
//# sourceMappingURL=PixiHelper.d.ts.map