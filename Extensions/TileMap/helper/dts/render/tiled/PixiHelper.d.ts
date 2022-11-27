import { TileTextureCache } from "../TextureCache";
import { TiledTileMap } from "../../types/Tiled";
import PIXI = GlobalPIXIModule.PIXI;
export declare namespace PixiTiledHelper {
    /**
     * Split an atlas image into Pixi textures.
     *
     * @param tileMap A tile map exported from Tiled.
     * @param levelIndex The level of the tile map to load from.
     * @param atlasTexture The texture containing the whole tile set.
     * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
     * @returns A textures cache.
     */
    function parseAtlas(tileMap: TiledTileMap, levelIndex: number, atlasTexture: PIXI.BaseTexture<PIXI.Resource> | null, getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>): TileTextureCache | null;
}
//# sourceMappingURL=PixiHelper.d.ts.map