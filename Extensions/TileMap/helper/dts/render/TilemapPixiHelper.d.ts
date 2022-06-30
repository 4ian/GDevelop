import { integer, float } from '../model/CommonTypes';
import { TiledMap } from '../tiled/Tiled';
import { EditableTileMap } from '../model/TileMapModel';
import { TileTextureCache } from './TileTextureCache';
import PIXI = GlobalPIXIModule.PIXI;
export declare class PixiTileMapHelper {
  /**
   * Parse a Tiled map JSON file,
   * exported from Tiled (https://www.mapeditor.org/)
   * into a generic tile map data (`GenericPixiTileMapData`).
   *
   * @param tiledData A JS object representing a map exported from Tiled.
   * @param atlasTexture
   * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
   * @returns A textures cache.
   */
  static parseAtlas(
    tiledData: TiledMap,
    atlasTexture: PIXI.BaseTexture<PIXI.Resource> | null,
    getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>
  ): TileTextureCache | null;
  /**
   * Re-renders the tilemap whenever its rendering settings have been changed
   *
   * @param pixiTileMap
   * @param tileMap
   * @param textureCache
   * @param displayMode What to display: only a single layer (`index`), only visible layers (`visible`) or everyhing (`all`).
   * @param layerIndex If `displayMode` is set to `index`, the layer index to be displayed.
   */
  static updatePixiTileMap(
    pixiTileMap: any,
    tileMap: EditableTileMap,
    textureCache: TileTextureCache,
    displayMode: 'index' | 'visible' | 'all',
    layerIndex: number
  ): void;
  /**
   * Re-renders the collision mask
   *
   * @param pixiTileMap
   * @param tileMap
   * @param textureCache
   * @param displayMode What to display: only a single layer (`index`), only visible layers (`visible`) or everyhing (`all`).
   * @param layerIndex If `displayMode` is set to `index`, the layer index to be displayed.
   */
  static updatePixiCollisionMask(
    pixiGraphics: PIXI.Graphics,
    tileMap: EditableTileMap,
    displayMode: 'index' | 'visible' | 'all',
    layerIndex: integer,
    typeFilter: string,
    outlineSize: integer,
    outlineColor: integer,
    outlineOpacity: float,
    fillColor: integer,
    fillOpacity: float
  ): void;
}
//# sourceMappingURL=TilemapPixiHelper.d.ts.map
