import {
  EditableTileMap,
  EditableTileMapLayer,
  PixiTileMapHelper,
  TileDefinition,
  TileMap,
  TileMapManager,
  TileTextureCache,
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
      TiledTileset,
    };
  }
}
