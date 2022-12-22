import { LDtkTileMap } from "../load/ldtk/LDtkFormat";
import { TiledTileMap } from "../load/tiled/TiledFormat";

export type TileMap =
  | {
      kind: "tiled";
      data: TiledTileMap;
    }
  | {
      kind: "ldtk";
      data: LDtkTileMap;
    };
