import { EditableTileMap } from '../../model/TileMapModel';
import { LDtkTileMap } from './LDtkFormat';
export declare namespace LDtkTileMapLoader {
  /**
   * Create a {@link EditableTileMap} from the LDtk JSON.
   *
   * @param ldtkTileMap A tile map exported from LDtk.
   * @param levelIndex The level of the tile map to load from.
   * @returns A {@link EditableTileMap}
   */
  function load(
    ldtkTileMap: LDtkTileMap,
    levelIndex: number
  ): EditableTileMap | null;
}
//# sourceMappingURL=LDtkTileMapLoader.d.ts.map
