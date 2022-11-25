import type { EditableTileMap } from "../model/Model";
import { TileMap } from "../types";
import { LDtkTileMapLoader } from "./ldtk/Loader";
import { TiledTileMapLoader } from "./tiled/Loader";

export namespace TileMapLoader {
  /**
   * Create a {@link EditableTileMap} from the raw data.
   *
   * @param tiledMap The data exported from Tiled/LDtk.
   * @param levelIndex The level of the tile map to load from.
   * @param pako The zlib library.
   * @returns A {@link EditableTileMap}
   */
  export function load(
    tileMap: TileMap,
    levelIndex: number,
    pako: any
  ): EditableTileMap | null {
    if (tileMap.kind === "ldtk") {
      return LDtkTileMapLoader.load(tileMap.data, levelIndex);
    }
    if (tileMap.kind === "tiled") {
      return TiledTileMapLoader.load(tileMap.data, pako);
    }

    console.warn(
      "The loaded Tile Map data does not contain a 'tiledversion' or '__header__' key. Are you sure this file has been exported from Tiled (mapeditor.org) or LDtk (ldtk.io)?"
    );

    return null;
  }
}
