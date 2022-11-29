import { integer } from "../types/commons";
import PIXI = GlobalPIXIModule.PIXI;
/**
 * A cache to access the tile images.
 *
 * It's created by {@link PixiTileMapHelper.parseAtlas}
 * and used by {@link PixiTileMapHelper.updatePixiTileMap}.
 */
export declare class TileTextureCache {
    private readonly _images;
    private readonly _textures;
    constructor();
    getImage(name: string): PIXI.Texture | undefined;
    /**
     * Return the texture to use for the tile with the specified id.
     *
     * @param tileId The tile identifier
     * @returns The texture for the given tile identifier.
     */
    getTexture(tileId: integer): PIXI.Texture | undefined;
    setImage(name: string, texture: PIXI.Texture): void;
    setTexture(tileId: integer, texture: PIXI.Texture): void;
}
//# sourceMappingURL=TextureCache.d.ts.map