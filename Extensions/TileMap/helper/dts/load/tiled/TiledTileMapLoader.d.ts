import { EditableTileMap } from '../../model/TileMapModel';
import { TiledTileMap } from './TiledFormat';
/**
 * It creates a {@link EditableTileMap} from a Tiled JSON.
 */
export declare namespace TiledTileMapLoader {
  /**
   * Create a {@link EditableTileMap} from the Tiled JSON.
   *
   * @param tiledTileMap A tile map exported from Tiled.
   * @param pako The zlib library.
   * @returns A {@link EditableTileMap}
   */
  function load(tiledTileMap: TiledTileMap, pako: any): EditableTileMap | null;
}
//# sourceMappingURL=TiledTileMapLoader.d.ts.map
