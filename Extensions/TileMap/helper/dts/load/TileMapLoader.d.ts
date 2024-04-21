import type { EditableTileMap } from '../model/TileMapModel';
import { TileMapFileContent } from './TileMapFileContent';
export declare namespace TileMapLoader {
  /**
   * Create a {@link EditableTileMap} from the raw data.
   *
   * @param tileMapFileContent The data exported from Tiled/LDtk.
   * @param levelIndex The level of the tile map to load from.
   * @param pako The zlib library.
   * @returns A {@link EditableTileMap}
   */
  function load(
    tileMapFileContent: TileMapFileContent,
    levelIndex: number,
    pako: any
  ): EditableTileMap | null;
}
//# sourceMappingURL=TileMapLoader.d.ts.map
