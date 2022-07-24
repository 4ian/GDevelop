import {
  EditableTileMap,
  EditableTileMapLayer,
  TileDefinition,
  TiledMap,
  TiledTileset,
  TileMapManager,
  TileTextureCache,
  PixiTileMapHelper,
} from './dts/index';

declare global {
  namespace TileMapHelper {
    export { EditableTileMap };
    export { EditableTileMapLayer };
    export { TileDefinition };
    export { TiledMap };
    export { TiledTileset };
    export { TileMapManager };
    export { TileTextureCache };
    export { PixiTileMapHelper };
  }
}
