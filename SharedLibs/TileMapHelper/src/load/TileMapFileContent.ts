import { LDtkTileMap } from "../load/ldtk/LDtkFormat";
import { TiledTileMap } from "../load/tiled/TiledFormat";

export type TileMapFileContent =
  | {
      kind: "tiled";
      data: TiledTileMap;
    }
  | {
      kind: "ldtk";
      data: LDtkTileMap;
    };
