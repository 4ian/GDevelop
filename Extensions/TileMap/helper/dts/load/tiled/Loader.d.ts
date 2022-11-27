import { EditableTileMap } from "../../model/Model";
import { TiledTileMap } from "../../types/Tiled";
/**
 * It creates a {@link EditableTileMap} from a Tiled JSON.
 */
export declare namespace TiledTileMapLoader {
    /**
     * Create a {@link EditableTileMap} from the Tiled JSON.
     *
     * @param tiledMap A tile map exported from Tiled.
     * @param pako The zlib library.
     * @returns A {@link EditableTileMap}
     */
    function load(tileMap: TiledTileMap, pako: any): EditableTileMap | null;
}
//# sourceMappingURL=Loader.d.ts.map