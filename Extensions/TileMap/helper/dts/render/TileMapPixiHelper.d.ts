import { integer, float } from '../model/CommonTypes';
import { EditableTileMap } from '../model/TileMapModel';
import { TileMapFileContent } from '../load/TileMapFileContent';
import { TileTextureCache } from './TileTextureCache';
export declare namespace PixiTileMapHelper {
  /**
   * Split an atlas image into Pixi textures.
   *
   * @param tiledMap A tile map exported from Tiled.
   * @param levelIndex The level of the tile map to load from.
   * @param atlasTexture The texture containing the whole tile set.
   * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
   * @returns A textures cache.
   */
  function parseAtlas(
    tileMap: TileMapFileContent,
    levelIndex: number,
    atlasTexture: PIXI.BaseTexture<PIXI.Resource> | null,
    getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>
  ): TileTextureCache | null;
  /**
   * Re-renders the tile map whenever its rendering settings have been changed
   *
   * @param untypedPixiTileMap the tile map renderer
   * @param tileMap the tile map model
   * @param textureCache the tile set textures
   * @param displayMode What to display:
   * - only a single layer (`index`)
   * - only visible layers (`visible`)
   * - everything (`all`).
   * @param layerIndex If `displayMode` is set to `index`, the layer index to be
   * displayed.
   */
  function updatePixiTileMap(
    untypedPixiTileMap: any,
    tileMap: EditableTileMap,
    textureCache: TileTextureCache,
    displayMode: 'index' | 'visible' | 'all',
    layerIndex: number
  ): void;
  /**
   * Re-renders the collision mask
   */
  function updatePixiCollisionMask(
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
