import { EditableTileMap } from "../../model/Model";
import { LDtkTileMap } from "../../types/LDtk";
export declare namespace LDtkTileMapLoader {
    /**
     * Create a {@link EditableTileMap} from the LDtk JSON.
     *
     * @param tiledMap A tile map exported from LDtk.
     * @param levelIndex The level of the tile map to load from.
     * @returns A {@link EditableTileMap}
     */
    function load(tileMap: LDtkTileMap, levelIndex: number): EditableTileMap | null;
}
//# sourceMappingURL=Loader.d.ts.map