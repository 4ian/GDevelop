import type { EditableTileMap } from "../model/Model";
import { TileMap } from "../types";
import { LDtkTileMapLoader } from "./ldtk/Loader";
import { TiledTileMapLoader } from "./tiled/Loader";

export namespace TileMapLoader {
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
