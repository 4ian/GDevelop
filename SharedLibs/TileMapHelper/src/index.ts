/**
 * @packageDocumentation
 * @module TileMapHelper
 */

import { TiledMap, TiledTileset } from "./tiled/Tiled";
import {
  EditableTileMap,
  EditableTileMapLayer,
  TileDefinition,
} from "./TileMapModel";

// These use PIXI and make errors on rollup.
import { TileMapManager } from "./TileMapManager";
import { TileTextureCache } from "./TileTextureCache";
import { PixiTileMapHelper } from "./PixiTileMapHelper";

export * from "./CommonTypes";

export { EditableTileMap };
export { EditableTileMapLayer };
export { TileDefinition };

export { TiledMap };
export { TiledTileset };

export { TileMapManager };
export { TileTextureCache };
export { PixiTileMapHelper };

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
