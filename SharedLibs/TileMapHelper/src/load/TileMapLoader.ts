import type { EditableTileMap } from "../model/TileMapModel";
import { TileMapFileContent } from "./TileMapFileContent";
import { LDtkTileMapLoader } from "./ldtk/LDtkTileMapLoader";
import { TiledTileMapLoader } from "./tiled/TiledTileMapLoader";

export namespace TileMapLoader {
  /**
   * Create a {@link EditableTileMap} from the raw data.
   *
   * @param tileMapFileContent The data exported from Tiled/LDtk.
   * @param levelIndex The level of the tile map to load from.
   * @param pako The zlib library.
   * @returns A {@link EditableTileMap}
   */
  export function load(
    tileMapFileContent: TileMapFileContent,
    levelIndex: number,
    pako: any
  ): EditableTileMap | null {
    if (tileMapFileContent.kind === "ldtk") {
      return LDtkTileMapLoader.load(tileMapFileContent.data, levelIndex);
    }
    if (tileMapFileContent.kind === "tiled") {
      return TiledTileMapLoader.load(tileMapFileContent.data, pako);
    }

    console.warn(
      "The loaded Tile Map data does not contain a 'tiledversion' or '__header__' key. Are you sure this file has been exported from Tiled (mapeditor.org) or LDtk (ldtk.io)?"
    );

    return null;
  }
}
