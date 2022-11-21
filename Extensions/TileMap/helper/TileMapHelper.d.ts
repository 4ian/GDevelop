import {
  EditableTileMap,
  EditableTileMapLayer,
  PixiTileMapHelper,
  TileDefinition,
  TileMap,
  TileMapManager,
  TileTextureCache,
  TiledTileMap,
  TiledTileSet,
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
      TiledTileSet,
    };
  }
}
