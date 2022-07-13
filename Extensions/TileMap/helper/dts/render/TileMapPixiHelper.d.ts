import { integer, float } from '../model/CommonTypes';
import { TiledMap } from '../tiled/TiledFormat';
import { EditableTileMap } from '../model/TileMapModel';
import { TileTextureCache } from './TileTextureCache';
import PIXI = GlobalPIXIModule.PIXI;
export declare class PixiTileMapHelper {
  /**
   * Split an atlas image into Pixi textures.
   *
   * @param tiledMap A tile map exported from Tiled.
   * @param atlasTexture The texture containing the whole tile set.
   * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
   * @returns A textures cache.
   */
  static parseAtlas(
    tiledMap: TiledMap,
    atlasTexture: PIXI.BaseTexture<PIXI.Resource> | null,
    getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>
  ): TileTextureCache | null;
  /**
   * Re-renders the tile map whenever its rendering settings have been changed
   *
   * @param pixiTileMap the tile map renderer
   * @param tileMap the tile map model
   * @param textureCache the tile set textures
   * @param displayMode What to display:
   * - only a single layer (`index`)
   * - only visible layers (`visible`)
   * - everything (`all`).
   * @param layerIndex If `displayMode` is set to `index`, the layer index to be
   * displayed.
   */
  static updatePixiTileMap(
    untypedPixiTileMap: any,
    tileMap: EditableTileMap,
    textureCache: TileTextureCache,
    displayMode: 'index' | 'visible' | 'all',
    layerIndex: number
  ): void;
  /**
   * Re-renders the collision mask
   */
  static updatePixiCollisionMask(
    pixiGraphics: PIXI.Graphics,
    tileMap: EditableTileMap,
    typeFilter: string,
    outlineSize: integer,
    outlineColor: integer,
    outlineOpacity: float,
    fillColor: integer,
    fillOpacity: float
  ): void;
}
//# sourceMappingURL=TileMapPixiHelper.d.ts.map
