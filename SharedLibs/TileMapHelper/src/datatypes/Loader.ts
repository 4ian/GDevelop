import type { TileMap } from "./Format";
import type { EditableTileMap } from "../model/Model";
import { TiledTileMapLoader } from "./tiled/Loader";
import { LDtkTileMapLoader } from "./ldtk/Loader";

export namespace TileMapLoader {
  export function load(pako: any, tileMap: TileMap): EditableTileMap | null {
    if(tileMap.kind === "ldtk") {
      return LDtkTileMapLoader.load(pako, tileMap.data);
    }
    if(tileMap.kind === "tiled") {
      return TiledTileMapLoader.load(pako, tileMap.data);
    }
    
    console.warn(
      "The loaded Tile Map data does not contain a 'tiledversion' or '__header__' key. Are you sure this file has been exported from Tiled (mapeditor.org) or LDtk (ldtk.io)?"
    );

    return null;
  }
}
