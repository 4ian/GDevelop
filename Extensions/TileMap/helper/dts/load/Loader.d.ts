import type { EditableTileMap } from "../model/Model";
import { TileMap } from "../types";
export declare namespace TileMapLoader {
    /**
     * Create a {@link EditableTileMap} from the raw data.
     *
     * @param tiledMap The data exported from Tiled/LDtk.
     * @param levelIndex The level of the tile map to load from.
     * @param pako The zlib library.
     * @returns A {@link EditableTileMap}
     */
    function load(tileMap: TileMap, levelIndex: number, pako: any): EditableTileMap | null;
}
//# sourceMappingURL=Loader.d.ts.map