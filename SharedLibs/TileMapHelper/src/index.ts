/**
 * @packageDocumentation
 * @module TileMapHelper
 */

import { TileMapManager } from "./TileMapManager";
import { PixiTileMapHelper } from "./PixiTileMapHelper";
import { TiledMap, TiledTileset } from "./tiled/Tiled";
import { EditableTileMap, EditableTileMapLayer, TileDefinition } from "./TileMapModel";
import { TileTextureCache } from "./TileTextureCache";

export * from "./CommonTypes";

export { TileMapManager };
export { PixiTileMapHelper };
export { TileTextureCache };

export { EditableTileMap };
export { EditableTileMapLayer };
export { TileDefinition };

export { TiledMap };
export { TiledTileset };

// TODO This should be added in the packaged library for the global import to work?
//
// const GlobalTileMapHelperModule = {
//     TileMapManager,
//     PixiTileMapHelper,
//     EditableTileMap,
//     EditableTileMapLayer,
//     TileDefinition,
//     TileTextureCache
// }