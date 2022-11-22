import {
  EditableTileMap,
  EditableTileMapLayer,
  PixiTileMapHelper,
  TileDefinition,
  TileMap,
  TileMapManager,
  TileTextureCache,
  TiledTileMap,
  TiledTileset,
} from './dts/index';

declare global {
  namespace TileMapHelper {
    export {
      EditableTileMap,
      EditableTileMapLayer,
      PixiTileMapHelper,
      TileDefinition,
      TileMap,
      TileMapManager,
      TileTextureCache,
      TiledTileMap,
      TiledTileset,
    };
  }
}
